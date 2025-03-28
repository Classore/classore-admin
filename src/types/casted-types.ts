import type { Maybe, OptionsProps, QuestionTypeProps, VideoProps } from ".";

export type CastedExamTypeProps = {
	examination_id: string;
	examination_copied_from: string;
	examination_createdOn: string;
	examination_updatedOn: string;
	examination_updatedBy: string;
	examination_deletedOn: string;
	examination_deletedBy: string;
	examination_isDeleted: boolean;
	examination_isBlocked: boolean;
	examination_name: string;
	examination_banner: string;
	examination_rating: string;
	examination_is_published: string;
};

export type CastedExamBundleProps = {
	examinationbundle_allow_extra_subjects: "NO" | "YES";
	examinationbundle_allowed_subjects: number;
	examinationbundle_amount: number;
	examinationbundle_amount_per_subject: number;
	examinationbundle_banner: string;
	examinationbundle_createdon: Date;
	examinationbundle_examination: string;
	examinationbundle_extra_charge: number;
	examinationbundle_end_date: Date;
	examinationbundle_id: string;
	examinationbundle_is_published: "YES" | "NO";
	examinationbundle_isblocked: boolean;
	examinationbundle_isdeleted: boolean;
	examinationbundle_max_subjects: number;
	examinationbundle_name: string;
	examinationbundle_rating: number;
	examinationbundle_description: string;
	examinationbundle_start_date: Date;
	examinationbundle_updatedby: Maybe<string>;
	examinationbundle_updatedon: Maybe<Date>;
	examination_name: string;
	subject_count: number;
	enrolled: number;
};

export type CastedCourseProps = {
	subject_class: string;
	subject_createdOn: Date;
	subject_deletedBy: Maybe<string>;
	subject_deletedOn: Maybe<Date>;
	subject_examination: string;
	subject_examination_bundle: string;
	subject_id: string;
	subject_isBlocked: boolean;
	subject_isDeleted: boolean;
	subject_name: string;
	subject_updatedBy: Maybe<string>;
	subject_updatedOn: Date;
	subject_is_published: "NO" | "YES";
	subject_banner: string;
	subject_rating: number;
	subject_chapter_dripping: "NO" | "YES";
};

export type CastedChapterProps = {
	chapter_id: string;
	chapter_createdOn: Date;
	chapter_updatedOn: Maybe<Date>;
	chapter_updatedBy: Maybe<string>;
	chapter_deletedOn: Maybe<Date>;
	chapter_deletedBy: Maybe<string>;
	chapter_isDeleted: boolean;
	chapter_isBlocked: boolean;
	chapter_subject_id: string;
	chapter_name: string;
	chapter_sequence: number;
	chapter_images: string[];
	chapter_videos: string[];
	chapter_content: string;
};

export type CastedChapterModuleProps = {
	chapter_module_id: string;
	chapter_module_createdOn: Date;
	chapter_module_updatedOn: Maybe<Date>;
	chapter_module_updatedBy: Maybe<string>;
	chapter_module_deletedOn: Maybe<Date>;
	chapter_module_deletedBy: Maybe<string>;
	chapter_module_isDeleted: boolean;
	chapter_module_isBlocked: boolean;
	chapter_module_chapter: string;
	chapter_module_title: string;
	chapter_module_attachments: string[];
	chapter_module_sequence: number;
	chapter_module_images: string[];
	chapter_module_video_array: VideoProps[];
	chapter_module_videos: string[];
	chapter_module_content: string;
	chapter_module_tutor: string;
	chapter_module_is_published: "NO" | "YES";
};

export type CastedQuestionProps = {
	question_id: string;
	question_createdOn: Date;
	question_updatedOn: Maybe<Date>;
	question_updatedBy: Maybe<string>;
	question_deletedOn: Maybe<Date>;
	question_deletedBy: Maybe<string>;
	question_isDeleted: boolean;
	question_isBlocked: boolean;
	question_sequence: number;
	question_content: string;
	question_question_type: QuestionTypeProps;
	question_images: string[];
	question_videos: string[];
	question_subject: string;
	question_chapter: string;
	question_score: string;
	options: OptionsProps[];
};

export type CastedUserProps = {
	user_id: string;
	user_createdOn: Date;
	user_updatedOn: Date;
	user_updatedBy: Maybe<string>;
	user_deletedOn: Maybe<Date>;
	user_deletedBy: Maybe<string>;
	user_isDeleted: boolean;
	user_isBlocked: boolean;
	user_first_name: string;
	user_last_name: string;
	user_email: string;
	user_phone_number: Maybe<string>;
	user_description: Maybe<string>;
	user_access_token: string;
	user_referral_code: string;
	user_profile_image: string | undefined;
	user_is_verified: boolean;
	user_chosen_study_plan: boolean;
	user_user_type: "STUDENT" | "PARENT";
	user_wallet_id: string;
	user_sign_up_channel: "DEFAULT";
	user_my_wards: CastedUserProps[];
	user_parent: Maybe<CastedUserProps>;
	user_birthday: Maybe<Date>;
};
