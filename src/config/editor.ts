import { Highlighter } from "lucide-react";
import {
	RiAlignCenter,
	RiAlignJustify,
	RiAlignLeft,
	RiAlignRight,
	RiBold,
	RiH1,
	RiH2,
	RiH3,
	RiH4,
	RiH5,
	RiItalic,
	RiListOrdered,
	RiListUnordered,
	RiStrikethrough,
	RiSubscript,
	RiSuperscript,
	RiUnderline,
} from "@remixicon/react";

export const format_types = [
	{ label: "bold", icon: RiBold },
	{ label: "italic", icon: RiItalic },
	{ label: "underline", icon: RiUnderline },
	{ label: "strikethrough", icon: RiStrikethrough },
	{ label: "subscript", icon: RiSubscript },
	{ label: "superscript", icon: RiSuperscript },
	{ label: "highlight", icon: Highlighter },
];

export const heading_types = [
	{ label: "h1", icon: RiH1 },
	{ label: "h2", icon: RiH2 },
	{ label: "h3", icon: RiH3 },
	{ label: "h4", icon: RiH4 },
	{ label: "h5", icon: RiH5 },
];

export const list_types = [
	{ label: "number", icon: RiListOrdered },
	{ label: "bullet", icon: RiListUnordered },
];

export const alignment_types = [
	{ label: "center", icon: RiAlignCenter },
	{ label: "justify", icon: RiAlignJustify },
	{ label: "left", icon: RiAlignLeft },
	{ label: "right", icon: RiAlignRight },
];
