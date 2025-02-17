import TurndownService from "turndown";

export interface HTMLToMarkdownOptions {
	customRules?: {
		[key: string]: (node: HTMLElement) => string;
	};
	preserveHeadingIds?: boolean;
	collapseWhitespace?: boolean;
}

export const convertHTmlToMd = (html: string, options: HTMLToMarkdownOptions = {}) => {
	const { customRules = {}, preserveHeadingIds = false, collapseWhitespace = true } = options;

	const turndownService = new TurndownService({
		headingStyle: "atx",
		hr: "---",
		codeBlockStyle: "fenced",
	});

	Object.entries(customRules).forEach(([selector, converter]) => {
		turndownService.addRule(selector, {
			filter: (node: HTMLElement) => node.matches(selector),
			replacement: (_, node: Node) => converter(node as HTMLElement),
		});
	});

	if (preserveHeadingIds) {
		turndownService.addRule("headings-with-id", {
			filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
			replacement: (content, node) => {
				const id = (node as HTMLElement).getAttribute("id");
				return id ? `${content} {#${id}}` : content;
			},
		});
	}

	if (collapseWhitespace) {
		turndownService.addRule("collapse-whitespace", {
			filter: ["p", "div", "span"],
			replacement: (content) => content.trim().replace(/\s+/g, " "),
		});
	}

	try {
		return turndownService.turndown(html);
	} catch (error) {
		console.error("HTML to Markdown conversion failed:", error);
		return "";
	}
};

export interface MarkdownToHTMLOptions {
	customRules?: {
		[key: string]: (content: string) => string;
	};
	headingStyle?: "setext" | "atx";
}

export const convertMdToHtml = (markdown: string, options: MarkdownToHTMLOptions = {}) => {
	const { customRules = {}, headingStyle = "atx" } = options;

	const turndownService = new TurndownService({
		headingStyle,
		hr: "---",
		codeBlockStyle: "fenced",
	});

	Object.entries(customRules).forEach(([ruleName, converter]) => {
		turndownService.addRule(ruleName, {
			filter: (node: HTMLElement) => node.nodeName.toLowerCase() === ruleName.toLowerCase(),
			replacement: converter,
		});
	});

	try {
		return turndownService.turndown(markdown);
	} catch (error) {
		console.error("Markdown to HTML conversion failed:", error);
		return "";
	}
};

export const isHTMLString = (str: string): boolean => {
	if (!str || typeof str !== "string") return false;

	const htmlRegex = /<[^>]*>/;
	const strictHtmlRegex = /^(?:<[^>]+>|[^<]*)*$/;
	const htmlEntities = /&[a-z]+;|&#\d+;/i;

	if (!htmlRegex.test(str)) return false;

	return (
		strictHtmlRegex.test(str) ||
		htmlEntities.test(str) ||
		str.toLowerCase().includes("<!doctype html>")
	);
};
