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
	ALLOWED_ATTR: [
		"id",
		"class",
		"style",
		"align",
		"dir",
		"colspan",
		"rowspan",
		"aria-label",
		"role",
	],
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
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
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
				params[key as Key] !== null &&
				params[key as Key] !== undefined &&
				params[key as Key] !== ""
		)
		.map(
			(key) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(params[key as Key] as string)}`
		)
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
