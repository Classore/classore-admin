import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { cn } from "@/lib";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	selected: string | number;
	value: string | number;
	children?: React.ReactNode;
	className?: string;
	innerClassName?: string;
	animated?: boolean;
	preserveContent?: boolean;
}

/**
 * @description The `TabPanel` component is a React component that renders a tab panel with optional animation and content preservation. It is used to display content associated with a specific tab in a tab interface.
 *
 * @param {Props} props - The props object for the `TabPanel` component.
 * @param {string | number} props.selected - The currently selected tab value, which can be a string or number.
 * @param {string | number} props.value - The value of the current tab, which can be a string or number.
 * @param {React.ReactNode} props.children - The content to be displayed in the tab panel.
 * @param {string} [props.className] - An optional CSS class name to be applied to the outer `div` element.
 * @param {string} [props.innerClassName] - An optional CSS class name to be applied to the inner `div` element that contains the `children`.
 * @param {boolean} [props.animated] - A boolean that determines whether the tab panel content should be animated when it becomes visible or hidden.
 * @param {boolean} [props.preserveContent] - A boolean that determines whether the tab panel content should be preserved even when the tab is not selected.
 * @returns {JSX.Element} - The rendered `TabPanel` component.
 *
 * @example
 * <TabPanel selected={selectedTab} value="tab1">
 *   <div>Content for Tab 1</div>
 * </TabPanel>
 */
const TabPanel = React.forwardRef<HTMLDivElement, Props>(
	(
		{
			selected,
			value,
			children,
			className,
			innerClassName,
			animated = true,
			preserveContent = false,
		},
		ref
	) => {
		if (typeof selected !== typeof value) {
			throw new Error("TabPanel: selected and value must be of the same type");
		}

		const isSelected = selected === value;
		const content = <div className={cn("h-full w-full", innerClassName)}>{children}</div>;

		return (
			<div
				ref={ref}
				role="tabpanel"
				hidden={!isSelected}
				id={`tabpanel-${value}`}
				aria-labelledby={`tab-${value}`}
				aria-hidden={!isSelected}
				tabIndex={isSelected ? 0 : -1}
				className={cn(
					"h-full w-full outline-none",
					"focus-visible:ring-2 focus-visible:ring-blue-500",
					className
				)}>
				{animated ? (
					<AnimatePresence mode="wait">
						{(isSelected || preserveContent) && (
							<motion.div
								key={`${value}`}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
								className="h-full w-full">
								{content}
							</motion.div>
						)}
					</AnimatePresence>
				) : (
					isSelected && content
				)}
			</div>
		);
	}
);

TabPanel.displayName = "TabPanel";

export { TabPanel };
export type { Props as TabPanelProps };
