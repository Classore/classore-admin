import DOMPurify from "isomorphic-dompurify";

import type { QueryParamsProps, RatingProps } from "@/types";

interface SanitizeOptions {
	ALLOWED_TAGS?: string[];
	ALLOWED_ATTR?: string[];
	ALLOW_DATA_ATTR?: boolean;
	USE_PROFILES?: {
		html?: boolean;
		svg?: boolean;
		svgFilters?: boolean;
	};
}

const defaultOptions: SanitizeOptions = {
	ALLOWED_TAGS: [
		"p",
		"div",
		"span",
		"br",
		"hr",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"b",
		"strong",
		"i",
		"em",
		"u",
		"strike",
		"sub",
		"sup",
		"ul",
		"ol",
		"li",
		"table",
		"thead",
		"tbody",
		"tr",
		"td",
		"th",
		"blockquote",
		"pre",
		"code",
	],
	ALLOWED_ATTR: ["id", "class", "style", "align", "dir", "colspan", "rowspan", "aria-label", "role"],
	ALLOW_DATA_ATTR: true,
	USE_PROFILES: {
		html: true,
		svg: false,
		svgFilters: false,
	},
};

export const sanitize = (
	html: string | undefined | null,
	options: SanitizeOptions = defaultOptions
) => {
	if (!html) return "";

	try {
		const sanitized = DOMPurify.sanitize(html, {
			...options,
			RETURN_DOM: false,
			RETURN_DOM_FRAGMENT: false,
			RETURN_TRUSTED_TYPE: true,
			SANITIZE_DOM: true,
		}).toString();

		const parser = new DOMParser();
		const doc = parser.parseFromString(sanitized, "text/html");

		const removeEmptyElements = (node: Node) => {
			const children = Array.from(node.childNodes);
			children.forEach((child) => {
				if (child.nodeType === Node.ELEMENT_NODE) {
					removeEmptyElements(child);

					const element = child as HTMLElement;
					const tagName = element.tagName.toLowerCase();

					if (
						tagName !== "br" &&
						tagName !== "hr" &&
						!element.textContent?.trim() &&
						!element.querySelector("img, br, hr")
					) {
						element.remove();
					}
				}
			});
		};

		removeEmptyElements(doc.body);

		const normalizeWhitespace = (node: Node) => {
			const children = Array.from(node.childNodes);

			children.forEach((child) => {
				if (child.nodeType === Node.TEXT_NODE) {
					child.textContent = child.textContent?.replace(/\s+/g, " ").trim() ?? "";
				} else if (child.nodeType === Node.ELEMENT_NODE) {
					normalizeWhitespace(child);
				}
			});
		};

		normalizeWhitespace(doc.body);

		return doc.body.innerHTML;
	} catch (error) {
		console.error("Error sanitizing HTML:", error);
		return "";
	}
};

export const capitalize = (value?: string) => {
	if (!value) return "";
	return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getInitials = (value: string) => {
	return value
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase())
		.join("");
};

export const generateUuid = () => {
	return crypto.randomUUID();
};

export const normalize = (path?: string): string => {
	let normalPath = "";
	if (path) {
		if (path.split("/").length > 2) {
			const pathParts = `/${path.split("/")[1]}/${path.split("/")[2]}`;
			normalPath = pathParts;
		} else {
			normalPath = path;
		}
	}
	return normalPath;
};

export const encodeQueryParams = (params: QueryParamsProps) => {
	type Key = keyof typeof params;
	return Object.keys(params)
		.filter(
			(key) =>
				params[key as Key] !== null && params[key as Key] !== undefined && params[key as Key] !== ""
		)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key as Key] as string)}`)
		.join("&");
};

export const formatCurrency = (amount: number, currency = "NGN") => {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
		minimumFractionDigits: 0,
	}).format(amount);
};

export function fromSnakeCase(value?: string) {
	if (!value) return "";
	return value.split("_").join(" ");
}

export function aggregate(ratings: RatingProps[]) {
	const average = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
	return average.toFixed(1);
}

export const formatTime = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const shortenFileName = (name: string, length = 30) => {
	const splitName = name.split(".");
	const extension = splitName.pop();
	const shortName = splitName.join(".").slice(0, length);
	if (shortName.length < length) return name;
	return `${shortName}...${extension}`;
};

export const getFileExtension = (name: string) => {
	const splitParts = name.split(".");
	const lastIndex = splitParts.length - 1;
	return splitParts[lastIndex];
};

export const isGoogleDriveUrl = (url: string) => {
	return (
		url.startsWith("https://drive.google.com/file/d") ||
		url.startsWith("https://www.googleapis.com/drive")
	);
};

export const isCloudinaryUrl = (url: string) => {
	return url.startsWith("https://res.cloudinary.com/");
};

export const getGoogleDriveId = (url: string) => {
	if (!url) return "";

	if (url.startsWith("https://drive.google.com/file/d")) {
		const patterns = [
			/\/file\/d\/([^/]+)/, // Format: /file/d/{fileId}
			/id=([^&]+)/, // Format: ?id={fileId}
		];
		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) return match[1];
		}
	}

	if (url.startsWith("https://www.googleapis.com/drive")) {
		const patterns = [
			/files\/([^/]+)/, // Format: /files/{fileId}
			/id=([^&]+)/, // Format: ?id={fileId}
		];
		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) return match[1].split("?")[0];
		}
	}

	return url;
};

export const embedUrl = (url: string | File) => {
	if (!url) return "";

	if (url instanceof File) {
		return URL.createObjectURL(url);
	}

	if (isGoogleDriveUrl(url)) {
		const videoId = getGoogleDriveId(url);
		return `https://drive.google.com/file/d/${videoId}/view`;
	}

	if (isCloudinaryUrl(url)) {
		return url;
	}

	return url;
};

export const toKebabCase = (value: string) => {
	return value.toLowerCase().replace(/\s+/g, "-");
};

export const fromKebabCase = (value: string) => {
	return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

//  number to words
const numberToWords: { [key: number]: string } = {
	0: "zero",
	1: "one",
	2: "two",
	3: "three",
	4: "four",
	5: "five",
	6: "six",
	7: "seven",
	8: "eight",
	9: "nine",
	10: "ten",
	11: "eleven",
	12: "twelve",
	13: "thirteen",
	14: "fourteen",
	15: "fifteen",
	16: "sixteen",
	17: "seventeen",
	18: "eighteen",
	19: "nineteen",
	20: "twenty",
	30: "thirty",
	40: "forty",
	50: "fifty",
	60: "sixty",
	70: "seventy",
	80: "eighty",
	90: "ninety",
};

export const convertNumberToWord = (num: number) => {
	if (num in numberToWords) {
		return numberToWords[num];
	}

	if (num >= 21 && num <= 99) {
		const tens = Math.floor(num / 10) * 10;
		const units = num % 10;
		return `${numberToWords[tens]}-${numberToWords[units]}`;
	}

	throw new Error(`Number ${num} is not supported.`);
};

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const units = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const size = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));

	return `${size} ${units[i]}`;
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after 'delay' milliseconds have elapsed since the last time it was invoked.
 *
 * @param func - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @returns The debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return function (this: unknown, ...args: Parameters<T>): void {
		// Store the 'this' context
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const context = this;

		// Clear any existing timeout
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		// Set a new timeout
		timeoutId = setTimeout(() => {
			func.apply(context, args);
		}, delay);
	};
}

export const removeQuotes = (str: string) => {
	return str.replace(/["'`]/g, "");
};

export const removeHtmlTags = (str: string) => {
	return str.replace(/<[^>]*>/g, "");
};

export const removeSpecialCharacters = (str: string) => {
	return str.replace(/[^a-zA-Z0-9\s]/g, "");
};

export const removeExtraSpaces = (str: string) => {
	return str.replace(/\s+/g, " ").trim();
};

export const removeLineBreaks = (str: string) => {
	return str.replace(/\n/g, "");
};

export const removeLeadingAndTrailingSlashes = (str: string) => {
	return str.replace(/^\/|\/$/g, "");
};

export const removeLeadingSlash = (str: string) => {
	return str.replace(/^\//, "");
};

export const removeTrailingSlash = (str: string) => {
	return str.replace(/\/$/, "");
};

export const removeLeadingAndTrailingSpaces = (str: string) => {
	return str.replace(/^\s+|\s+$/g, "");
};

export const removeLeadingSpace = (str: string) => {
	return str.replace(/^\s+/, "");
};

export const removeTrailingSpace = (str: string) => {
	return str.replace(/\s+$/, "");
};

export const removeLeadingAndTrailingQuotes = (str: string) => {
	return str.replace(/^["'`]|["'`]$/g, "");
};

export const removeLeadingQuote = (str: string) => {
	return str.replace(/^["'`]/, "");
};

// Write a function to truncate html coming from api
/**
 * Truncates HTML content while preserving tags
 * @param {string} html - The HTML string to truncate
 * @param {number} maxLength - Maximum length of the plain text content
 * @param {string} [ellipsis='...'] - Ellipsis character(s) to append
 * @returns {string} Truncated HTML string
 */
export function truncateHTML(html: string, maxLength: number, ellipsis: string = "..."): string {
	// Create a temporary DOM element
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = html;

	let textLength = 0;
	let truncated = false;

	// Recursive function to traverse and truncate nodes
	function processNode(node: Node): void {
		if (truncated) return;

		if (node.nodeType === Node.TEXT_NODE) {
			const textNode = node as Text;
			const remainingLength = maxLength - textLength;

			if (remainingLength <= 0) {
				textNode.nodeValue = "";
				return;
			}

			if (textNode.nodeValue && textNode.nodeValue.length > remainingLength) {
				textNode.nodeValue = textNode.nodeValue.substring(0, remainingLength) + ellipsis;
				textLength = maxLength;
				truncated = true;
				return;
			}

			if (textNode.nodeValue) {
				textLength += textNode.nodeValue.length;
			}
			return;
		}

		if (node.nodeType === Node.ELEMENT_NODE) {
			const elementNode = node as Element;
			// Process child nodes in order
			for (let i = 0; i < elementNode.childNodes.length; i++) {
				processNode(elementNode.childNodes[i]);
				if (truncated) {
					// Remove remaining nodes after truncation point
					while (elementNode.childNodes.length > i + 1) {
						elementNode.removeChild(elementNode.childNodes[i + 1]);
					}
					break;
				}
			}
		}
	}

	// Process all nodes in the temporary div
	for (let i = 0; i < tempDiv.childNodes.length; i++) {
		processNode(tempDiv.childNodes[i]);
		if (truncated) {
			// Remove remaining nodes after truncation point
			while (tempDiv.childNodes.length > i + 1) {
				tempDiv.removeChild(tempDiv.childNodes[i + 1]);
			}
			break;
		}
	}

	return tempDiv.innerHTML;
}
