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
		// Tracks how many times we've retried after a GCS 404.
		// The backend may emit 'completed' slightly before the HLS file is
		// publicly accessible, so we silently retry up to MAX_404_RETRIES times.
		const notFoundRetryRef = React.useRef(0);
		const MAX_404_RETRIES = 3;
		const RETRY_DELAY_MS = 3000;

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
			// Reset retry counter each time src changes (new URL after upload, etc.)
			notFoundRetryRef.current = 0;

			// Factory — used for both the initial HLS instance and each retry so
			// that every instance has the same error handler and retry counter.
			const createHls = (video: HTMLVideoElement) => {
				const hls = new Hls({ enableWorker: true, lowLatencyMode: true, autoStartLoad: true });
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
							case Hls.ErrorTypes.NETWORK_ERROR: {
								const httpStatus = data.response?.code;
								const isClientError = httpStatus && httpStatus >= 400 && httpStatus < 500;
								if (isClientError) {
									if (notFoundRetryRef.current < MAX_404_RETRIES) {
										// Backend may be slightly behind on GCS propagation.
										// Destroy this instance and recreate after a delay.
										notFoundRetryRef.current += 1;
										hls.destroy();
										hlsRef.current = null;
										const currentVideo = videoRef.current;
										if (!currentVideo) break;
										setTimeout(() => {
											if (!videoRef.current) return; // unmounted
											createHls(videoRef.current);
										}, RETRY_DELAY_MS * notFoundRetryRef.current);
									} else {
										// All retries exhausted — the file genuinely doesn't exist.
										toast.error("Video not found or unavailable.");
										hls.destroy();
										hlsRef.current = null;
									}
								} else {
									toast.error("Network error encountered, trying to recover");
									hls.startLoad();
								}
								break;
							}
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

				return hls;
			};

			if (isHLSStream) {
				if (Hls.isSupported()) {
					createHls(video);

					return () => {
						hlsRef.current?.destroy();
						hlsRef.current = null;
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
