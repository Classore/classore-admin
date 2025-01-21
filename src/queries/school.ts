import { endpoints } from "@/config";
import { axios } from "@/lib";
import type {
	CastedCourseProps,
	CastedExamBundleProps,
	CastedExamTypeProps,
} from "@/types/casted-types";
import type {
	ChapterProps,
	CourseProps,
	ExamProps,
	ExamBundleProps,
	HttpResponse,
	PaginatedResponse,
	PaginationProps,
} from "@/types";

export interface CreateSubjectDto {
	examination_bundle: string;
	categoryId: string;
	description: string;
	name: string;
}

export interface CreateBundleDto {
	name: string;
	amount: number;
	start_date: Date;
	end_date: Date;
	examination: string;
	max_subjects: number;
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

export type ExaminationResponse = HttpResponse<PaginatedResponse<CastedExamTypeProps>>;
export type CourseResponse = HttpResponse<PaginatedResponse<CastedCourseProps>>;
export type ExaminationBundleResponse = HttpResponse<
	PaginatedResponse<CastedExamBundleProps>
>;

const CreateBundle = async (payload: CreateBundleDto) => {
	return axios
		.post<HttpResponse<ExamBundleProps>>(endpoints().school.create_exam_bundle, payload)
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

const GetBundles = async (
	params?: PaginationProps & { examination?: string; search?: string }
) => {
	if (params) {
		for (const key in params) {
			if (
				!params[key as keyof typeof params] ||
				params[key as keyof typeof params] === undefined
			) {
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
			if (
				!params[key as keyof typeof params] ||
				params[key as keyof typeof params] === undefined
			) {
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
			if (
				!params[key as keyof typeof params] ||
				params[key as keyof typeof params] === undefined
			) {
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

export {
	CreateBundle,
	CreateSubject,
	GetBundles,
	GetBundle,
	GetSubjects,
	GetSubject,
	GetExaminations,
};
