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
import React, { useCallback, useEffect, useMemo } from "react";
import { $setBlocksType } from "@lexical/selection";
import { Redo, Undo } from "lucide-react";
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
	PASTE_COMMAND,
} from "lexical";

import { alignment_types, format_types, heading_types, list_types } from "@/config";
import { cn, convertMdToHtml } from "@/lib";

interface Props {
	onValueChange: (text: string) => void;
	className?: string;
	defaultValue?: string;
}

export const Editor = React.memo(({ onValueChange, className, defaultValue }: Props) => {
	const theme = useMemo<EditorThemeClasses>(
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
				bold: "bold",
				italic: "italic",
				underline: "underline",
				strikethrough: "line-through",
				subscript: "subscript",
				superscript: "superscript",
				code: "code",
				highlight: "highlight",
			},
		}),
		[]
	);

	const html = useMemo(() => {
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
				<CustomHeadingActions />
				<CustomTextActions />
				<CustomAlignmentActions />
				<CustomListActions />
				<CustomHistoryActions />
			</div>
			<RichTextPlugin
				contentEditable={
					<ContentEditable
						style={{
							padding: "16px",
							outline: "none",
						}}
						className={cn(
							"editor max-h-[700px] w-full overflow-y-auto border-2 text-sm transition-all duration-500 focus:border-primary-400",
							className
						)}
					/>
				}
				ErrorBoundary={LexicalErrorBoundary}
			/>
			<HtmlPlugin initialHtml={html} onHtmlChanged={onValueChange} />
			<HistoryPlugin />
			<PasteFormatPlugin />
		</LexicalComposer>
	);
});
Editor.displayName = "RichText Editor";

const CustomHistoryActions = () => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		editor.focus();
	}, [editor]);

	return (
		<div className="flex items-center gap-1">
			<button
				className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-50"
				onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
				<Undo size={16} />
			</button>
			<button
				className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-50"
				onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
				<Redo size={16} />
			</button>
		</div>
	);
};

const CustomTextActions = () => {
	const [editor] = useLexicalComposerContext();

	const handleClick = useCallback(
		(format: TextFormatType) => {
			editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
		},
		[editor]
	);

	return (
		<div className="flex items-center gap-1">
			{format_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					onClick={() => handleClick(label.toLowerCase() as TextFormatType)}
					className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-50">
					<Icon size={16} />
				</button>
			))}
		</div>
	);
};

const CustomAlignmentActions = () => {
	const [editor] = useLexicalComposerContext();

	const handleClick = useCallback(
		(format: ElementFormatType) => {
			editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
		},
		[editor]
	);

	return (
		<div className="flex items-center gap-1">
			{alignment_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					onClick={() => handleClick(label.toLowerCase() as ElementFormatType)}
					className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-50">
					<Icon size={16} />
				</button>
			))}
		</div>
	);
};

const CustomHeadingActions = () => {
	const [editor] = useLexicalComposerContext();

	const handleClick = useCallback(
		(tag: HeadingTagType) => {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					$setBlocksType(selection, () => $createHeadingNode(tag));
				}
			});
		},
		[editor]
	);

	return (
		<div className="flex items-center gap-1">
			{heading_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					onClick={() => handleClick(label.toLowerCase() as HeadingTagType)}
					className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-50">
					<Icon size={16} />
				</button>
			))}
		</div>
	);
};

const CustomListActions = () => {
	const [editor] = useLexicalComposerContext();

	const handleClick = useCallback(
		(list: ListType) => {
			editor.update(() => {
				const selection = $getSelection();
				if ($isRangeSelection(selection)) {
					$setBlocksType(selection, () => $createListNode(list));
				}
			});
		},
		[editor]
	);

	return (
		<div className="flex items-center gap-1">
			{list_types.map(({ icon: Icon, label }) => (
				<button
					key={label}
					onClick={() => handleClick(label.toLowerCase() as ListType)}
					className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-50">
					<Icon size={16} />
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

	// Handle initial HTML content
	useEffect(() => {
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

	// Handle HTML output
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

// New plugin to handle paste with formatting
const PasteFormatPlugin = () => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		// Handle paste events to preserve formatting
		const unregisterPasteListener = editor.registerCommand(
			PASTE_COMMAND,
			(event: ClipboardEvent) => {
				// If there's HTML content in the clipboard
				if (event.clipboardData && event.clipboardData.types.includes("text/html")) {
					const htmlString = event.clipboardData.getData("text/html");

					editor.update(() => {
						try {
							// Parse HTML from clipboard
							const parser = new DOMParser();
							const dom = parser.parseFromString(htmlString, "text/html");

							// Generate Lexical nodes from the HTML DOM
							const nodes = $generateNodesFromDOM(editor, dom);

							// Get current selection
							const selection = $getSelection();

							// Insert the nodes at current selection
							if ($isRangeSelection(selection)) {
								selection.insertNodes(nodes);
							}
						} catch (error) {
							console.error("Error handling formatted paste:", error);
							return false; // Let the default paste handler take over
						}
					});

					// Prevent default paste behavior
					event.preventDefault();
					return true; // Command handled
				}

				// Allow default paste handling for non-HTML content
				return false;
			},
			// Higher priority to intercept before default paste handler
			1
		);

		return () => {
			unregisterPasteListener();
		};
	}, [editor]);

	return null;
};
