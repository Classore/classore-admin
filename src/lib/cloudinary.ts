import axios from "axios";

/**
 * A class for downloading and processing documents from Cloudinary URLs.
 * Provides functionality to validate Cloudinary URLs, download documents,
 * extract file information, and determine file types.
 *
 * @class DocumentDownloader
 * @example
 * ```typescript
 * const downloader = new DocumentDownloader();
 * const document = await downloader.downloadDocument('https://cloudinary.com/path/to/file.pdf');
 * ```
 *
 * @remarks
 * This class handles documents stored in Cloudinary's image and raw upload directories.
 * It supports various file types including PDF, Excel, Word, and PowerPoint documents.
 *
 * @throws {Error} When the provided URL is invalid or download fails
 *
 * @public Methods:
 * - `downloadDocument(cloudinaryUrl: string)`: Downloads and processes documents from Cloudinary links
 * - `isValidCloudinaryUrl(url: string)`: Validates if the URL is a Cloudinary URL
 * - `extractFileName(url: string)`: Extracts the file name from the Cloudinary URL
 * - `getFileType(fileName: string)`: Gets the file type based on the file extension
 */
export class DocumentDownloader {
	/**
	 * Downloads and processes documents from Cloudinary links
	 * @param {string} cloudinaryUrl - The Cloudinary URL of the document
	 * @returns {Promise<{
	 *   fileName: string,
	 *   fileType: string,
	 *   fileSize: number,
	 *   content: Buffer,
	 *   contentType: string
	 * }>}
	 */
	async downloadDocument(cloudinaryUrl: string) {
		try {
			if (!this.isValidCloudinaryUrl(cloudinaryUrl)) {
				throw new Error("Invalid Cloudinary URL");
			}

			const response = await axios({
				method: "GET",
				url: cloudinaryUrl,
				responseType: "arraybuffer",
			});

			const fileName = this.extractFileName(cloudinaryUrl);
			const fileType = this.getFileType(fileName);
			const contentType = response.headers["content-type"];
			const fileSize = response.data.length;

			return {
				fileName,
				fileType,
				fileSize,
				content: Buffer.from(response.data),
				contentType,
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			throw new Error(`Failed to download document: ${error?.message}`);
		}
	}

	/**
	 * Validates if the URL is a Cloudinary URL
	 * @param {string} url
	 * @returns {boolean}
	 */
	isValidCloudinaryUrl(url: string) {
		return (
			url.includes("cloudinary.com") &&
			(url.includes("/image/upload/") || url.includes("/raw/upload/"))
		);
	}

	/**
	 * Extracts the file name from the Cloudinary URL
	 * @param {string} url
	 * @returns {string}
	 */
	extractFileName(url: string) {
		const urlParts = url.split("/");
		const fileName = urlParts[urlParts.length - 1];
		return fileName.split("?")[0];
	}

	/**
	 * Gets the file type based on the file extension
	 * @param {string} fileName
	 * @returns {string}
	 */
	getFileType(fileName: string) {
		const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
		const fileTypes: { [key: string]: string } = {
			pdf: "RiFilePdf2Line",
			xlsx: "RiFileExcel2Line",
			xls: "RiFileExcel2Line",
			doc: "RiFileWord2Line",
			docx: "RiFileWord2Line",
			ppt: "RiFilePpt2Line",
			pptx: "RiFilePpt2Line",
		};
		return fileTypes[extension] || "RiFile2Line";
	}
}
