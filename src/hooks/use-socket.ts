import { Socket, io } from "socket.io-client";
import React from "react";

const url = process.env.NEXT_PUBLIC_API_URL;

interface SocketOptions {
	moduleId: string;
	autoConnect?: boolean;
}

export const useVideoUploadProgress = ({ moduleId }: SocketOptions) => {
	const [isConnected, setIsConnected] = React.useState(false);
	const [progress, setProgress] = React.useState(0);
	const socket = React.useRef<Socket | null>(null);

	React.useEffect(() => {
		if (!moduleId) return;

		socket.current = io(url, {
			autoConnect: true,
			transports: ["websocket"],
		});

		socket.current.on("connect", () => {
			setIsConnected(true);
		});

		socket.current.on("disconnect", () => {
			setIsConnected(false);
		});

		socket.current.on(`video_upload_status.${moduleId}`, (data) => {
			console.log("Upload progress:", data);
			setProgress(data.progress);
		});

		return () => {
			if (socket.current) {
				socket.current.disconnect();
				socket.current = null;
			}
		};
	}, [moduleId]);

	return {
		isConnected,
		progress,
		socket: socket.current,
	};
};
