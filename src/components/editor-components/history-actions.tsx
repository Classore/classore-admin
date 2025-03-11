import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { REDO_COMMAND, UNDO_COMMAND } from "lexical";
import { Undo, Redo } from "lucide-react";
import React from "react";

const sizes: Record<string, string> = {
	lg: "size-5",
	md: "size-4",
	sm: "size-3",
};

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
