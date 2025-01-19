import { NextRequest, NextResponse } from "next/server";
import { DocumentDownloader } from "@/lib/";

export default async function handler(request: NextRequest) {
	try {
		const url = request.nextUrl.searchParams.get("url");

		if (!url) {
			return NextResponse.json({ error: "URL is required" }, { status: 400 });
		}

		const downloader = new DocumentDownloader();
		const document = await downloader.downloadDocument(url);

		const response = new NextResponse(document.content);
		response.headers.set("Content-Type", document.contentType);
		response.headers.set(
			"Content-Disposition",
			`attachment; filename="${document.fileName}"`
		);
		response.headers.set("Content-Length", document.fileSize.toString());

		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
