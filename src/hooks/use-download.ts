import React from "react"

interface Props {
	filename: string
	url: string
	onSuccess?: () => void
	onError?: (error: Error | string) => void
}

export const useDownload = ({ filename, url, onSuccess, onError }: Props) => {
	const [loading, setLoading] = React.useState(false)

	const download = async () => {
		setLoading(true)
		try {
			const response = await fetch(url)
			if (response.ok) {
				const blob = await response.blob()
				const link = document.createElement("a")
				link.href = window.URL.createObjectURL(blob)
				link.setAttribute("download", filename)
				link.click()
				window.URL.revokeObjectURL(link.href)

				setLoading(false)
				onSuccess?.()
			} else {
				const errorMsg = "Failed to download file"
				console.error(errorMsg)
				setLoading(false)
				onError?.(errorMsg)
			}
		} catch (error) {
			console.error(error)
			setLoading(false)
			onError?.(error instanceof Error ? error : new Error(String(error)))
		}
	}

	return { download, loading }
}
