import { utils, write } from "xlsx";

interface ExportOptions {
	filename: string;
	sheet?: string;
}

type ExportData<T> = Record<string, T>[];

export const exportToCSV = <T>(data: ExportData<T>, options: ExportOptions): void => {
	// Convert data to CSV string
	const headers = Object.keys(data[0]);
	const csvContent = [
		// Add headers
		headers.join(","),
		// Add data rows
		...data.map((row) =>
			headers
				.map((header) => {
					const cell = row[header];
					// Handle cells that contain commas by wrapping in quotes
					return typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell;
				})
				.join(",")
		),
	].join("\n");

	// Create blob and download
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", `${options.filename}.csv`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export const exportToXLSX = <T>(data: ExportData<T>, options: ExportOptions): void => {
	// Create workbook and worksheet
	const wb = utils.book_new();
	const ws = utils.json_to_sheet(data);

	// Add worksheet to workbook
	utils.book_append_sheet(wb, ws, options.sheet || "Sheet1");

	// Generate buffer and create blob
	const excelBuffer = write(wb, { bookType: "xlsx", type: "array" });
	const blob = new Blob([excelBuffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});

	// Create download link and trigger download
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", `${options.filename}.xlsx`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export const getFileSize = (file: File, unit: "mb" | "kb" = "mb"): string => {
	const sizeInBytes = file.size;
	const sizeInMB = sizeInBytes / (1024 * 1024);
	const sizeInKB = sizeInBytes / 1024;
	const size = unit === "mb" ? sizeInMB : sizeInKB;
	return size.toFixed(2);
};

export const createDownload = async (url: string) => {
	const file = await fetch(url).then((response) => response.blob());
	const fileName = url.split("/").pop() || "file";
	const fileType = file.type;
	const blob = new Blob([file], { type: fileType });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = fileName;
	link.click();
	URL.revokeObjectURL(link.href);
	link.remove();
};

export const processImageToBase64 = (file?: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const base64String = reader.result as string;
			resolve(base64String);
		};
		reader.onerror = (error) => {
			reject(error);
		};
		reader.readAsDataURL(file);
	});
};

export const chunkFile = (file: File, chunkSize = 1024 * 1024 * 3) => {
	const chunks = [];
	const totalChunks = Math.ceil(file.size / chunkSize);

	for (let i = 0; i < totalChunks; i++) {
		const start = i * chunkSize;
		const end = Math.min(file.size, start + chunkSize);
		const chunk = file.slice(start, end);

		chunks.push({
			chunk,
			end,
			index: i,
			size: chunk.size,
			start,
			totalChunks,
		});
	}

	return chunks;
};
