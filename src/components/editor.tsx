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
import {} from "@lexical/link";
import React from "react";
import {
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
	type EditorThemeClasses,
	type ElementFormatType,
	type TextFormatType,
	$getRoot,
	$getSelection,
	$insertNodes,
	$isRangeSelection,
} from "lexical";

import { alignment_types, format_types, heading_types, list_types } from "@/config";
import { cn, convertMdToHtml } from "@/lib";

interface Props {
	onValueChange: (text: string) => void;
	className?: string;
	defaultValue?: string;
	size?: "sm" | "md" | "lg";
}

const sizes: Record<string, string> = {
	lg: "size-5",
	md: "size-4",
	sm: "size-3",
};

export const RichTextEditor = React.memo(
	({ onValueChange, className, defaultValue, size = "md" }: Props) => {
		const theme = React.useMemo<EditorThemeClasses>(
			() => ({
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
			}),
			[]
		);

		const html = React.useMemo(() => {
			if (!defaultValue) return "";
			return convertMdToHtml(defaultValue);
		}, [defaultValue]);

		return (
			<LexicalComposer
				initialConfig={{
					namespace: "Editor",
					nodes: [HeadingNode, ListItemNode, ListNode],
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
								padding: "16px",
								outline: "none",
							}}
							className={cn(
								"editor max-h-[500px] w-full overflow-y-auto border-2 text-lg transition-all duration-500 focus:border-primary-400",
								className
							)}
						/>
					}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<HtmlPlugin initialHtml={html} onHtmlChanged={onValueChange} />
				<HistoryPlugin />
			</LexicalComposer>
		);
	}
);
RichTextEditor.displayName = "RichTextEditor";

const CustomHistoryActions = React.memo(({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	React.useEffect(() => {
		editor.focus();
	}, [editor]);

	return (
		<div className="flex items-center gap-1">
			<button
				className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-100/75 active:scale-[0.98]"
				onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
				<Undo className={sizes[size]} />
			</button>
			<button
				className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-100/75 active:scale-[0.98]"
				onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
				<Redo className={sizes[size]} />
			</button>
		</div>
	);
});
CustomHistoryActions.displayName = "CustomHistoryActions";

const CustomTextActions = React.memo(({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
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
					className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-100/75 active:scale-[0.98]">
					<Icon className={sizes[size]} />
				</button>
			))}
		</div>
	);
});
CustomTextActions.displayName = "CustomTextActions";

const CustomAlignmentActions = React.memo(({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
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
					className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-100/75 active:scale-[0.98]">
					<Icon className={sizes[size]} />
				</button>
			))}
		</div>
	);
});
CustomAlignmentActions.displayName = "CustomAlignmentActions";

const CustomHeadingActions = React.memo(({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
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
					className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-100/75 active:scale-[0.98]">
					<Icon className={sizes[size]} />
				</button>
			))}
		</div>
	);
});
CustomHeadingActions.displayName = "CustomHeadingActions";

const CustomListActions = React.memo(({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
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
					className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-100/75 active:scale-[0.98]">
					<Icon className={sizes[size]} />
				</button>
			))}
		</div>
	);
});
CustomListActions.displayName = "CustomListActions";

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
