import type { NextApiResponse, NextApiRequest } from "next";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const publicId = req.query.publicId as string;
		if (!publicId) {
			return res.status(400).json({ error: "publicId is required" });
		}
		const result = await cloudinary.api.resource(publicId, {
			colors: true,
			image_metadata: true,
			media_metadata: true,
		});
		res.setHeader("Content-Type", "application/json");
		res.setHeader("Content-Length", JSON.stringify(result).length.toString());
		return res.status(200).json({ result });
	} catch (error: unknown) {
		return res.status(500).json({ error, message: "Internal server error" });
	}
}
