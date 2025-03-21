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

export type TestCenterQuestionTypeProps =
	| "FILL_IN_THE_GAP"
	| "LISTENING"
	| "MULTIPLE_CHOICE"
	| "SHORT_ANSWER"
	| "SPEAKING"
	| "YES_OR_NO";

export type TestCenterQuestionProps = Node & {
	__typename?: "Question";
	audio: string[];
	chapter: Maybe<string>;
	content: string;
	copied_from: Maybe<string>;
	id: string;
	images: string[];
	instructions: Maybe<string>;
	isBlocked: boolean;
	isDeleted: boolean;
	media: Maybe<string>;
	module: Maybe<string>;
	options: TestCenterOptionProps[];
	question_type: TestCenterQuestionTypeProps;
	score: 0;
	section: string;
	sequence: number;
	subject: Maybe<string>;
	test: string;
	test_section: string;
	videos: string[];
};

export type TestCenterOptionProps = Node & {
	__typename?: "Options";
	id: string;
	copied_from: Maybe<string>;
	isDeleted: boolean;
	isBlocked: boolean;
	sequence_number: number;
	content: string;
	images: string[];
	videos: string[];
	media: Maybe<string>;
	subject: Maybe<string>;
	chapter: Maybe<string>;
	test: string;
	test_section: string;
	question: string;
	is_correct: boolean;
};

export type TestCenterAnswerProps = Node & {
	__typename?: "Answer";
	answer: string;
	answer_id: string;
	question_id: string;
};
