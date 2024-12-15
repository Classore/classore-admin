import React from "react"

interface UseFileHandlerProps {
	onFilesChange: (files: File[]) => void
	onSuccess?: (files: File[]) => void
	onError?: (error: Error) => void
}

interface UseFileHandlerReturn {
	handleClick: () => void
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	inputRef: React.RefObject<HTMLInputElement>
}

export const useFileHandler = ({
	onFilesChange,
	onError,
	onSuccess,
}: UseFileHandlerProps): UseFileHandlerReturn => {
	const inputRef = React.useRef<HTMLInputElement>(null)!

	const handleClick = () => {
		if (inputRef.current) {
			inputRef.current.click()
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files) {
			const filesArray = Array.from(files)
			onFilesChange(filesArray)
			if (onSuccess) {
				onSuccess(filesArray)
			}
		} else {
			if (onError) {
				onError(new Error("No files selected"))
			}
		}
	}

	return { handleClick, handleFileChange, inputRef }
}
