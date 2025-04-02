import React from "react";

import type { CloudinaryAsset } from "@/types";
import { cn } from "@/lib";

interface Props {
	url: string;
	className?: string;
}

const extractPublicId = (url: string): string => {
	const matches = url.match(/upload\/(?:v\d+\/)?(.+?)\./);
	return matches ? matches[1] : "";
};

// const formatBytes = (bytes: number): string => {
// 	if (bytes === 0) return "0 Bytes";
// 	const sizes = ["Bytes", "KB", "MB", "GB"];
// 	const size = Math.floor(Math.log(bytes) / Math.log(1024));
// 	return `${(bytes / Math.pow(1024, size)).toFixed(2)} ${sizes[size]}`;
// };

export const CloudinaryFileItem = ({ url, className }: Props) => {
	const [, setAsset] = React.useState<CloudinaryAsset | null>(null);
	const [, setError] = React.useState<string | null>(null);
	const [, setLoading] = React.useState(true);

	const fetchAssetInfo = async (url: string) => {
		try {
			setLoading(true);
			const publicId = extractPublicId(url);
			if (!publicId) {
				throw new Error("Invalid Cloudinary URL");
			}
			const response = await fetch(`/api/cloudinary?publicId=${publicId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch file details");
			}
			const data = await response.json();
			setAsset(data);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Error fetching file details");
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		if (url) {
			fetchAssetInfo(url);
		}
	}, [url]);

	return <p className={cn("", className)}></p>;
};
