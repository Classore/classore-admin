import { RiBook2Line, RiSettings3Line } from "@remixicon/react";

export const create_course_tabs = [
	{ label: "create course", action: "course", icon: RiBook2Line },
	{ label: "quiz settings", action: "quiz", icon: RiSettings3Line },
	// { label: "assign teachers", action: "teacher", icon: RiUserAddLine },
];

export const course_sections = {
	chapters: {
		chapter: "col-[span_15_/_span_15]",
		lesson: "col-span-1",
	},
	lessons: {
		chapter: "col-span-1",
		lesson: "col-[span_15_/_span_15]",
	},
};