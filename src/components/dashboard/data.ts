import {
	type RemixiconComponentType,
	RiListCheck3,
	RiShuffleLine,
	RiSkipForwardLine,
	RiTimeLine,
} from "@remixicon/react";

export type QuestionSettings = {
	description: string;
	label: string;
	icon: RemixiconComponentType;
	hasChildren: boolean;
	slug: string;
};

export const answer_settings: QuestionSettings[] = [
	{
		label: "Assign Pass Mark",
		icon: RiListCheck3,
		description:
			"Allow students to go to another chapter only after they have achieved a certain pass mark.",
		hasChildren: true,
		slug: "assign_pass_mark",
	},
	{
		label: "Attempts",
		icon: RiSkipForwardLine,
		description:
			"Set the number of attempts a student can take and the frequency at which they can take the quiz.",
		hasChildren: true,
		slug: "attempts",
	},
];

export const question_settings: QuestionSettings[] = [
	{
		label: "Shuffle Questions",
		icon: RiShuffleLine,
		description:
			"Let the system automatically shuffle questions for each attempt or anytime they attempt the quiz.",
		hasChildren: false,
		slug: "shuffle_questions",
	},
	{
		label: "Skip Questions",
		icon: RiSkipForwardLine,
		description:
			"Allow students to skip questions and allow them to revisit them before the limit is up",
		hasChildren: false,
		slug: "skip_questions",
	},
	{
		label: "Set Timer",
		icon: RiTimeLine,
		description:
			"Set a timer for the quiz to ensure students don't spend too much time on a quiz.",
		hasChildren: true,
		slug: "set_timer",
	},
];
