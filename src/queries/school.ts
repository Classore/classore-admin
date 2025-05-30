import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { endpoints } from "@/config";
import { api } from "@/lib";
import type {
	CastedCourseProps,
	CastedExamBundleProps,
	CastedExamTypeProps,
	ChapterProps,
	CourseProps,
	EntityTypeProps,
	ExamBundleProps,
	ExamProps,
	HttpResponse,
	PaginatedResponse,
	PaginationProps,
} from "@/types";

export interface CreateExaminationDto {
	name: string;
}

export interface CreateSubjectDto {
	examination_bundle: string;
	categoryId: string;
	description: string;
	name: string;
	banner: File | string | null;
	chapter_dripping: "YES" | "NO";
	tags?: string[];
	tutor?: string;
}

export interface CreateBundleDto {
	allowed_subjects: number;
	allow_extra_subjects: "YES" | "NO";
	amount: number;
	amount_per_subject: number;
	banner: File | string | null;
	end_date: Date;
	examination: string;
	extra_charge: number;
	max_subjects: number;
	name: string;
	start_date: Date;
	description: string;
}

export interface ExamBundleResponse {
	examBundle: ExamBundleProps;
	subjects: PaginatedResponse<CastedCourseProps>;
}

export interface SubjectResponse {
	chapters: ChapterProps[];
	videos: Array<{
		duration: number;
		secure_url: string;
		derived_url: string;
	}>;
	examination: ExamProps;
	examination_bundle: ExamBundleProps;
	name: string;
	description: string;
	chapter_dripping: "YES" | "NO";
	banner: string;
	is_published: "YES" | "NO";
	tutor: {
		id: string;
		first_name: string;
		last_name: string;
		email: string;
	};
}

export interface ChangeDirectoryDto {
	bundle: string;
	examination: string;
	subject: string;
}

export interface DuplicateResourceDto {
	subject_id: string;
	exam_bundle_id: string;
	is_chapters: "YES" | "NO";
	is_modules: "YES" | "NO";
	is_questions: "YES" | "NO";
	is_options: "YES" | "NO";
}

export type ExaminationResponse = HttpResponse<PaginatedResponse<CastedExamTypeProps>>;
export type CourseResponse = HttpResponse<PaginatedResponse<CastedCourseProps>>;
export type BundlesResponse = HttpResponse<PaginatedResponse<CastedExamBundleProps>>;
export type BundleResponse = HttpResponse<ExamBundleResponse>;
export type ExaminationBundleResponse = HttpResponse<PaginatedResponse<CastedExamBundleProps>>;

const CreateExamination = async (payload: CreateExaminationDto) => {
	return api
		.post<HttpResponse<ExamProps>>(endpoints().school.create_exam, payload)
		.then((res) => res.data);
};

const CreateBundle = async (payload: CreateBundleDto) => {
	const formData = new FormData();
	formData.append("allow_extra_subjects", payload.allow_extra_subjects);
	formData.append("allowed_subjects", payload.allowed_subjects.toString());
	formData.append("amount", payload.amount.toString());
	formData.append("amount_per_subject", payload.amount_per_subject.toString());
	formData.append("banner", payload.banner as File);
	formData.append("end_date", format(payload.end_date, "MM/dd/yyyy"));
	formData.append("examination", payload.examination);
	formData.append("extra_charge", payload.extra_charge.toString());
	formData.append("max_subjects", payload.max_subjects.toString());
	formData.append("name", payload.name);
	formData.append("start_date", format(payload.start_date, "MM/dd/yyyy"));
	return api
		.post<HttpResponse<ExamBundleProps>>(endpoints().school.create_exam_bundle, formData)
		.then((res) => res.data);
};

const CreateSubject = async (payload: CreateSubjectDto) => {
	const formData = new FormData();
	formData.append("examination_bundle", payload.examination_bundle);
	formData.append("categoryId", payload.categoryId);
	formData.append("description", payload.description);
	formData.append("name", payload.name);
	formData.append("banner", payload.banner as File);
	formData.append("chapter_dripping", payload.chapter_dripping.toString());

	return api
		.post<HttpResponse<CourseProps>>(endpoints().school.create_subject, formData)
		.then((res) => res.data);
};

const GetExaminations = async (params?: PaginationProps & { search?: string }) => {
	return api
		.get<
			HttpResponse<PaginatedResponse<CastedExamTypeProps>>
		>(endpoints().school.get_exams, { params })
		.then((res) => res.data);
};
export const useGetAllExaminations = (params: PaginationProps) => {
	return useQuery({
		queryKey: ["get-examinations", params],
		queryFn: () => GetExaminations(params),
		staleTime: Infinity,
		gcTime: Infinity,
	});
};

const GetBundles = async (params?: PaginationProps & { examination?: string; search?: string }) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return api
		.get<
			HttpResponse<PaginatedResponse<CastedExamBundleProps>>
		>(endpoints().school.get_exam_bundles, { params })
		.then((res) => res.data);
};
export const useGetAllBundles = (params: PaginationProps) => {
	return useQuery({
		queryKey: ["get-bundles", params],
		queryFn: () => GetBundles(params),
		staleTime: Infinity,
		gcTime: Infinity,
	});
};

const GetBundle = async (
	id: string,
	params?: PaginationProps & {
		examination?: string;
		examination_bundle?: string;
		search?: string;
	}
) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return api
		.get<HttpResponse<ExamBundleResponse>>(endpoints(id).school.get_exam_bundle, { params })
		.then((res) => res.data);
};

const GetSubjects = async (
	params?: PaginationProps & {
		examination: string;
		examination_bundle: string;
		search?: string;
	}
) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return api
		.get<
			HttpResponse<PaginatedResponse<CastedCourseProps>>
		>(endpoints().school.get_subjects, { params })
		.then((res) => res.data);
};

const GetSubject = async (id: string) => {
	return api
		.get<HttpResponse<SubjectResponse>>(endpoints(id).school.get_subject)
		.then((res) => res.data);
};

const UpdateBundle = async (id: string, payload: Partial<CreateBundleDto>) => {
	const formData = new FormData();
	if (payload.allow_extra_subjects) {
		formData.append("allow_extra_subjects", payload?.allow_extra_subjects?.toString());
	}
	if (payload.allowed_subjects) {
		formData.append("allowed_subjects", payload.allowed_subjects?.toString());
	}
	if (payload.amount) {
		formData.append("amount", payload.amount.toString());
	}
	if (payload.amount_per_subject) {
		formData.append("amount_per_subject", payload.amount_per_subject.toString());
	}
	if (payload.banner && payload.banner instanceof File) {
		formData.append("banner", payload.banner);
	}
	if (payload.end_date) {
		formData.append("end_date", format(payload.end_date, "MM/dd/yyyy"));
	}
	if (payload.examination) {
		formData.append("examination", payload?.examination);
	}
	if (payload.extra_charge) {
		formData.append("extra_charge", payload.extra_charge.toString());
	}
	if (payload.max_subjects) {
		formData.append("max_subjects", payload.max_subjects.toString());
	}
	if (payload.name) {
		formData.append("name", payload.name);
	}
	if (payload.start_date) {
		formData.append("start_date", format(payload.start_date, "MM/dd/yyyy"));
	}
	if (payload.description) {
		formData.append("description", payload.description);
	}
	return api
		.put<HttpResponse<CastedExamBundleProps>>(endpoints(id).school.update_exam_bundle, formData)
		.then((res) => res.data);
};

const UpdateSubject = async (id: string, payload: Partial<CreateSubjectDto>) => {
	const formData = new FormData();
	if (payload.examination_bundle) {
		formData.append("examination_bundle", payload.examination_bundle);
	}
	if (payload.categoryId) {
		formData.append("categoryId", payload.categoryId);
	}
	if (payload.description) {
		formData.append("description", payload.description);
	}
	if (payload.name) {
		formData.append("name", payload.name);
	}
	if (payload.banner && payload.banner instanceof File) {
		formData.append("banner", payload.banner);
	}
	if (payload.chapter_dripping) {
		formData.append("chapter_dripping", payload.chapter_dripping.toString());
	}
	if (payload.tutor) {
		formData.append("tutor", payload.tutor.toString());
	}

	return api
		.put<HttpResponse<CourseProps>>(endpoints(id).school.update_subject, formData)
		.then((res) => res.data);
};

const DeleteEntity = async (model_type: EntityTypeProps, ids: string[]) => {
	return api
		.delete<HttpResponse<string>>(endpoints().school.delete, { data: { ids, model_type } })
		.then((res) => res.data);
};

type PublishResourcePayload = {
	id: string;
	model_type: "EXAMINATION" | "EXAM_BUNDLE" | "SUBJECT" | "CHAPTER" | "CHAPTER_MODULE";
	publish: "YES" | "NO";
};

const PublishResource = async (payload: PublishResourcePayload) => {
	return api
		.put<HttpResponse<string>>(endpoints().school.publish_entity, payload)
		.then((res) => res.data);
};

const DuplicateResource = async (payload: DuplicateResourceDto) => {
	return api
		.post<HttpResponse<string>>(endpoints().school.duplicate_resource, payload)
		.then((res) => res.data);
};

export {
	CreateBundle,
	CreateExamination,
	CreateSubject,
	DeleteEntity,
	DuplicateResource,
	GetBundle,
	GetBundles,
	GetExaminations,
	GetSubject,
	GetSubjects,
	PublishResource,
	UpdateBundle,
	UpdateSubject,
};
