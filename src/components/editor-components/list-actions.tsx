import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { type ListType, $createListNode } from "@lexical/list";
import { $getSelection, $isRangeSelection } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import React from "react";

import { list_types } from "@/config";

const sizes: Record<string, string> = {
	lg: "size-5",
	md: "size-4",
	sm: "size-3",
};

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
