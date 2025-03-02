import { format } from "date-fns";

import { endpoints } from "@/config";
import { axios } from "@/lib";
import type {
	CastedCourseProps,
	CastedExamBundleProps,
	CastedExamTypeProps,
	ChapterProps,
	CourseProps,
	EntityTypeProps,
	ExamProps,
	ExamBundleProps,
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
}

export interface CreateBundleDto {
	allowed_subjects: number;
	allow_extra_subjects: "YES" | "NO";
	amount: number;
	amount_per_subject: number;
	banner: File | null;
	end_date: Date;
	examination: string;
	extra_charge: number;
	max_subjects: number;
	name: string;
	start_date: Date;
}

export interface ExamBundleResponse {
	examBundle: ExamBundleProps;
	subjects: PaginatedResponse<CastedCourseProps>;
}

export interface SubjectResponse {
	chapters: ChapterProps[];
	examination: ExamProps;
	examination_bundle: ExamBundleProps;
	name: string;
}

export interface ChangeDirectoryDto {
	bundle: string;
	examination: string;
	subject: string;
}

export type ExaminationResponse = HttpResponse<PaginatedResponse<CastedExamTypeProps>>;
export type CourseResponse = HttpResponse<PaginatedResponse<CastedCourseProps>>;
export type BundlesResponse = HttpResponse<PaginatedResponse<CastedExamBundleProps>>;
export type BundleResponse = HttpResponse<ExamBundleResponse>;
export type ExaminationBundleResponse = HttpResponse<PaginatedResponse<CastedExamBundleProps>>;

const CreateExamination = async (payload: CreateExaminationDto) => {
	return axios
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
	return axios
		.post<HttpResponse<ExamBundleProps>>(endpoints().school.create_exam_bundle, formData)
		.then((res) => res.data);
};

const CreateSubject = async (payload: CreateSubjectDto) => {
	return axios
		.post<HttpResponse<CourseProps>>(endpoints().school.create_subject, payload)
		.then((res) => res.data);
};

const GetExaminations = async (params?: PaginationProps & { search?: string }) => {
	return axios
		.get<
			HttpResponse<PaginatedResponse<CastedExamTypeProps>>
		>(endpoints().school.get_exams, { params })
		.then((res) => res.data);
};

const GetBundles = async (params?: PaginationProps & { examination?: string; search?: string }) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return axios
		.get<
			HttpResponse<PaginatedResponse<CastedExamBundleProps>>
		>(endpoints().school.get_exam_bundles, { params })
		.then((res) => res.data);
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
	return axios
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
	return axios
		.get<
			HttpResponse<PaginatedResponse<CastedCourseProps>>
		>(endpoints().school.get_subjects, { params })
		.then((res) => res.data);
};

const GetSubject = async (id: string) => {
	return axios
		.get<HttpResponse<SubjectResponse>>(endpoints(id).school.get_subject)
		.then((res) => res.data);
};

const DeleteEntity = async (model_type: EntityTypeProps, ids: string[]) => {
	return axios
		.delete<HttpResponse<string>>(endpoints().school.delete, { data: { ids, model_type } })
		.then((res) => res.data);
};

export {
	CreateBundle,
	CreateExamination,
	CreateSubject,
	DeleteEntity,
	GetBundles,
	GetBundle,
	GetExaminations,
	GetSubjects,
	GetSubject,
};
