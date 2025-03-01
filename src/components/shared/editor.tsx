import { HeadingNode, type HeadingTagType, $createHeadingNode } from "@lexical/rich-text";
import { ListItemNode, ListNode, type ListType, $createListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { $setBlocksType } from "@lexical/selection";
import { Redo, Undo } from "lucide-react";
import React from "react";
import {
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
	type EditorThemeClasses,
	type ElementFormatType,
	type TextFormatType,
	ParagraphNode,
	TextNode,
	$insertNodes,
	$getRoot,
	$getSelection,
	$isRangeSelection,
} from "lexical";

import { alignment_types, format_types, heading_types, list_types } from "@/config";
import { cn } from "@/lib";

interface Props {
	onValueChange: (text: string) => void;
	className?: string;
	defaultValue?: string;
	size?: "sm" | "md" | "lg";
}

const theme: EditorThemeClasses = {
	heading: {
		h1: "heading-1",
		h2: "heading-2",
		h3: "heading-3",
		h4: "heading-4",
		h5: "heading-5",
		h6: "heading-6",
	},
	list: {
		ul: "list-bullet",
		ol: "list-number",
		listitem: "list-item",
	},
	text: {
		bold: "bold",
		italic: "italic",
		underline: "underline",
		strikethrough: "line-through",
		subscript: "subscript",
		superscript: "superscript",
		code: "code",
		highlight: "highlight",
	},
};

const sizes: Record<string, string> = {
	lg: "size-5",
	md: "size-4",
	sm: "size-3",
};

export const Editor = React.memo(({ onValueChange, className, defaultValue, size }: Props) => {
	return (
		<LexicalComposer
			initialConfig={{
				namespace: "Editor",
				nodes: [HeadingNode, ListItemNode, ListNode, ParagraphNode, TextNode],
				theme,
				onError: (error) => console.error("editor error: ", error),
			}}>
			<div className="flex w-full items-center gap-1 py-1">
				<CustomHeadingActions size={size} />
				<CustomTextActions size={size} />
				<CustomAlignmentActions size={size} />
				<CustomListActions size={size} />
				<CustomHistoryActions size={size} />
			</div>
			<RichTextPlugin
				contentEditable={
					<ContentEditable
						style={{
							padding: "8px",
							outline: "none",
						}}
						className={cn(
							"editor max-h-[700px] w-full overflow-y-auto rounded-lg border-2 text-sm transition-all duration-500 focus:border-primary-400",
							className
						)}
					/>
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<HtmlPlugin initialHtml={defaultValue} onHtmlChanged={onValueChange} />
			<HistoryPlugin />
		</LexicalComposer>
	);
});

Editor.displayName = "Editor";

const CustomHistoryActions = ({ size }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	React.useEffect(() => {
		editor.focus();
	}, [editor]);

	return (
		<div className="flex items-center gap-1">
			<button
				className={`grid place-items-center rounded-md bg-primary-400 p-1 text-white transition-colors duration-300 hover:bg-primary-500/65`}
				onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
				<Undo className={`${sizes[size ?? "md"]}`} />
			</button>
			<button
				className={`grid place-items-center rounded-md bg-primary-400 p-1 text-white transition-colors duration-300 hover:bg-primary-500/65`}
				onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
				<Redo className={`${sizes[size ?? "md"]}`} />
			</button>
		</div>
	);
};

const CustomTextActions = ({ size }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	const handleClick = (format: TextFormatType) => {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
	};

	return (
		<div className="flex items-center gap-1">
			{format_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					onClick={() => handleClick(label.toLowerCase() as TextFormatType)}
					className={`grid place-items-center rounded-md bg-primary-400 p-1 text-white transition-colors duration-300 hover:bg-primary-500/65`}>
					<Icon className={`${sizes[size ?? "md"]}`} />
				</button>
			))}
		</div>
	);
};

const CustomAlignmentActions = ({ size }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	const handleClick = (format: ElementFormatType) => {
		editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
	};

	return (
		<div className="flex items-center gap-1">
			{alignment_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					onClick={() => handleClick(label.toLowerCase() as ElementFormatType)}
					className={`grid place-items-center rounded-md bg-primary-400 p-1 text-white transition-colors duration-300 hover:bg-primary-500/65`}>
					<Icon className={`${sizes[size ?? "md"]}`} />
				</button>
			))}
		</div>
	);
};

const CustomHeadingActions = ({ size }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	const handleClick = (tag: HeadingTagType) => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createHeadingNode(tag));
			}
		});
	};

	return (
		<div className="flex items-center gap-1">
			{heading_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					onClick={() => handleClick(label.toLowerCase() as HeadingTagType)}
					className={`grid place-items-center rounded-md bg-primary-400 p-1 text-white transition-colors duration-300 hover:bg-primary-500/65`}>
					<Icon className={`${sizes[size ?? "md"]}`} />
				</button>
			))}
		</div>
	);
};

const CustomListActions = ({ size }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	const handleClick = (list: ListType) => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () => $createListNode(list));
			}
		});
	};

	return (
		<div className="flex items-center gap-1">
			{list_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					onClick={() => handleClick(label.toLowerCase() as ListType)}
					className={`grid place-items-center rounded-md bg-primary-400 p-1 text-white transition-colors duration-300 hover:bg-primary-500/65`}>
					<Icon className={`${sizes[size ?? "md"]}`} />
				</button>
			))}
		</div>
	);
};

interface HtmlPluginProps {
	initialHtml?: string;
	onHtmlChanged: (html: string) => void;
}

const HtmlPlugin = ({ initialHtml, onHtmlChanged }: HtmlPluginProps) => {
	const [editor] = useLexicalComposerContext();
	React.useEffect(() => {
		if (!initialHtml) return;

		editor.update(() => {
			const root = $getRoot();
			root.clear();

			try {
				const parser = new DOMParser();
				const dom = parser.parseFromString(initialHtml, "text/html");
				const nodes = $generateNodesFromDOM(editor, dom);
				$insertNodes(nodes);
			} catch (error) {
				console.error("Error parsing initial HTML:", error);
			}
		});
	}, [editor, initialHtml]);

	return (
		<OnChangePlugin
			onChange={(editorState) => {
				editorState.read(() => {
					try {
						const html = $generateHtmlFromNodes(editor, null);
						onHtmlChanged(html);
					} catch (error) {
						console.error("Error generating HTML:", error);
					}
				});
			}}
		/>
	);
};
