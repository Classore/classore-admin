import {
	type RemixiconComponentType,
	RiListCheck3,
	RiShuffleLine,
	RiSkipForwardLine,
	RiTimeLine,
} from "@remixicon/react";

export type QuestionSettings = {
	label: string;
	icon: RemixiconComponentType;
	description: string;
	hasChildren: boolean;
};

export const answer_settings: QuestionSettings[] = [
	{
		label: "Assign Pass Mark",
		icon: RiListCheck3,
		description:
			"Let the system automatically shuffle questions for each attempt or anytime they attempt the quiz.",
		hasChildren: true,
	},
	{
		label: "Attempts",
		icon: RiSkipForwardLine,
		description:
			"Allow students to skip questions and allow them to revisit them before the limit is up",
		hasChildren: true,
	},
];

export const question_settings: QuestionSettings[] = [
	{
		label: "Shuffle Questions",
		icon: RiShuffleLine,
		description:
			"Let the system automatically shuffle questions for each attempt or anytime they attempt the quiz.",
		hasChildren: false,
	},
	{
		label: "Skip Questions",
		icon: RiSkipForwardLine,
		description:
			"Allow students to skip questions and allow them to revisit them before the limit is up",
		hasChildren: false,
	},
	{
		label: "Set Timer",
		icon: RiTimeLine,
		description:
			"Allow students to skip questions and allow them to revisit them before the limit is up",
		hasChildren: true,
	},
];
