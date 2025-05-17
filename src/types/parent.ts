import type { Maybe } from "./";

export type WardProps = {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	profile_image: Maybe<string>;
	progress: number;
};

export type ReferralProps = {
	count: number;
	day_or_month: string;
};

export type WithdrawalProps = {
	amount: number;
	date: Date | string;
	status: "pending" | "successful" | "failed";
};

export type WardSubjectProps = {
	subject_id: string;
	subject_copied_from: string | null;
	subject_createdOn: Date;
	subject_updatedOn: Date;
	subject_updatedBy: string | null;
	subject_deletedOn: Date | null;
	subject_deletedBy: string | null;
	subject_isDeleted: boolean;
	subject_isBlocked: boolean;
	subject_name: string;
	subject_description: string;
	subject_class: string | null;
	subject_examination: string;
	subject_examination_bundle: string;
	subject_bench_mark: number;
	subject_quiz_attempts_limit: number;
	subject_chapter_dripping: "YES" | "NO";
	subject_banner: string;
	subject_rating: string;
	subject_is_published: "YES" | "NO";
	subject_tutor: string | null;
};
