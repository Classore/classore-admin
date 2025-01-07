import type { CastedExamBundleProps, CastedExamTypeProps } from "@/types/casted-types";
import { endpoints } from "@/config";
import { axios } from "@/lib";
import type { HttpResponse, PaginatedResponse, PaginationProps } from "@/types";

export interface CreateCourseDto {
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

export interface CreateSubjectDto {
	name: string;
	examination_bundle: string;
	class: string;
}

export interface CreateChapterDto {
	content: string;
	id: string;
	images: File[];
	lessons: CreateLessonDto[];
	name: string;
	sequence: number;
	subjectId: string;
	videos: File[];
}

export interface CreateLessonDto {
	chapterId: string;
	content: string;
	files: File[];
	id: string;
	name: string;
	video: File | null;
}

const CreateBundle = async () => {};

const CreateCourse = async () => {};

const GetExaminaions = async (params?: PaginationProps & { search?: string }) => {
	return axios
		.get<
			HttpResponse<PaginatedResponse<CastedExamTypeProps>>
		>(endpoints().school.get_exams, { params })
		.then((res) => res.data);
};

const GetBundles = async (
	params?: PaginationProps & { examination?: string; search?: string }
) => {
	return axios
		.get<
			HttpResponse<PaginatedResponse<CastedExamBundleProps>>
		>(endpoints().school.get_exam_bundles, { params })
		.then((res) => res.data);
};

const GetBundle = async () => {};

const GetCourses = async () => {};

const GetCourse = async () => {};

export {
	CreateBundle,
	CreateCourse,
	GetBundles,
	GetBundle,
	GetCourses,
	GetCourse,
	GetExaminaions,
};
