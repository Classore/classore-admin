import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}
	const fileId = req.query.fileId;
	if (!fileId || typeof fileId !== "string") {
		return res.status(400).json({ message: "Invalid file ID" });
	}

	try {
		const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
		const auth = new google.auth.GoogleAuth({
			credentials: {
				type: "service_account",
				project_id: process.env.GOOGLE_PROJECT_ID,
				private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
				private_key: privateKey,
				client_email: process.env.GOOGLE_CLIENT_EMAIL,
				client_id: process.env.GOOGLE_CLIENT_ID,
			},
			scopes: ["https://www.googleapis.com/auth/drive.readonly"],
		});

		const drive = google.drive({ version: "v3", auth });
		try {
			await drive.files.get({ fileId });
		} catch (error) {
			console.error("Drive API error:", error);
			return res.status(404).json({ message: "File not found or not accessible" });
		}

		const response = await drive.files.get(
			{
				fileId,
				alt: "media",
			},
			{ responseType: "stream" }
		);

		// Set appropriate headers
		res.setHeader("Content-Type", "video/mp4");
		response.data.on("error", (error) => {
			console.error("Stream error:", error);
			// Only send error if headers haven't been sent
			if (!res.headersSent) {
				res.status(500).json({ message: "Error streaming file" });
			}
		});
		response.data.pipe(res);
	} catch (error: unknown) {
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

export const config = {
	api: {
		responseLimit: false,
		bodyParser: false,
	},
};
