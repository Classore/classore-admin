export const MIME_TYPES = {
	IMAGE: [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/svg+xml",
		"image/bmp",
		"image/tiff",
	],
	DOCUMENT: [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
		"text/plain",
		"text/csv",
		"application/rtf",
	],
	VIDEO: [
		"video/mp4",
		"video/mpeg",
		"video/webm",
		"video/quicktime",
		"video/x-msvideo",
		"video/x-flv",
		"video/x-matroska",
	],
	AUDIO: [
		"audio/mpeg", // mp3
		"audio/wav",
		"audio/ogg",
		"audio/aac",
		"audio/webm",
		"audio/flac",
		"audio/mp4",
	],
};

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/mkv"];
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
export const MAX_TIMEOUT = 60000; // 60 seconds
export const MAX_RETRIES = 3;
export const MAX_CANCEL_TIMEOUT = 60000; // 60 seconds