import { io, Socket } from "socket.io-client";

const url = process.env.NEXT_PUBLIC_API_URL;

interface SocketOptions {
	moduleId: string;
	autoConnect?: boolean;
}

export const createVideoUploadSocket = ({
	moduleId,
	autoConnect = true,
}: SocketOptions): Socket => {
	if (!url) {
		throw new Error("API URL is not defined");
	}

	const socket = io(url, {
		transports: ["websocket", "polling"],
		autoConnect,
		reconnection: true,
		reconnectionAttempts: 5,
		reconnectionDelay: 1000,
		timeout: 10000,
	});

	socket.on("connect_error", (error) => {
		console.error("Connection error:", error);
	});

	socket.on("connect", () => {
		console.log("Connected to socket");
	});

	socket.on("disconnect", (reason) => {
		console.log("Disconnected from socket:", reason);
	});

	socket.on(`video_upload_status.${moduleId}`, (data) => {
		console.log("Upload progress:", data);
	});

	return socket;
};
