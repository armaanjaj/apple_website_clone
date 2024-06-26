import { hightlightsSlides } from "@/constants";
import { pauseImg, playImg, replayImg } from "@/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const VideoCarousel = () => {
    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);

    // video and indicator
    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false,
    });

    const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

    useGSAP(() => {
        gsap.to(`#slider`, {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: "power2.inOut",
        });

        gsap.to(`#video-${videoId}`, {
            scrollTrigger: {
                trigger: `#video-${videoId}`,
                toggleActions: "restart none none none",
            },
            onComplete: () => {
                setVideo((pre) => ({
                    ...pre,
                    startPlay: true,
                    isPlaying: true,
                }));
            },
        });
    }, [videoId]);

    const handleLoadedMetadata = (i, e) => {
        if (i === videoId) {
            videoRef.current[i].play();
        }
    };

    useEffect(() => {
        if (startPlay) {
            videoRef.current[videoId].play();
        }
    }, [startPlay, videoId]);

    useEffect(() => {
        let currentProgress = 0;
        let span = videoSpanRef.current;

        if (span[videoId]) {
            let anim = gsap.to(span[videoId], {
                onUpdate: () => {
                    const progress = Math.ceil(anim.progress() * 100);
                    if (progress !== currentProgress) {
                        currentProgress = progress;
                        gsap.to(videoDivRef.current[videoId], {
                            width:
                                window.innerWidth < 760
                                    ? "10vw"
                                    : window.innerWidth < 1200
                                    ? "10vw"
                                    : "4vw",
                        });
                        gsap.to(videoSpanRef.current[videoId], {
                            width: `${currentProgress}%`,
                            backgroundColor: "white",
                        });
                    }
                },
                onComplete: () => {
                    if (isPlaying) {
                        gsap.to(videoDivRef.current[videoId], {
                            width: "12px",
                        });
                        gsap.to(videoSpanRef.current[videoId], {
                            backgroundColor: "#afafaf",
                        });
                    }
                },
            });

            if (videoId === 0) {
                anim.restart();
            }

            const animUpdate = () => {
                anim.progress(
                    videoRef.current[videoId].currentTime /
                        hightlightsSlides[videoId].videoDuration
                );
            };

            if (isPlaying) {
                gsap.ticker.add(animUpdate);
            } else {
                gsap.ticker.remove(animUpdate);
            }
        }
    }, [videoId, startPlay, isPlaying]);

    const handleProcess = (type, i) => {
        switch (type) {
            case "video-end":
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    isEnd: true,
                    videoId: i + 1,
                }));
                break;

            case "video-last":
                setVideo((pre) => ({
                    ...pre,
                    isLastVideo: true,
                }));
                break;

            case "video-reset":
                setVideo((pre) => ({
                    ...pre,
                    isLastVideo: false,
                    videoId: 0,
                }));
                break;

            case "play":
                setVideo((pre) => ({
                    ...pre,
                    isPlaying: true,
                }));
                videoRef.current[videoId].play();
                break;

            case "pause":
                setVideo((pre) => ({
                    ...pre,
                    isPlaying: false,
                }));
                videoRef.current[videoId].pause();
                break;

            default:
                break;
        }
    };

    return (
        <>
            <div className="flex items-center">
                {hightlightsSlides.map((list, i) => (
                    <div key={list.id} id="slider" className="sm:pr-20 pr-10">
                        <div className="video-carousel_container">
                            <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                                <video
                                    id={`video-${i}`}
                                    playsInline={true}
                                    preload="auto"
                                    muted
                                    ref={(el) => (videoRef.current[i] = el)}
                                    onPlay={() => {
                                        setVideo((prevVideo) => ({
                                            ...prevVideo,
                                            isPlaying: true,
                                        }));
                                    }}
                                    onLoadedMetadata={(e) =>
                                        handleLoadedMetadata(i, e)
                                    }
                                    onEnded={() =>
                                        i !== hightlightsSlides.length - 1
                                            ? handleProcess("video-end", i)
                                            : handleProcess("video-last")
                                    }
                                    className={`${
                                        list.id === 2 && "translate-x-44"
                                    } pointer-events-none`}
                                >
                                    <source src={list.video} type="video/mp4" />
                                </video>
                            </div>
                            <div className="absolute top-12 left-[5%] z-10">
                                {list.textLists.map((text) => (
                                    <p
                                        key={text}
                                        className="md:text-2xl text-xl font-medium"
                                    >
                                        {text}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative flex-center mt-10">
                <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
                    {videoRef.current.map((_, i) => (
                        <span
                            key={i}
                            ref={(el) => (videoDivRef.current[i] = el)}
                            className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
                        >
                            <span
                                className="absolute h-full w-full rounded-full"
                                ref={(el) => (videoSpanRef.current[i] = el)}
                            />
                        </span>
                    ))}
                </div>

                <button className="control-btn">
                    <Image
                        width={18}
                        height={18}
                        src={
                            isLastVideo
                                ? replayImg
                                : !isPlaying
                                ? playImg
                                : pauseImg
                        }
                        alt={
                            isLastVideo
                                ? "replay"
                                : !isPlaying
                                ? "play"
                                : "pause"
                        }
                        onClick={
                            isLastVideo
                                ? () => handleProcess("video-reset")
                                : !isPlaying
                                ? () => handleProcess("play")
                                : () => handleProcess("pause")
                        }
                    />
                </button>
            </div>
        </>
    );
};

export default VideoCarousel;
