import { axios, createFormDataFromObject } from "@/lib";
import { endpoints } from "@/config";
import type {
	CastedChapterModuleProps,
	CastedChapterProps,
	CastedQuestionProps,
} from "@/types/casted-types";
import type {
	ChapterModuleProps,
	ChapterProps,
	HttpResponse,
	MakeOptional,
	PaginatedResponse,
	PaginationProps,
} from "@/types";

export interface CreateChapterDto {
	content: string;
	images: File[];
	name: string;
	sequence: number;
	subject_id: string;
	videos: File[];
}

export interface CreateChapterModuleDto {
	attachments: File[];
	content: string;
	images: File[];
	sequence: number;
	title: string;
	videos: File[];
	tutor: string;
}

export interface CreateQuestionDto {
	content: string;
	images: File[];
	options: CreateOptionsDto[];
	question_type:
		| "MULTICHOICE"
		| "SINGLECHOICE"
		| "SHORTANSWER"
		| "TRUORFALSE"
		| (string & {});
	sequence: number;
}

export interface CreateOptionsDto {
	content: string;
	images: File[];
	is_correct: "YES" | "NO";
	sequence_number: number;
}

export type UpdateChapterModuleDto = MakeOptional<
	CreateChapterModuleDto,
	"attachments" | "content" | "images" | "title" | "tutor" | "videos"
>;

const CreateChapter = async (payload: CreateChapterDto) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.post<
			HttpResponse<ChapterProps>
		>(endpoints(payload.subject_id).school.create_chapter, formData)
		.then((res) => res.data);
};

const CreateChapterModule = async (
	chapter_id: string,
	payload: CreateChapterModuleDto
) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.post<
			HttpResponse<ChapterModuleProps>
		>(endpoints(chapter_id).school.create_chapter_module, formData)
		.then((res) => res.data);
};

const CreateQuestions = async (module_id: string, payload: CreateQuestionDto[]) => {
	return axios
		.post<HttpResponse<string>>(endpoints(module_id).school.create_questions, payload)
		.then((res) => res.data);
};

const GetChapters = async (params?: PaginationProps & {}) => {
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
			PaginatedResponse<CastedChapterProps[]>
		>(endpoints().school.get_chapters, { params })
		.then((res) => res.data);
};

const GetChapterModules = async (params?: PaginationProps & { chapter_id?: string }) => {
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
			HttpResponse<PaginatedResponse<CastedChapterModuleProps>>
		>(endpoints().school.get_chapter_modules, { params })
		.then((res) => res.data);
};

const GetQuestions = async (params?: PaginationProps & {}) => {
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
			PaginatedResponse<CastedQuestionProps[]>
		>(endpoints().school.get_questions, { params })
		.then((res) => res.data);
};

const GetChapter = async (id: string) => {
	return id;
};

const GetChapterModule = async (id: string) => {
	return id;
};

const GetQuestion = async (id: string) => {
	return id;
};

const UpdateChapter = async (id: string, payload: Partial<CreateChapterDto>) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.put(endpoints(id).school.update_chapter_module, formData)
		.then((res) => res.data);
};

const UpdateChapterModule = async (id: string, payload: UpdateChapterModuleDto) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.put(endpoints(id).school.update_chapter_module, formData)
		.then((res) => res.data);
};

const UpdateQuestion = async (id: string, payload: Partial<CreateQuestionDto>) => {
	return axios
		.put(endpoints(id).school.update_chapter_module, payload)
		.then((res) => res.data);
};

const DeleteChapter = async (id: string) => {
	return id;
};

const DeleteChapterModule = async (id: string) => {
	return id;
};

const DeleteQuestion = async (id: string) => {
	return id;
};

export {
	CreateChapter,
	CreateChapterModule,
	CreateQuestions,
	DeleteChapter,
	DeleteChapterModule,
	DeleteQuestion,
	GetChapter,
	GetChapterModule,
	GetChapterModules,
	GetChapters,
	GetQuestion,
	GetQuestions,
	UpdateChapter,
	UpdateChapterModule,
	UpdateQuestion,
};
