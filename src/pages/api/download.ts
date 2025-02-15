import type { NextApiResponse, NextApiRequest } from "next";
import { DocumentDownloader } from "@/lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const url = req.query.url as string;
		if (!url) {
			return res.status(400).json({ error: "URL is required" });
		}
		const downloader = new DocumentDownloader();
		const document = await downloader.download(url);
		res.setHeader("Content-Type", document.contentType);
		res.setHeader("Content-Length", document.fileSize.toString());
		res.setHeader("Content-Disposition", `attachment; filename="${document.fileName}"`);
		return res.status(200).json({ document });
	} catch (error: unknown) {
		return res.status(500).json({ error, message: "Internal server error" });
	}
}
