/* eslint-disable @typescript-eslint/no-explicit-any */

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $createListNode, ListItemNode, ListNode } from "@lexical/list";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { $setBlocksType } from "@lexical/selection";
import type { EditorThemeClasses } from "lexical";
import { Redo, Undo } from "lucide-react";
import { $getRoot } from "lexical";
import React from "react";
import {
	$getSelection,
	$insertNodes,
	$isRangeSelection,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
} from "lexical";

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

export const Editor = React.memo(
	({ onValueChange, className, defaultValue, size = "md" }: EditorProps) => {
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
						<CustomActions size={size} types={heading_types} actionType="heading" />
						<CustomActions size={size} types={format_types} actionType="text" />
						<CustomActions size={size} types={alignment_types} actionType="alignment" />
						<CustomActions size={size} types={list_types} actionType="list" />
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
	}
);
Editor.displayName = "Editor";

const CustomHistoryActions = React.memo(({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
	const [editor] = useLexicalComposerContext();

	React.useEffect(() => {
		editor.focus();
	}, [editor]);

	const handleUndo = React.useCallback(
		() => editor.dispatchCommand(UNDO_COMMAND, undefined),
		[editor]
	);
	const handleRedo = React.useCallback(
		() => editor.dispatchCommand(REDO_COMMAND, undefined),
		[editor]
	);

	return (
		<div className="flex items-center gap-1">
			<ActionButton title="Undo" size={size} onClick={handleUndo}>
				<Undo className={`${iconSize[size]}`} />
			</ActionButton>
			<ActionButton title="Redo" size={size} onClick={handleRedo}>
				<Redo className={`${iconSize[size]}`} />
			</ActionButton>
		</div>
	);
});
CustomHistoryActions.displayName = "CustomHistoryActions";

const CustomActions = React.memo(
	({
		size = "md",
		types,
		actionType,
	}: {
		size?: "sm" | "md" | "lg";
		types: any[];
		actionType: string;
	}) => {
		const [editor] = useLexicalComposerContext();

		const handleClick = React.useCallback(
			(format: any) => {
				switch (actionType) {
					case "text":
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
						break;
					case "alignment":
						editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
						break;
					case "heading":
					case "list":
						editor.update(() => {
							const selection = $getSelection();
							if ($isRangeSelection(selection)) {
								$setBlocksType(selection, () =>
									actionType === "heading" ? $createHeadingNode(format) : $createListNode(format)
								);
							}
						});
						break;
				}
			},
			[editor, actionType]
		);

		return (
			<div className="flex items-center gap-1">
				{types.map(({ icon: Icon, label }) => (
					<ActionButton
						key={label}
						title={capitalize(label)}
						size={size}
						onClick={() => handleClick(label.toLowerCase())}>
						<Icon className={`${iconSize[size]}`} />
					</ActionButton>
				))}
			</div>
		);
	}
);
CustomActions.displayName = "CustomActions";

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

const ActionButton = React.memo(
	({
		title,
		size,
		onClick,
		children,
	}: {
		title: string;
		size: string;
		onClick: () => void;
		children: React.ReactNode;
	}) => (
		<button
			title={title}
			onClick={onClick}
			className={`hover:bg-primary-00 grid place-items-center bg-primary-100 p-1.5 text-primary-400 transition-colors ${buttonSize[size]}`}>
			{children}
		</button>
	)
);

ActionButton.displayName = "ActionButton";
