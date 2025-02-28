import type { Node, OptionalString } from "./app";

export type TestCenterProps = Node & {
	__typename?: "TestCenter";
	allowed_attempts: number;
	allowed_time: number;
	description: string;
	name: string;
	participants: number;
	pass_mark: number;
	sections: TestCenterSectionProps[];
	shuffle_questions: boolean;
	skip_questions: boolean;
	status: "PUBLISHED" | "UNPUBLISHED";
};

export type TestCenterSectionProps = Node & {
	__typename?: "Section";
	description: string;
	name: string;
	questions: TestCenterQuestionProps[];
};

export type TestCenterQuestionTypeProps = OptionalString<
	"MULTICHOICE" | "YES_OR_NO" | "FILL_IN_THE_GAP" | "SPEAKING" | "LISTENING"
>;

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
