import React from "react";

export const useCloudinary = () => {
	const [isLoading, setIsLoading] = React.useState(false);

	const handleDownload = async (cloudinaryUrl: string) => {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/download?url=${encodeURIComponent(cloudinaryUrl)}`);
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Download failed");
			}

			const contentDisposition = response.headers.get("Content-Disposition");
			const fileName =
				contentDisposition?.split('filename="')[1].split('"')[0] || "document";
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error("Download error:", error);
			alert("Failed to download document: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		handleDownload,
		isLoading,
	};
};
