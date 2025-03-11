import type { EditorThemeClasses, EditorState } from "lexical";
import React, { useMemo, useCallback, useEffect } from "react";
import { Redo, Undo } from "lucide-react";
import dynamic from "next/dynamic";

// Import types for TypeScript support
// import type { HeadingTagType } from "@lexical/rich-text";
// import type { ListType } from "@lexical/list";
// import type {
//   EditorThemeClasses,
//   ElementFormatType,
//   TextFormatType,
//   LexicalEditor,
//   EditorState,
//   LexicalNode,
//   NodeKey,
//   CommandListenerPriority,
//   LexicalCommand,
// } from "lexical";

import { cn, debounce } from "@/lib";

interface Props {
	onValueChange: (text: string) => void;
	className?: string;
	defaultValue?: string;
	size?: "sm" | "md" | "lg";
}

interface HtmlPluginProps {
	initialHtml?: string;
	onHtmlChanged: (html: string) => void;
}

const sizes: Record<string, string> = {
	lg: "size-5",
	md: "size-4",
	sm: "size-3",
};

const editorTheme: EditorThemeClasses = {
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

// Dynamically import heavy lexical components
const LexicalComposer = dynamic(
	() => import("@lexical/react/LexicalComposer").then((mod) => mod.LexicalComposer),
	{ ssr: false }
);
const RichTextPlugin = dynamic(
	() => import("@lexical/react/LexicalRichTextPlugin").then((mod) => mod.RichTextPlugin),
	{ ssr: false }
);
const ContentEditable = dynamic(
	() => import("@lexical/react/LexicalContentEditable").then((mod) => mod.ContentEditable),
	{ ssr: false }
);
const LexicalErrorBoundary = dynamic(
	() => import("@lexical/react/LexicalErrorBoundary").then((mod) => mod.LexicalErrorBoundary),
	{ ssr: false }
);
const HistoryPlugin = dynamic(
	() => import("@lexical/react/LexicalHistoryPlugin").then((mod) => mod.HistoryPlugin),
	{ ssr: false }
);
const OnChangePlugin = dynamic(
	() => import("@lexical/react/LexicalOnChangePlugin").then((mod) => mod.OnChangePlugin),
	{ ssr: false }
);

interface ActionButtonProps {
	onClick: () => void;
	children: React.ReactNode;
}

// Simplified button component to reduce render overhead
const ActionButton: React.FC<ActionButtonProps> = React.memo(({ onClick, children }) => (
	<button
		className="grid place-items-center rounded-md bg-primary-100 p-1 text-primary-400 transition-colors duration-300 hover:bg-primary-100/75 active:scale-[0.98]"
		onClick={onClick}>
		{children}
	</button>
));
ActionButton.displayName = "ActionButton";

// Create a lazy-loaded editor component
export const RichTextEditor: React.FC<Props> = React.memo(
	({ onValueChange, className, defaultValue, size = "md" }) => {
		// Lazy load the html converter
		const convertMdToHtml = useCallback((markdown: string): string => {
			// Simple implementation to avoid dependency on full converter during SSR
			return markdown;
		}, []);

		const html = useMemo(() => {
			if (!defaultValue) return "";
			return convertMdToHtml(defaultValue);
		}, [defaultValue, convertMdToHtml]);

		// Lazy load node imports on client
		const getNodes = useCallback(() => {
			// This will only run on client-side
			const { HeadingNode } = require("@lexical/rich-text");
			const { ListItemNode, ListNode } = require("@lexical/list");
			return [HeadingNode, ListItemNode, ListNode];
		}, []);

		// Initialize with a simpler editor on client mount
		return (
			<div className="rich-text-editor-container">
				{typeof window !== "undefined" && (
					<LexicalComposer
						initialConfig={{
							namespace: "Editor",
							nodes: getNodes(),
							theme: editorTheme,
							onError: (error: Error) => console.error("editor error: ", error),
						}}>
						<div className="flex w-full items-center gap-1 py-1">
							<LazyToolbar size={size} />
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
						<LazyHtmlPlugin initialHtml={html} onHtmlChanged={onValueChange} />
						<HistoryPlugin />
					</LexicalComposer>
				)}
			</div>
		);
	}
);
RichTextEditor.displayName = "RichTextEditor";

interface ToolbarProps {
	size?: "sm" | "md" | "lg";
}

// Lazy load the toolbar with all action components
const LazyToolbar: React.FC<ToolbarProps> = React.memo(({ size = "md" }) => {
	const [isClient, setIsClient] = React.useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) return null;

	// These are dynamically imported to prevent server-side loading
	const { CustomHeadingActions } = require("./editor-components/heading-actions");
	const { CustomTextActions } = require("./editor-components/text-actions");
	const { CustomAlignmentActions } = require("./editor-components/alignment-actions");
	const { CustomListActions } = require("./editor-components/list-actions");
	const { CustomHistoryActions } = require("./editor-components/history-actions");

	return (
		<>
			<CustomHeadingActions size={size} />
			<CustomTextActions size={size} />
			<CustomAlignmentActions size={size} />
			<CustomListActions size={size} />
			<CustomHistoryActions size={size} />
		</>
	);
});
LazyToolbar.displayName = "LazyToolbar";

// Lazy load HTML plugin
const LazyHtmlPlugin: React.FC<HtmlPluginProps> = React.memo(({ initialHtml, onHtmlChanged }) => {
	const [isClient, setIsClient] = React.useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) return null;

	// Minimal implementation to avoid performance issues
	const { useLexicalComposerContext } = require("@lexical/react/LexicalComposerContext");
	const { $generateHtmlFromNodes, $generateNodesFromDOM } = require("@lexical/html");
	const { $getRoot, $insertNodes } = require("lexical");

	const HtmlPlugin: React.FC<HtmlPluginProps> = ({ initialHtml, onHtmlChanged }) => {
		const [editor] = useLexicalComposerContext();

		// Debounce the onChange handler
		const debouncedOnChange = useCallback(
			debounce((html: string) => {
				onHtmlChanged(html);
			}, 300),
			[onHtmlChanged]
		);

		useEffect(() => {
			if (!initialHtml) return;

			const initEditor = async () => {
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
			};

			initEditor();
		}, [editor, initialHtml]);

		return (
			<OnChangePlugin
				onChange={(editorState: EditorState) => {
					editorState.read(() => {
						try {
							const html = $generateHtmlFromNodes(editor, null);
							debouncedOnChange(html);
						} catch (error) {
							console.error("Error generating HTML:", error);
						}
					});
				}}
			/>
		);
	};

	return <HtmlPlugin initialHtml={initialHtml} onHtmlChanged={onHtmlChanged} />;
});
LazyHtmlPlugin.displayName = "LazyHtmlPlugin";

export const CustomHistoryActions: React.FC<ToolbarProps> = React.memo(({ size = "md" }) => {
	const { useLexicalComposerContext } = require("@lexical/react/LexicalComposerContext");
	const { UNDO_COMMAND, REDO_COMMAND } = require("lexical");

	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		// Don't auto-focus to avoid unnecessary redraws
		// editor.focus();
	}, [editor]);

	return (
		<div className="flex items-center gap-1">
			<ActionButton onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
				<Undo className={sizes[size]} />
			</ActionButton>
			<ActionButton onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
				<Redo className={sizes[size]} />
			</ActionButton>
		</div>
	);
});
CustomHistoryActions.displayName = "CustomHistoryActions";
