import { read, utils, write } from "xlsx";

import type { TestQuestionDto } from "@/queries/test-center";
import type { QuestionDto } from "@/store/z-store/quiz";
import { removeLeadingAndTrailingQuotes, removeLeadingAndTrailingSlashes } from "./string";

interface ExportOptions {
	filename: string;
	sheet?: string;
}

type ExportData<T> = Record<string, T>[];

export const exportToCSV = <T>(data: ExportData<T>, options: ExportOptions): void => {
	const headers = Object.keys(data[0]);
	const csvContent = [
		headers.join(","),
		...data.map((row) =>
			headers
				.map((header) => {
					const cell = row[header];
					return typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell;
				})
				.join(",")
		),
	].join("\n");

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
	const wb = utils.book_new();
	const ws = utils.json_to_sheet(data);
	utils.book_append_sheet(wb, ws, options.sheet || "Sheet1");
	const excelBuffer = write(wb, { bookType: "xlsx", type: "array" });
	const blob = new Blob([excelBuffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
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

export type Chunk = {
	index_number: number;
	start_size: number;
	end_size: number;
};

/**
 * Splits a file size into manageable chunks for processing or uploading.
 *
 * The function determines the chunk size based on the total file size:
 * - Files <= 50MB are split into chunks of 10MB or less, with a maximum of 5 chunks.
 * - Files between 50MB and 100MB use a chunk size of 18MB.
 * - Files > 100MB use a chunk size of 25MB.
 *
 * @param {number} fileSize - The total size of the file in bytes.
 * @returns {Chunk[]} An array of chunks, each containing an index number and start and end sizes.
 */
export const getFileChunks = (fileSize: number): Chunk[] => {
	let chunkSize = 0;
	let start = 0;
	const end = fileSize;
	const chunks: Chunk[] = [];

	if (fileSize <= 50 * 1024 * 1024) {
		chunkSize = Math.min(10 * 1024 * 1024, Math.ceil(fileSize / 5));
	} else if (fileSize <= 100 * 1024 * 1024) {
		chunkSize = 18 * 1024 * 1024; //
	} else {
		chunkSize = 25 * 1024 * 1024; // 25MB
	}

	let index = 1;
	while (start < end) {
		let nextEnd = Math.min(start + chunkSize, fileSize);
		if (end - nextEnd < chunkSize && end - nextEnd > 0) {
			nextEnd = end;
		}
		chunks.push({ index_number: index, start_size: start, end_size: nextEnd });
		start = nextEnd;
		index++;
	}

	return chunks;
};

export const testQuestionFromXlsxToJSON = (
	file: File,
	lastIndex: number
): Promise<TestQuestionDto[]> => {
	return new Promise((resolve, reject) => {
		if (!file) {
			throw new Error("No file provided");
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = read(data, { type: "array" });
				const worksheetName = workbook?.SheetNames[0];
				const worksheet = workbook?.Sheets[worksheetName];
				const rawJson = utils.sheet_to_json(worksheet);

				type SheetRow = {
					content: string;
					media: string;
					options: string;
					instruction: string;
					question_type: string;
					images: string;
					is_correct: string;
				};

				const questions: TestQuestionDto[] = rawJson?.map((row, rowIndex) => {
					const sheetRow = row as SheetRow;
					return {
						sequence: lastIndex + rowIndex + 1,
						content: sheetRow?.content,
						media: sheetRow?.media || null,
						images: sheetRow?.images ? sheetRow?.images.split(",").map((img: string) => img.trim()) : [],
						instruction: sheetRow?.instruction || null,
						question_type: sheetRow?.question_type,
						options:
							sheetRow?.options && typeof sheetRow?.options === "string"
								? sheetRow?.options.split(",").map((option: string, index) => {
										const is_correct = Number(sheetRow?.is_correct) === index + 1 ? "YES" : "NO";
										console.log({
											optionIndex: `option ${index + 1}`,
											option,
											is_correct,
											sheetRow,
											sheetRowIsCorrect: sheetRow?.is_correct,
										});
										return {
											content: option,
											is_correct: Number(sheetRow?.is_correct) === index + 1 ? "YES" : "NO",
											sequence_number: index + 1,
										};
									})
								: [],
					};
				});

				resolve(questions);
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => {
			reject(new Error("Error reading the Excel file"));
		};
		reader.readAsArrayBuffer(file);
	});
};

export const quizQuestionFromXlsxToJSON = (
	file: File,
	lastIndex: number
): Promise<QuestionDto[]> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = read(data, { type: "array" });
				const worksheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[worksheetName];
				const rawJson = utils.sheet_to_json(worksheet);

				type SheetRow = {
					content: string;
					media: string;
					options: string;
					instruction: string;
					question_type: string;
					images: string;
					is_correct: string;
				};

				const questions: QuestionDto[] = rawJson.map((row, rowIndex) => {
					const sheetRow = row as SheetRow;
					const question: QuestionDto = {
						sequence: lastIndex + rowIndex + 1,
						sequence_number: lastIndex + rowIndex + 1,
						content: sheetRow.content,
						images: [],
						question_type: sheetRow.question_type,
						options:
							sheetRow.options && typeof sheetRow.options === "string"
								? sheetRow.options.split(",").map((option: string, optionIndex) => {
										let content = removeLeadingAndTrailingQuotes(option);
										content = removeLeadingAndTrailingSlashes(content);
										return {
											content,
											is_correct: Number(sheetRow.is_correct) === optionIndex + 1 ? "YES" : "NO",
											sequence_number: optionIndex + 1,
											images: [],
										};
									})
								: [],
					};
					return question;
				});

				resolve(questions);
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => {
			reject(new Error("Error reading the Excel file"));
		};
		reader.readAsArrayBuffer(file);
	});
};
