import { RiPauseLine, RiPlayLine, RiResetLeftLine } from "@remixicon/react";
import dynamic from "next/dynamic";
import React from "react";

interface Props {
	source: string | File;
}

const AudioPlayerClient = ({ source }: Props) => {
	const [isPlaying, setIsPlaying] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);
	const audioRef = React.useRef<HTMLAudioElement>(null);
	const [audioSrc, setAudioSrc] = React.useState("");
	const [duration, setDuration] = React.useState(0);

	React.useEffect(() => {
		if (typeof source === "string") {
			setAudioSrc(source);
		} else if (source instanceof File) {
			const url = URL.createObjectURL(source);
			setAudioSrc(url);

			return () => {
				URL.revokeObjectURL(url);
			};
		}
	}, [source]);

	React.useEffect(() => {
		const audio = audioRef.current;
		if (audio) {
			const handleLoadedMetadata = () => {
				setDuration(audio.duration);
			};

			const handleTimeUpdate = () => {
				setCurrentTime(audio.currentTime);
			};

			const handleEnded = () => {
				reset();
			};

			audio.addEventListener("loadedmetadata", handleLoadedMetadata);
			audio.addEventListener("timeupdate", handleTimeUpdate);
			audio.addEventListener("ended", handleEnded);

			return () => {
				audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
				audio.removeEventListener("timeupdate", handleTimeUpdate);
				audio.removeEventListener("ended", handleEnded);
			};
		}
	}, [audioSrc]);

	const togglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const reset = () => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
			setCurrentTime(0);
			setIsPlaying(false);
		}
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const handleTimeChange = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = (x / rect.width) * 100;
		const time = (percentage / 100) * duration;
		if (audioRef.current) {
			audioRef.current.currentTime = time;
			setCurrentTime(time);
		}
	};

	const width = React.useMemo(() => {
		if (currentTime === 0 || duration === 0) return 0;
		return (currentTime / duration) * 100;
	}, [currentTime, duration]);

	return (
		<div className="flex h-8 flex-1 items-center gap-x-2 rounded-lg border border-neutral-300 bg-white px-1">
			{audioSrc && <audio ref={audioRef} src={audioSrc} controls={false} />}
			<div className="flex flex-1 items-center space-x-4">
				<button
					onClick={togglePlay}
					className="h-6 rounded-md bg-primary-50 px-3 text-primary-400 transition-colors duration-200 hover:bg-primary-100 focus:outline-none">
					{isPlaying ? <RiPauseLine className="size-4" /> : <RiPlayLine className="size-4" />}
				</button>
				<div className="flex flex-1 items-center space-x-4">
					<span className="w-12 text-sm text-neutral-400">{formatTime(currentTime)}</span>
					<div className="relative h-1 flex-1 rounded-3xl bg-neutral-200">
						<div
							style={{ width: `${width}%` }}
							className="h-full rounded-3xl bg-primary-400 transition-all duration-500"
						/>
						<div
							style={{ left: `${width}%` }}
							onClick={handleTimeChange}
							className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-primary-400 transition-all duration-500"></div>
					</div>
					<span className="w-12 text-sm text-neutral-400">{formatTime(duration)}</span>
				</div>
				<button
					onClick={reset}
					className="h-6 rounded-md bg-primary-50 px-3 text-primary-400 transition-colors duration-200 hover:bg-primary-100 focus:outline-none">
					<RiResetLeftLine className="size-4" />
				</button>
			</div>
		</div>
	);
};

export const AudioPlayer = dynamic<Props>(() => Promise.resolve(AudioPlayerClient), {
	ssr: false,
});
