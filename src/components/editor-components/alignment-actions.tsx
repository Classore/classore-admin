import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_ELEMENT_COMMAND, type ElementFormatType } from "lexical";
import React from "react";

import { alignment_types } from "@/config";

const sizes: Record<string, string> = {
	lg: "size-5",
	md: "size-4",
	sm: "size-3",
};

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
