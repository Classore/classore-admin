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
