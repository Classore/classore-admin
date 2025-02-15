import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { type ListType, $createListNode, ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { type HeadingTagType, $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import type { EditorThemeClasses, ElementFormatType, TextFormatType } from "lexical";
import {
	$getSelection,
	$insertNodes,
	$isRangeSelection,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
} from "lexical";
import { Redo, Undo } from "lucide-react";
import React from "react";

import { alignment_types, format_types, heading_types, list_types } from "@/config";
import { capitalize, cn } from "@/lib";

interface EditorProps {
	onValueChange: (value: string) => void;
	className?: string;
	defaultValue?: string;
	placeholder?: string;
	size?: "sm" | "md" | "lg";
}

const iconSize: Record<string, string> = {
	lg: "size-5",
	md: "size-4",
	sm: "size-3",
};

const buttonSize: Record<string, string> = {
	lg: "rounded-md",
	md: "rounded",
	sm: "rounded-sm",
};

const editorSize: Record<string, string> = {
	lg: "text-sm rounded-md",
	md: "text-sm rounded-md",
	sm: "text-[10px] rounded-sm",
};

const theme: EditorThemeClasses = {
	heading: {
		h1: "heading-1",
		h2: "heading-2",
		h3: "heading-3",
		h4: "heading-4",
		h5: "heading-5",
	},
	list: {
		ul: "list-bullet",
		ol: "list-number",
		listitem: "list-item",
	},
	text: {
		bold: "text-bold",
		italic: "text-italic",
		underline: "text-underline",
		strikethrough: "text-line-through",
		subscript: "text-subscript",
		superscript: "text-superscript",
		code: "text-code",
		highlight: "text-highlight",
	},
};

export const Editor = ({ onValueChange, className, defaultValue, size = "md" }: EditorProps) => {
	return (
		<LexicalComposer
			initialConfig={{
				namespace: "Editor",
				nodes: [HeadingNode, ListItemNode, ListNode],
				theme,
				onError: (error) => console.error("editor error: ", error),
			}}>
			<div className="h-full w-full space-y-4">
				<div className="flex w-full flex-wrap items-center gap-1 rounded bg-neutral-100 p-2">
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
								padding: "16px",
								outline: "none",
							}}
							className={cn(
								"editor max-h-[500px] w-full overflow-y-auto border-2 text-lg transition-all duration-500 focus:border-primary-400",
								editorSize[size],
								className
							)}
						/>
					}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<HtmlPlugin initialHtml={defaultValue} onHtmlChanged={onValueChange} />
				<HistoryPlugin />
			</div>
		</LexicalComposer>
	);
};

const CustomHistoryActions = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	React.useEffect(() => {
		editor.focus();
	}, [editor]);

	return (
		<div className="flex items-center gap-1">
			<button
				title="Undo"
				className={`hover:bg-primary-00 grid place-items-center bg-primary-100 p-1.5 text-primary-400 transition-colors ${buttonSize[size]}`}
				onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
				<Undo className={`${iconSize[size]}`} />
			</button>
			<button
				title="Redo"
				className={`hover:bg-primary-00 grid place-items-center bg-primary-100 p-1.5 text-primary-400 transition-colors ${buttonSize[size]}`}
				onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
				<Redo className={`${iconSize[size]}`} />
			</button>
		</div>
	);
};

const CustomTextActions = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	const handleClick = (format: TextFormatType) => {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
	};

	return (
		<div className="flex items-center gap-1">
			{format_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					title={capitalize(label)}
					onClick={() => handleClick(label.toLowerCase() as TextFormatType)}
					className={`hover:bg-primary-00 grid place-items-center bg-primary-100 p-1.5 text-primary-400 transition-colors ${buttonSize[size]}`}>
					<Icon className={`${iconSize[size]}`} />
				</button>
			))}
		</div>
	);
};

const CustomAlignmentActions = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	const handleClick = (format: ElementFormatType) => {
		editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
	};

	return (
		<div className="flex items-center gap-1">
			{alignment_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					title={capitalize(label)}
					onClick={() => handleClick(label.toLowerCase() as ElementFormatType)}
					className={`hover:bg-primary-00 grid place-items-center bg-primary-100 p-1.5 text-primary-400 transition-colors ${buttonSize[size]}`}>
					<Icon className={`${iconSize[size]}`} />
				</button>
			))}
		</div>
	);
};

const CustomHeadingActions = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
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
					title={capitalize(label)}
					onClick={() => handleClick(label.toLowerCase() as HeadingTagType)}
					className={`hover:bg-primary-00 grid place-items-center bg-primary-100 p-1.5 text-primary-400 transition-colors ${buttonSize[size]}`}>
					<Icon className={`${iconSize[size]}`} />
				</button>
			))}
		</div>
	);
};

const CustomListActions = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
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
					title={capitalize(label)}
					onClick={() => handleClick(label.toLowerCase() as ListType)}
					className={`hover:bg-primary-00 grid place-items-center bg-primary-100 p-1.5 text-primary-400 transition-colors ${buttonSize[size]}`}>
					<Icon className={`${iconSize[size]}`} />
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
	const [isFirstRender, setIsFirstRender] = React.useState(true);
	const [editor] = useLexicalComposerContext();

	React.useEffect(() => {
		if (!initialHtml || isFirstRender) return;
		setIsFirstRender(false);

		editor.update(() => {
			const parser = new DOMParser();
			const dom = parser.parseFromString(initialHtml, "text/html");
			const nodes = $generateNodesFromDOM(editor, dom);
			$insertNodes(nodes);
		});
	}, [editor, initialHtml, isFirstRender]);

	return (
		<OnChangePlugin
			onChange={(editorState) => {
				editorState.read(() => {
					onHtmlChanged($generateHtmlFromNodes(editor, null));
				});
			}}
		/>
	);
};
