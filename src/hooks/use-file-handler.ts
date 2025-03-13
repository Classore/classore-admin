import React from "react";

// Enhanced type definitions
export type FileType = "audio" | "document" | "image" | "video";

export interface FileValidationRules {
	maxSize?: number; // in bytes
	allowedTypes?: readonly string[];
	maxFiles?: number;
	minFiles?: number;
}

interface UseFileHandlerProps {
	onValueChange: (files: File[]) => void;
	onError?: (error: string) => void;
	validationRules?: FileValidationRules;
	fileType?: FileType;
	append?: boolean;
}

interface FileHandlerReturn {
	clearFiles: () => void;
	files: File[]; // Expose current files
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleClick: () => void;
	handleDrop: (e: React.DragEvent<HTMLElement>) => void;
	handleDragLeave: (e: React.DragEvent<HTMLElement>) => void;
	handleDragOver: (e: React.DragEvent<HTMLElement>) => void;
	handleDragEnter: (e: React.DragEvent<HTMLElement>) => void;
	handleRemoveFile: (fileToRemove: File) => void;
	inputRef: React.RefObject<HTMLInputElement>;
	isDragging: boolean;
}

// Memoized MIME type configurations
export const DEFAULT_MIME_TYPES = {
	audio: ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg"],
	document: [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	],
	image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
	video: ["video/mp4", "video/webm", "video/ogg"],
} as const;

/**
 * @description Custom hook to handle file input and drag-and-drop file uploads with validation.
 *
 * @param props - Configuration options for the file handler
 * @returns Object containing file handling methods and state
 */
export const useFileHandler = ({
	onValueChange,
	onError,
	validationRules = {},
	fileType = "image",
	append = true,
}: UseFileHandlerProps): FileHandlerReturn => {
	const [files, setFiles] = React.useState<File[]>([]);
	const [isDragging, setIsDragging] = React.useState(false);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const dragCountRef = React.useRef(0);

	// Memoize validation rules
	const rules = React.useMemo(
		() => ({
			maxSize: validationRules.maxSize,
			allowedTypes: validationRules.allowedTypes ?? DEFAULT_MIME_TYPES[fileType],
			maxFiles: validationRules.maxFiles,
			minFiles: validationRules.minFiles,
		}),
		[validationRules, fileType]
	);

	const validateFiles = React.useCallback(
		(newFiles: File[]): File[] | null => {
			const totalFiles = append ? files.length + newFiles.length : newFiles.length;

			if (rules.maxFiles && totalFiles > rules.maxFiles) {
				onError?.(`Maximum ${rules.maxFiles} files allowed`);
				return null;
			}

			if (rules.minFiles && totalFiles < rules.minFiles) {
				onError?.(`Minimum ${rules.minFiles} files required`);
				return null;
			}

			const validFiles = newFiles.filter((file) => {
				if (rules.maxSize && file.size > rules.maxSize) {
					onError?.(`File ${file.name} is larger than ${(rules.maxSize / (1024 * 1024)).toFixed(2)}MB`);
					return false;
				}

				if (rules.allowedTypes?.length && !rules.allowedTypes.includes(file.type)) {
					onError?.(
						`File ${file.name} has unsupported type. Allowed types: ${rules.allowedTypes.join(", ")}`
					);
					return false;
				}

				return true;
			});

			return validFiles.length > 0 ? validFiles : null;
		},
		[rules, files.length, append, onError]
	);

	const processFiles = React.useCallback(
		(newFiles: File[]) => {
			const validatedFiles = validateFiles(newFiles);
			if (!validatedFiles) return;

			const updatedFiles = append ? [...files, ...validatedFiles] : validatedFiles;
			setFiles(updatedFiles);
			onValueChange(updatedFiles);
		},
		[validateFiles, files, append, onValueChange]
	);

	const handleClick = React.useCallback(() => {
		inputRef.current?.click();
	}, []);

	const handleFileChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const fileList = e.target.files;
			if (!fileList) return;

			processFiles(Array.from(fileList));
			e.target.value = ""; // Reset input
		},
		[processFiles]
	);

	const handleDrop = React.useCallback(
		(e: React.DragEvent<HTMLElement>) => {
			e.preventDefault();
			dragCountRef.current = 0;
			setIsDragging(false);

			const droppedFiles = Array.from(e.dataTransfer.files);
			processFiles(droppedFiles);
		},
		[processFiles]
	);

	const handleDragOver = React.useCallback((e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	// Improved drag enter/leave handling to account for child elements
	const handleDragEnter = React.useCallback((e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		dragCountRef.current++;
		setIsDragging(true);
	}, []);

	const handleDragLeave = React.useCallback((e: React.DragEvent<HTMLElement>) => {
		e.preventDefault();
		dragCountRef.current--;
		if (dragCountRef.current === 0) {
			setIsDragging(false);
		}
	}, []);

	const handleRemoveFile = React.useCallback(
		(fileToRemove: File) => {
			const newFiles = files.filter((file) => file !== fileToRemove);
			setFiles(newFiles);
			onValueChange(newFiles);
		},
		[files, onValueChange]
	);

	const clearFiles = React.useCallback(() => {
		setFiles([]);
		onValueChange([]);
	}, [onValueChange]);

	return {
		handleFileChange,
		handleClick,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleDragEnter,
		handleRemoveFile,
		inputRef,
		isDragging,
		clearFiles,
		files, // Expose current files
	};
};
