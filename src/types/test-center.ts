import type { Maybe, Node } from "./app";

export type TestCenterProps = Node & {
	__typename?: "TestCenter";
	banner: string;
	createdOn: Date;
	description: string;
	id: string;
	is_published: "NO" | "YES";
	participants: number;
	sections: number;
	title: string;
	updatedOn: Maybe<Date>;
};

export type TestCenterSectionProps = Node & {
	__typename?: "Section";
	id: string;
	title: string;
	description: string;
	banner: string;
	sections: number;
	average_pass_score: number;
	is_published: "NO" | "YES";
};

export type TestCenterQuestionTypeProps = "MULTICHOICE" | "YES_OR_NO" | "SPEAKING" | "LISTENING";

export type TestCenterQuestionProps = Node & {
	__typename?: "Question";
	content: string;
	is_required: boolean;
	options: TestCenterOptionProps[];
	question_type: TestCenterQuestionTypeProps;
	sequence: number;
	sequence_number: number;
	audio?: File | string;
	images?: (File | string)[];
	max_recording_duration?: number;
	max_replays_allowed?: number;
	shuffled_options?: boolean;
};

export type TestCenterOptionProps = Node & {
	__typename?: "Options";
	content: string;
	is_correct: "YES" | "NO";
	questionId: string;
	sequence_number: number;
	audio?: File | string;
	images?: (File | string)[];
};

export type TestCenterAnswerProps = Node & {
	__typename?: "Answer";
	answer: string;
	answer_id: string;
	question_id: string;
};
