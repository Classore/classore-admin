import { MIME_TYPES } from "@/constants";

export interface ValidationOptions {
	allowedMimeTypes?: readonly string[];
	fileType?: "audio" | "document" | "image" | "video";
	maxFiles?: number;
	maxFileSize?: number;
	minFiles?: number;
}

export type ValidationErrors = {
	code: string;
	message: string;
};

export const validateFile = (file: File | null, options?: ValidationOptions) => {
	if (!file || !options) return undefined;

	if (options.maxFileSize && file.size > options.maxFileSize) {
		const maxSizeMB = Math.round((options.maxFileSize / (1024 * 1024)) * 10) / 10;
		const actualSizeMB = Math.round((file.size / (1024 * 1024)) * 10) / 10;

		return {
			code: "FILE_TOO_LARGE",
			message: `File is too large. Maximum allowed size is ${maxSizeMB}MB, but file is ${actualSizeMB}MB.`,
		};
	}

	if (options.fileType) {
		let allowedTypes: readonly string[] = [];
		switch (options.fileType) {
			case "document":
				allowedTypes = MIME_TYPES.DOCUMENT;
				break;
			case "image":
				allowedTypes = MIME_TYPES.IMAGE;
				break;
			case "video":
				allowedTypes = MIME_TYPES.VIDEO;
				break;
			case "audio":
				allowedTypes = MIME_TYPES.AUDIO;
				break;
		}
		if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
			return {
				code: "INVALID_FILE_TYPE",
				message: `File type '${file.type}' is not allowed. Allowed file types for ${options.fileType}: ${allowedTypes.join(", ")}`,
			};
		}
	}

	if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
		if (!options.allowedMimeTypes.includes(file.type)) {
			return {
				code: "INVALID_MIME_TYPE",
				message: `File MIME type '${file.type}' is not allowed. Allowed MIME types: ${options.allowedMimeTypes.join(", ")}`,
			};
		}
	}

	return undefined;
};

export function debounceFn<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return function (...args: Parameters<T>) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}
