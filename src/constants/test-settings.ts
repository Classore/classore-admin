import {
	RiListCheck3,
	RiShuffleLine,
	RiSkipForwardLine,
	RiTimerLine,
	type RemixiconComponentType,
} from "@remixicon/react";

export type TestSettingAction = "ATTEMPTS" | "PASS_MARK" | "SHUFFLE" | "SKIP_QUESTIONS" | "TIMER";

export type TestSettingsProps = {
	label: string;
	settings: {
		label: string;
		description: string;
		icon: RemixiconComponentType;
		action: TestSettingAction;
	}[];
};

export const TEST_SETTINGS: TestSettingsProps[] = [
	{
		label: "question settings",
		settings: [
			{
				label: "shuffle questions",
				description:
					"Let the system automatically shuffle questions for each attempt or anytime they attempt the quiz.",
				icon: RiShuffleLine,
				action: "SHUFFLE",
			},
			{
				label: "skip questions",
				description:
					"Allow students to skip questions and allow them to revisit them before the limit is up",
				icon: RiSkipForwardLine,
				action: "SKIP_QUESTIONS",
			},
			{
				label: "set timer",
				description:
					"Allow students to skip questions and allow them to revisit them before the limit is up",
				icon: RiTimerLine,
				action: "TIMER",
			},
		],
	},
	{
		label: "answer settings",
		settings: [
			{
				label: "assign pass mark",
				description:
					"Let the system automatically shuffle questions for each attempt or anytime they attempt the quiz.",
				icon: RiListCheck3,
				action: "PASS_MARK",
			},
			{
				label: "attempts",
				description:
					"Allow students to skip questions and allow them to revisit them before the limit is up",
				icon: RiSkipForwardLine,
				action: "ATTEMPTS",
			},
		],
	},
];
