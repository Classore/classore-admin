/**
 * Represents a type that can be either T or null
 * @template T - The type that can be nullable
 * @example
 * type MaybeString = Maybe<string>; // string | null
 */
export type Maybe<T> = T | null;

/**
 * Represents a type that can be either T or undefined
 * @template T - The type that can be undefined
 * @example
 * type UndefinedNumber = Undefined<number>; // number | undefined
 */
export type Undefined<T> = T | undefined;

/**
 * Creates a type that requires all properties of T to match exactly
 * @template T - An object type with string keys
 * @example
 * type ExactPerson = Exact<{ name: string; age: number }>
 */
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K];
};

/**
 * Makes specified properties of T optional and nullable
 * @template T - The base type
 * @template K - Keys of T to make optional and nullable
 * @example
 * interface Person { name: string; age: number; }
 * type OptionalAgePerson = MakeOptional<Person, 'age'>;
 * { name: string; age?: number | null; }
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>;
};

/**
 * Makes specified properties of T nullable while keeping them required
 * @template T - The base type
 * @template K - Keys of T to make nullable
 * @example
 * interface Person { name: string; age: number; }
 * type NullableAgePerson = MakeMaybe<Person, 'age'>;
 * { name: string; age: number | null; }
 */
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>;
};

/**
 * Gets a union type of all the values in T
 * @template T - The object type to extract values from
 * @example
 * const colors = { red: 'RED', blue: 'BLUE' } as const;
 * type Colors = ValueOf<typeof colors>; // 'RED' | 'BLUE'
 */
export type ValueOf<T> = T[keyof T];

/**
 * Creates a type for an array that must contain at least one element
 * @template T - The type of elements in the array
 * @example
 * const numbers: NonEmptyArray<number> = [1]; // valid
 * const empty: NonEmptyArray<number> = []; // invalid
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Ensures an array type includes all possible values of type T
 * @template T - The type that must be included
 * @template U - Array type that should include T
 * @example
 * type Status = 'active' | 'inactive';
 * type ValidStatuses = MustInclude<Status, ['active', 'inactive']>;
 */
export type MustInclude<T, U extends T[]> = [T] extends [ValueOf<U>] ? U : never;

export type OptionalString<T> = T | (string & {});

export interface IconProps extends React.SVGProps<SVGSVGElement> {
	className?: string;
}

export interface HttpResponse<T> {
	error: string;
	data: T;
	message: string;
	success: boolean;
}

export type HttpError = {
	response: {
		data: {
			error: string;
			errorCode: string;
			message: string | string[];
			status: string;
			success: boolean;
		};
	};
};

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		itemCount: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
		page: number;
		pageCount: number;
		take: number;
	};
}

export type PaginationProps = {
	limit?: number;
	page?: number;
};

export type Period = "THIS_YEAR" | "THIS_MONTH" | "THIS_WEEK" | "TODAY";

export type QueryParamsProps = {
	[key: string]: string | number | boolean | undefined | null;
};

export type Node = {
	__typename?: "Node";
	id: string;
	createdOn: Date | string;
	deletedBy?: Maybe<string>;
	deletedOn?: Maybe<Date | string>;
	isDeleted?: boolean;
	updatedBy?: Maybe<string>;
	updatedOn?: Maybe<Date | string>;
};

export type EntityTypeProps =
	| "USER"
	| "ADMIN"
	| "CHAPTER"
	| "CHAPTER_MODULE"
	| "COURSE"
	| "EXAM_BUNDLE"
	| "EXAMINATION"
	| "OPTION"
	| "QUESTION"
	| "QUIZ"
	| "ROLE"
	| "SCORE"
	| "SUBJECT";

export type PaginatedRoleProps = {
	id: string;
	createdOn: Date | string;
	deletedBy?: Maybe<string>;
	deletedOn?: Maybe<Date | string>;
	isDeleted?: boolean;
	updatedBy?: Maybe<string>;
	updatedOn?: Maybe<Date | string>;
	isBlocked: boolean;
	permissions: string[];
	name: string;
	admin_read: "NO" | "YES";
	admin_write: "NO" | "YES";
	student_read: "NO" | "YES";
	student_write: "NO" | "YES";
	transactions_read: "NO" | "YES";
	transactions_write: "NO" | "YES";
	tutor_read: "NO" | "YES";
	tutor_write: "NO" | "YES";
	videos_read: "NO" | "YES";
	videos_write: "NO" | "YES";
	waitlist_read: "NO" | "YES";
	waitlist_write: "NO" | "YES";
	role_id: string;
	role_createdOn: Date | string;
	role_deletedBy?: Maybe<string>;
	role_deletedOn?: Maybe<Date | string>;
	role_isDeleted?: boolean;
	role_updatedBy?: Maybe<string>;
	role_updatedOn?: Maybe<Date | string>;
	role_isBlocked: boolean;
	role_name: string;
	role_admin_read: "NO" | "YES";
	role_admin_write: "NO" | "YES";
	role_marketer_read: "NO" | "YES";
	role_marketer_write: "NO" | "YES";
	role_student_read: "NO" | "YES";
	role_student_write: "NO" | "YES";
	role_transactions_read: "NO" | "YES";
	role_transactions_write: "NO" | "YES";
	role_tutor_read: "NO" | "YES";
	role_tutor_write: "NO" | "YES";
	role_videos_read: "NO" | "YES";
	role_videos_write: "NO" | "YES";
	role_waitlist_read: "NO" | "YES";
	role_waitlist_write: "NO" | "YES";
};

export type RoleProps = {
	id: string;
	createdOn: Date | string;
	deletedBy?: Maybe<string>;
	deletedOn?: Maybe<Date | string>;
	isDeleted?: boolean;
	updatedBy?: Maybe<string>;
	updatedOn?: Maybe<Date | string>;
	isBlocked: boolean;
	permissions: string[];
	name: string;
	admin_read: "NO" | "YES";
	admin_write: "NO" | "YES";
	student_read: "NO" | "YES";
	student_write: "NO" | "YES";
	transactions_read: "NO" | "YES";
	transactions_write: "NO" | "YES";
	tutor_read: "NO" | "YES";
	tutor_write: "NO" | "YES";
	videos_read: "NO" | "YES";
	videos_write: "NO" | "YES";
	waitlist_read: "NO" | "YES";
	waitlist_write: "NO" | "YES";
	role_id: string;
	role_createdOn: Date | string;
	role_deletedBy?: Maybe<string>;
	role_deletedOn?: Maybe<Date | string>;
	role_isDeleted?: boolean;
	role_updatedBy?: Maybe<string>;
	role_updatedOn?: Maybe<Date | string>;
	role_isBlocked: boolean;
	role_name: string;
	role_admin_read: "NO" | "YES";
	role_admin_write: "NO" | "YES";
	role_marketer_read: "NO" | "YES";
	role_marketer_write: "NO" | "YES";
	role_student_read: "NO" | "YES";
	role_student_write: "NO" | "YES";
	role_transactions_read: "NO" | "YES";
	role_transactions_write: "NO" | "YES";
	role_tutor_read: "NO" | "YES";
	role_tutor_write: "NO" | "YES";
	role_videos_read: "NO" | "YES";
	role_videos_write: "NO" | "YES";
	role_waitlist_read: "NO" | "YES";
};

export type AdminProps = Node & {
	id: string;
	first_name: string;
	last_name: string;
	phone_number: string | null;
	email: string;
	is_deleted: boolean;
	is_blocked: boolean;
	role: string;
};

export type ViewAdminProps = {
	admin_id: string;
	admin_copied_from: string | null;
	admin_createdOn: Date;
	admin_updatedOn: Date;
	admin_updatedBy: string | null;
	admin_deletedOn: Date | null;
	admin_deletedBy: string | null;
	admin_isDeleted: boolean;
	admin_isBlocked: boolean;
	admin_first_name: string;
	admin_last_name: string;
	admin_phone_number: string | null;
	admin_email: string;
	admin_access_token: string;
	admin_referal_code: string;
	admin_wallet_id: string | null;
	admin_player_id: string | null;
	admin_referral_percentage_for_marketers: string;
	admin_roleId: string;
	role_id: string;
	role_copied_from: string | null;
	role_createdOn: Date;
	role_updatedOn: Date;
	role_updatedBy: string | null;
	role_deletedOn: Date | null;
	role_deletedBy: string | null;
	role_isDeleted: boolean;
	role_isBlocked: boolean;
	role_name: string;
	role_waitlist_read: "NO" | "YES";
	role_waitlist_write: "NO" | "YES";
	role_student_read: "NO" | "YES";
	role_student_write: "NO" | "YES";
	role_admin_read: "NO" | "YES";
	role_admin_write: "NO" | "YES";
	role_tutor_read: "NO" | "YES";
	role_tutor_write: "NO" | "YES";
	role_videos_read: "NO" | "YES";
	role_videos_write: "NO" | "YES";
	role_transactions_read: "NO" | "YES";
	role_transactions_write: "NO" | "YES";
	role_marketer_read: "NO" | "YES";
	role_marketer_write: "NO" | "YES";
	role_admin_delete_read: "NO" | "YES";
	role_admin_delete_write: "NO" | "YES";
	courses: {
		id: string;
		createdOn: Date;
		updatedOn: Date;
		subjects: {
			id: string;
			createdOn: Date;
			name: string;
		}[];
		exam: string;
		exam_bundle: {
			id: string;
			createdOn: Date;
			updatedOn: Date;
			name: string;
			amount: number;
			start_date: Date;
			end_date: Date;
		};
	}[];
	referral_list: {
		referral_id: string;
		referral_copied_from: null;
		referral_createdOn: Date;
		referral_updatedOn: Date;
		referral_updatedBy: null;
		referral_deletedOn: null;
		referral_deletedBy: null;
		referral_isDeleted: boolean;
		referral_isBlocked: boolean;
		referral_referrer_id: string;
		referral_referee_id: string;
		referral_type: null;
		referral_referee_type: string;
		referral_verified: boolean;
		referral_redeemed: boolean;
		referral_referral_code: null;
		referral_points: number;
		user_first_name: string;
		user_last_name: string;
		user_email: string;
		user_id: string;
	}[];
	leaderboard: {
		leaderboard_id: string;
		leaderboard_user: string;
		leaderboard_points: number;
		leaderboard_examination: string;
		leaderboard_examination_bundle: string;
		examination_bundle_name: string;
		examination_name: string;
		user_id: string;
		user_first_name: string;
		user_last_name: string;
		user_email: string;
		user_profile_image: null;
		position: string;
	}[];
};

export type AdminOneProps = Node & {
	__typename?: "User";
	access_token: string;
	email: string;
	first_name: string;
	is_blocked: boolean;
	is_deleted: boolean;
	last_name: string;
	phone_number: string;
	role: RoleProps;
};

export type UserProps = Node & {
	__typename?: "User";
	email: string;
	first_name: string;
	last_name: string;
	phone_number: string;
};

export type ViewUserProps = {
	__typename?: "User";
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	access_token: string;
	referral_code: string;
	profile_image: string | null;
	is_verified: boolean;
	isDeleted: boolean;
	user_type: "PARENT" | "STUDENT";
	wallet_balance: number;
	sign_up_channel: string;
	classore_points: number;
	ranking: number;
	referrals: number;
	streak: number;
	quiz_points: number;
	createdOn: Date;
	updatedOn: Date;
	isBlocked: boolean;
	courses: ViewUserCourse[];
	referral_list: ViewUserReferral[];
	leaderboard: ViewUserLeaderboard[];
};

export type ViewUserCourse = {
	id: string;
	createdOn: Date;
	updatedOn: Date;
	subjects: {
		id: string;
		createdOn: Date;
		name: string;
	}[];
	exam: string;
	exam_bundle: {
		id: string;
		createdOn: Date;
		updatedOn: Date;
		name: string;
		amount: number;
		start_date: Date;
		end_date: Date;
	};
};

export type ViewUserReferral = {
	referral_id: string;
	referral_copied_from: string | null;
	referral_createdOn: Date;
	referral_updatedOn: Date;
	referral_updatedBy: string | null;
	referral_deletedOn: Date | null;
	referral_deletedBy: string | null;
	referral_isDeleted: boolean;
	referral_isBlocked: boolean;
	referral_referrer_id: string;
	referral_referee_id: string;
	referral_type: string | null;
	referral_referee_type: "PARENT" | "STUDENT";
	referral_verified: boolean;
	referral_redeemed: boolean;
	referral_referral_code: string | null;
	referral_points: number;
	user_first_name: string;
	user_last_name: string;
	user_email: string;
	user_id: string;
};

export type ViewUserLeaderboard = {
	leaderboard_id: string;
	leaderboard_user: string;
	leaderboard_points: number;
	leaderboard_examination: string;
	leaderboard_examination_bundle: string;
	examination_bundle_name: string;
	examination_name: string;
	user_id: string;
	user_first_name: string;
	user_last_name: string;
	user_email: string;
	user_profile_image: string | null;
	position: string;
};

export type ExamProps = Node & {
	__typename?: "Exam";
	name: string;
};

export type ExamBundleProps = Node & {
	amount: number;
	end_date: Date;
	examination: string;
	id: string;
	isBlocked: boolean;
	isDeleted: boolean;
	max_subjects: number;
	name: string;
	start_date: Date;
};

export type CourseProps = Node & {
	__typename?: "Course";
	class: Maybe<string>;
	examination: string;
	examination_bundle: string;
	id: string;
	isBlocked: boolean;
	isDeleted: boolean;
	media: {
		files: string[];
		videos: string[];
	};
	name: string;
};

export type ChapterProps = Node & {
	__typename?: "Chapter";
	subject_id: string;
	name: string;
	sequence: number;
	images: string[];
	videos: string[];
	content: string;
	bench_mark: string;
	shuffle_questions: string;
	skip_questions: string;
	timer_minute: number;
	timer_hour: number;
	attempt_limit: number;
	attempt_reset: number;
	is_published: "YES" | "NO";
};

export type ChapterModuleProps = Node & {
	__typename?: "Chapter Module";
	attachments: string[];
	chapter: string;
	title: string;
	sequence: number;
	sequence_number: number;
	images: string[];
	video_array: VideoProps[];
	videos: string[];
	content: string;
	tutor: Maybe<string>;
};

export type VideoProps = {
	derived_url: string;
	duration: number;
	secure_url: string;
};

export type QuestionProps = Node & {
	__typename?: "Question";
	content: string;
	images: File[];
	options: OptionsProps[];
	question_type: QuestionTypeProps;
	sequence: number;
	sequence_number: number;
};

export type OptionsProps = Node & {
	__typename?: "Options";
	chapter: string;
	content: string;
	images: string[];
	is_correct: boolean;
	module: string;
	question: string;
	sequence_number: number;
	subject: string;
};

//
export type AnswerProps = {
	answer: string;
	answer_id: string;
	question_id: string;
};

export type QuestionTypeProps = OptionalString<"YES_OR_NO" | "MULTICHOICE" | "FILL_IN_THE_GAP">;

export type WaitlistUserProps = {
	waitlists_createdOn: Date | string;
	waitlists_deletedBy: Maybe<string>;
	waitlists_deletedOn?: Date | string;
	waitlists_email: string;
	waitlists_first_name: string;
	waitlists_id: string;
	waitlists_isDeleted?: boolean;
	waitlists_last_name: string;
	waitlists_phone_number: string;
	waitlists_updateBy: Maybe<string>;
	waitlists_updateOn?: Date | string;
	waitlists_waitlist_type: string;
};

export type Event = Node & {
	category_id: {
		id: string;
		name: string;
	};
	date: Date;
	end_hour: number;
	event_day: number;
	is_active: boolean;
	start_hour: number;
	sub_category: {
		id: string;
		name: string;
	};
	subject: {
		id: string;
		name: string;
	};
	title: string;
};

export type EventProps = {
	__typename: "Event";
	date: Date;
	day: number;
	events: Event[];
};

export type DayProps = {
	day: Maybe<number>;
	events: EventProps[];
};

export type SubscriptionProps = Node & {
	__typename?: "Subscription";
	amount: number;
	currency: string;
	first_name: string;
	last_name: string;
	narration: string;
	narration_id: string;
	reference: string;
	status: "PENDING" | "SUCCESSFUL" | "FAILED" | "REVERSAL";
	type: "CREDIT" | "DEBIT";
	user_email: string;
	user_id: string;
	user_type: "PARENT" | "STUDENT";
};

export type RatingProps = {
	id: string;
	rating: number;
	review: string;
	user_id: string;
};

export type BankProps = {
	bank_id: string;
	bank_copied_from: Maybe<string>;
	bank_createdOn: Maybe<Date>;
	bank_updatedOn: Maybe<Date>;
	bank_updatedBy: Maybe<string>;
	bank_deletedOn: Maybe<Date>;
	bank_deletedBy: Maybe<string>;
	bank_isDeleted: boolean;
	bank_isBlocked: boolean;
	bank_name: string;
	bank_slug: string;
	bank_code: string;
	bank_longcode: string;
};

export type SettingConfig = {
	Withdrawal_limit: number;
	allow_withdrawal: "NO" | "YES";
	limit_withdrawal: "NO" | "YES";
	point_conversion_factor: string | number;
	point_per_completed_module: string | number;
	referral_active: "NO" | "YES";
	referral_percentage_for_marketers: string | number;
	referral_percentage_for_parents: string | number;
	referral_percentage_for_students: string | number;
};
