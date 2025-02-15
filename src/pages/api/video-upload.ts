import type { NextApiRequest, NextApiResponse } from "next";

import type { HttpResponse } from "@/types";
import { endpoints } from "@/config";

const baseUrl = process.env.API_URL;

export const config = {
	api: {
		bodyParser: false,
		maxBodySize: "1000mb",
	},
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}
	try {
		const data: FormData = await req.body;
		const videos = data.getAll("videos");

		if (!videos.length) {
			return res.status(400).json({ message: "No videos uploaded" });
		}

		const formData = new FormData();
		for (let i = 0; i < videos.length; i++) {
			const video = videos[i];
			if (video instanceof File) {
				formData.append("videos", video);
			}
		}
		const response = await fetch(`${baseUrl}${endpoints().school.update_chapter_module}`, {
			method: "PUT",
			body: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		if (!response.ok) {
			return res.status(500).json({ message: "Failed to upload video" });
		}
		const responseData = (await response.json()) as HttpResponse<string>;
		return res.status(200).json({ responseData });
	} catch (error) {
		console.error("API error:", error);
		if (!res.headersSent) {
			if (error instanceof Error) {
				res.status(500).json({ message: error.message });
			} else {
				res.status(500).json({ message: "An unknown error occurred" });
			}
		}
	}
}
