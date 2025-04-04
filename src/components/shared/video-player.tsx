/* eslint-disable react/display-name */
import * as React from "react";
import { toast } from "sonner";
import Hls from "hls.js";

import { cn } from "@/lib";

export interface VideoPlayerProps {
	src: string;
	autoPlay?: boolean;
	className?: string;
	onReady?: (duration?: number) => void;
	onError?: (error: unknown) => void;
}

export const VideoPlayer = React.memo(
	({ src, autoPlay = false, className, onReady, onError }: VideoPlayerProps) => {
		const videoRef = React.useRef<HTMLVideoElement | null>(null);
		const hlsRef = React.useRef<Hls | null>(null);

		const preventContextMenu = (e: React.MouseEvent) => {
			e.preventDefault();
			return false;
		};

		// useEffect to handle video playing (hls or not) and errors
		React.useEffect(() => {
			const video = videoRef.current;
			if (!video) return;

			// Function to handle media errors
			const handleMediaError = (error: unknown) => {
				console.error("Error playing media:", error);
				onError?.(error);
			};

			// Check if the source is an HLS stream or a regular video file
			const isHLSStream = src.includes(".m3u8");

			// Handle HLS streams
			if (isHLSStream) {
				if (Hls.isSupported()) {
					const hls = new Hls({
						enableWorker: true,
						lowLatencyMode: true,
						autoStartLoad: true,
					});

					hlsRef.current = hls;
					hls.loadSource(src);
					hls.attachMedia(video);

					hls.on(Hls.Events.MANIFEST_PARSED, () => {
						if (autoPlay) {
							video.play().catch(handleMediaError);
						}
						onReady?.();
					});

					hls.on(Hls.Events.ERROR, (_event, data) => {
						console.error("HLS error:", data);
						onError?.(data);

						if (data.fatal) {
							switch (data.type) {
								case Hls.ErrorTypes.NETWORK_ERROR:
									toast.error("Fatal network error encountered, trying to recover");
									hls.startLoad();
									break;
								case Hls.ErrorTypes.MEDIA_ERROR:
									toast.error("Fatal media error encountered, trying to recover");
									hls.recoverMediaError();
									break;
								default:
									toast.error("Fatal error encountered, trying to recover");
									hls.recoverMediaError();
									break;
							}
						}
					});

					return () => {
						hlsRef.current = null;
						hls.destroy();
					};
				} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
					// Native HLS support (Safari)
					video.src = src;
					if (autoPlay) {
						video.play().catch(handleMediaError);
					}
					video.addEventListener("loadedmetadata", () => {
						onReady?.();
					});
					return;
				} else {
					const error = new Error("HLS is not supported in this browser");
					console.error(error);
					onError?.(error);
					return;
				}
			} else {
				// Handle regular video files (MP4, WebM, etc.)
				video.src = src;

				video.addEventListener("loadedmetadata", () => {
					onReady?.();
					if (autoPlay) {
						video.play().catch(handleMediaError);
					}
				});

				video.addEventListener("error", () => {
					const error = new Error(`Error loading video: ${video.error?.message || "Unknown error"}`);
					console.error(error);
					onError?.(error);
				});
			}

			return () => {
				if (hlsRef.current) {
					hlsRef.current.destroy();
					hlsRef.current = null;
				}
				video.pause();
				video.src = "";
				video.load();
			};
		}, [autoPlay, onError, onReady, src]);

		return (
			<video
				ref={videoRef}
				width="100%"
				height="auto"
				onContextMenu={preventContextMenu}
				playsInline
				controls
				preload="metadata"
				controlsList="nodownload"
				className={cn("h-full w-full max-w-full rounded-lg object-cover", className)}>
				Your browser does not support the video tag.
			</video>
		);
	}
);
