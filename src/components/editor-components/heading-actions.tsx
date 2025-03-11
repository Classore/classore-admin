import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { type HeadingTagType, $createHeadingNode } from "@lexical/rich-text";
import { $getSelection, $isRangeSelection } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {} from "@lexical/link";
import React from "react";

import { heading_types } from "@/config";

const sizes: Record<string, string> = {
	lg: "size-5",
	md: "size-4",
	sm: "size-3",
};

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
