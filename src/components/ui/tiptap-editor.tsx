/* eslint-disable react/display-name */
import { cn } from "@/lib";
import {
	RiBold,
	RiH1,
	RiH2,
	RiH3,
	RiItalic,
	RiListOrdered,
	RiListUnordered,
	RiParagraph,
	RiStrikethrough,
	RiSubscript,
	RiSuperscript,
	RiUnderline,
} from "@remixicon/react";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Redo2, Undo2 } from "lucide-react";
import React from "react";

const MenuBar = ({ editor }: { editor: Editor | null }) => {
	if (!editor) {
		return null;
	}

	return (
		<div className="tiptap-btn-container flex flex-wrap items-center gap-1.5 border-b border-b-neutral-200 p-2 text-[10px]">
			<button
				type="button"
				title="Paragraph"
				onClick={() => editor.chain().focus().setParagraph().run()}
				className={editor.isActive("paragraph") ? "is-active" : ""}>
				<RiParagraph className="size-3" />
			</button>
			<button
				type="button"
				title="Bold"
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={editor.isActive("bold") ? "is-active" : ""}>
				<RiBold className="size-3" />
			</button>
			<button
				type="button"
				title="Italic"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={editor.isActive("italic") ? "is-active" : ""}>
				<RiItalic className="size-3" />
			</button>
			<button
				type="button"
				title="Underline"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				disabled={!editor.can().chain().focus().toggleUnderline().run()}
				className={editor.isActive("underline") ? "is-active" : ""}>
				<RiUnderline className="size-3" />
			</button>
			<button
				type="button"
				title="Strikethrough"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				disabled={!editor.can().chain().focus().toggleStrike().run()}
				className={editor.isActive("strike") ? "is-active" : ""}>
				<RiStrikethrough className="size-3" />
			</button>
			{/* <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</button>
				<button onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</button> */}

			<button
				type="button"
				title="Heading 1"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}>
				<RiH1 className="size-3" />
			</button>
			<button
				type="button"
				title="Heading 2"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}>
				<RiH2 className="size-3" />
			</button>
			<button
				type="button"
				title="Heading 3"
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}>
				<RiH3 className="size-3" />
			</button>
			{/* <button
				type="button"
				title="Heading 4"
				onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
				className={editor.isActive("heading", { level: 4 }) ? "is-active" : ""}>
				<RiH4 className="size-3" />
			</button> */}
			{/*
			<button
				onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
				className={editor.isActive("heading", { level: 5 }) ? "is-active" : ""}>
				H5
			</button>
			<button
				onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
				className={editor.isActive("heading", { level: 6 }) ? "is-active" : ""}>
				H6
			</button> */}

			<button
				type="button"
				title="Subscript"
				onClick={() => editor.chain().focus().toggleSubscript().run()}
				className={editor.isActive("subscript") ? "is-active" : ""}>
				<RiSubscript className="size-3" />
			</button>
			<button
				type="button"
				title="Superscript"
				onClick={() => editor.chain().focus().toggleSuperscript().run()}
				className={editor.isActive("superscript") ? "is-active" : ""}>
				<RiSuperscript className="size-3" />
			</button>
			<button
				type="button"
				title="Unordered List"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={editor.isActive("bulletList") ? "is-active" : ""}>
				<RiListUnordered className="size-3" />
			</button>
			<button
				type="button"
				title="Ordered List"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={editor.isActive("orderedList") ? "is-active" : ""}>
				<RiListOrdered className="size-3" />
			</button>
			{/* <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>Horizontal rule</button> */}
			<button
				type="button"
				title="Undo"
				className="cursor-pointer"
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().chain().focus().undo().run()}>
				<Undo2 className="size-3" />
			</button>
			<button
				type="button"
				title="Redo"
				className="cursor-pointer"
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().chain().focus().redo().run()}>
				<Redo2 className="size-3" />
			</button>
		</div>
	);
};

const extensions = [
	StarterKit.configure({
		bulletList: {
			keepMarks: true,
			keepAttributes: false,
		},
		orderedList: {
			keepMarks: true,
			keepAttributes: false,
		},
	}),
	Placeholder.configure({
		placeholder: "Start typing here...",
	}),
	Subscript,
	Superscript,
	Underline,
];

type TiptapProps = {
	className?: string;
	editorClassName?: string;
	value: string;
	initialValue?: string;
	onChange: (value: string) => void;
};
export const TiptapEditor = ({
	className,
	editorClassName,
	onChange,
	value,
	initialValue,
}: TiptapProps) => {
	const editor = useEditor({
		extensions,
		content: initialValue || value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: cn(
					"prose-sm w-full focus:outline-none prose-li:list-item min-h-32 pb-2 px-3",
					editorClassName
				),
			},
		},
	});

	React.useEffect(() => {
		if (editor && initialValue) {
			editor.commands.setContent(initialValue);
		}

		if (!initialValue) {
			editor?.commands.setContent("")
		}
	}, [initialValue, editor]);

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-2 overflow-hidden rounded-md border border-neutral-200 bg-white focus-within:ring-2 focus-within:ring-primary-300",
				className
			)}>
			<MenuBar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
};
