import React from "react";

interface UseDragProps<T> {
	items: T[];
	onReorder: (items: T[]) => void;
}

/**
 * @description A React hook that provides functionality for drag and drop reordering of items.
 *
 * @param items - An array of items to be reordered.
 * @param onReorder - A callback function that is called when the items are reordered, with the new array of items.
 * @returns An object containing the current dragged index, the index of the item being dragged over, and a set of props to be applied to the draggable items.
 *
 * @example
 * const Component = () => {
 *   const { draggedIndex, draggedOverIndex, getDragProps } = useDrag({
 *     items: [1, 2, 3, 4, 5],
 *     onReorder: (items) => console.log(items),
 *   });
 *
 *   return (
 *     <div>
 *       {items.map((item, index) => (
 *         <div
 *           key={item}
 *           {...getDragProps(index)}
 *         >
 *           {item}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 */
export const useDrag = <T extends any>({ items, onReorder }: UseDragProps<T>) => {
	const [draggedOverIndex, setDraggedOverIndex] = React.useState<number | null>(null);
	const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

	const handleDragStart = (index: number) => {
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		setDraggedOverIndex(index);
	};

	const handleDragEnd = () => {
		if (draggedIndex !== null && draggedOverIndex !== null) {
			const newItems = [...items];
			const [draggedItem] = newItems.splice(draggedIndex, 1);
			newItems.splice(draggedOverIndex, 0, draggedItem);
			onReorder(newItems);
		}

		setDraggedIndex(null);
		setDraggedOverIndex(null);
	};

	const getDragProps = (index: number) => ({
		draggable: true,
		onDragStart: () => handleDragStart(index),
		onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
		onDragEnd: handleDragEnd,
		className: `
      ${draggedIndex === index ? "drop-shadow-2xl" : ""}
      ${draggedOverIndex === index ? "drop-shadow-2xl drop-shadow-primary-500" : ""}
    `,
	});

	return {
		draggedIndex,
		draggedOverIndex,
		getDragProps,
	};
};
