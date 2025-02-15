import { createPersistMiddleware } from "../middleware";
import type { Maybe } from "@/types";

export type UploadStatus = "pending" | "uploading" | "completed" | "error";

export type VideoUpload = {
	file: File;
	id: string;
	meta: {
		course: string;
		module: string;
		topic: string;
	};
	progress: number;
	status: UploadStatus;
	uploadedAt: Date;
	error?: Maybe<string>;
};

interface VideoUploadStore {
	addVideo: (video: Omit<VideoUpload, "progress" | "status" | "uploadedAt">) => void;
	clearCompleted: () => void;
	currentUploads: Set<Partial<VideoUpload>>;
	getVideo: (id: string) => VideoUpload | undefined;
	removeVideo: (id: string) => void;
	updateVideoProgress: (id: string, progress: number) => void;
	updateVideoStatus: (id: string, status: UploadStatus, error?: string) => void;
	videos: VideoUpload[];
}

const initialState: VideoUploadStore = {
	addVideo: () => {},
	clearCompleted: () => {},
	currentUploads: new Set(),
	getVideo: () => undefined,
	removeVideo: () => {},
	updateVideoProgress: () => {},
	updateVideoStatus: () => {},
	videos: [],
};

const useVideoUploadStore = createPersistMiddleware<VideoUploadStore>(
	"video-uploads",
	(set, get) => ({
		...initialState,
		addVideo: (video) => {
			const newVideo: VideoUpload = {
				...video,
				progress: 0,
				status: "pending",
				uploadedAt: new Date(),
			};

			set((state) => ({
				videos: [...state.videos, newVideo],
				currentUploads: new Set(state.currentUploads).add(video),
			}));
		},
		updateVideoProgress: (id, progress) =>
			set((state) => ({
				videos: state.videos.map((video) => (video.id === id ? { ...video, progress } : video)),
			})),
		updateVideoStatus: (id, status, error?) =>
			set((state) => ({
				videos: state.videos.map((video) =>
					video.id === id
						? {
								...video,
								status,
								error,
								...(status === "completed" ? { uploadedAt: new Date() } : {}),
							}
						: video
				),
				currentUploads:
					status === "completed" || status === "error"
						? new Set([...state.currentUploads].filter((upload) => upload.id !== id))
						: state.currentUploads,
			})),

		removeVideo: (id) =>
			set((state) => ({
				videos: state.videos.filter((video) => video.id !== id),
				currentUploads: new Set([...state.currentUploads].filter((upload) => upload.id !== id)),
			})),
		getVideo: (id) => get().videos.find((video) => video.id === id),
		clearCompleted: () =>
			set((state) => ({
				videos: state.videos.filter((video) => video.status !== "completed"),
			})),
	})
);

export { useVideoUploadStore };
