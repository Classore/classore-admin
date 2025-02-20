import { axios, createFormDataFromObject } from "@/lib";
import type { QuestionDto } from "@/store/z-store/quiz";
import { endpoints } from "@/config";
import type {
	CastedChapterModuleProps,
	CastedChapterProps,
	CastedQuestionProps,
	ChapterModuleProps,
	ChapterProps,
	HttpResponse,
	MakeOptional,
	PaginatedResponse,
	PaginationProps,
	QuestionTypeProps,
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
	attachment_urls: string[];
	content: string;
	images: File[];
	image_urls: string[];
	sequence: number;
	title: string;
	videos: File[];
	video_urls: string[];
	tutor: string;
}

export interface CreateQuestionDto {
	content: string;
	images: File[];
	options: CreateOptionsDto[];
	question_type: QuestionTypeProps;
	sequence: number;
	sequence_number: number;
}

export interface CreateOptionsDto {
	content: string;
	is_correct: "YES" | "NO";
	sequence_number: number;
	images?: File[];
}

export type UpdateChapterModuleDto = MakeOptional<
	CreateChapterModuleDto,
	| "attachments"
	| "attachment_urls"
	| "content"
	| "images"
	| "image_urls"
	| "title"
	| "tutor"
	| "videos"
	| "video_urls"
>;

export type GetChapterModuleResponse = HttpResponse<PaginatedResponse<CastedChapterModuleProps>>;

const CreateChapter = async (payload: CreateChapterDto) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.post<HttpResponse<ChapterProps>>(endpoints(payload.subject_id).school.create_chapter, formData)
		.then((res) => res.data);
};

const CreateChapterModule = async (chapter_id: string, payload: CreateChapterModuleDto) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.post<
			HttpResponse<ChapterModuleProps>
		>(endpoints(chapter_id).school.create_chapter_module, formData)
		.then((res) => res.data);
};

const CreateQuestions = async (module_id: string, payload: QuestionDto[]) => {
	const formData = new FormData();
	payload.forEach((question, index) => {
		formData.append(`questions[${index}][sequence]`, question.sequence.toString());
		formData.append(`questions[${index}][content]`, question.content);
		formData.append(`questions[${index}][question_type]`, question.question_type);
		formData.append(`questions[${index}][sequence_number]`, question.sequence_number.toString());
		question.images.forEach((image, imageIndex) => {
			formData.append(`questions[${index}][images][${imageIndex}]`, image, image.name);
		});
		question.options?.forEach((option, optionIndex) => {
			formData.append(
				`questions[${index}][options][${optionIndex}][sequence_number]`,
				option.sequence_number.toString()
			);
			if (option.content) {
				formData.append(`questions[${index}][options][${optionIndex}][content]`, option.content);
			}
			if (option.is_correct !== undefined) {
				formData.append(
					`questions[${index}][options][${optionIndex}][is_correct]`,
					option.is_correct.toString()
				);
			}
		});
	});
	return axios
		.post<HttpResponse<string>>(endpoints(module_id).school.create_questions, formData)
		.then((res) => res.data);
};

const GetChapters = async (params?: PaginationProps & {}) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return axios
		.get<PaginatedResponse<CastedChapterProps[]>>(endpoints().school.get_chapters, { params })
		.then((res) => res.data);
};

const GetChapterModules = async (params?: PaginationProps & { chapter_id?: string }) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
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

const GetQuestions = async (params?: PaginationProps & { chapter_id: string }) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return axios
		.get<
			HttpResponse<PaginatedResponse<CastedQuestionProps>>
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
	return axios.put(endpoints(id).school.update_chapter_module, formData).then((res) => res.data);
};

const UpdateChapterModule = async (id: string, payload: UpdateChapterModuleDto) => {
	const formData = createFormDataFromObject(payload);
	return axios.put(endpoints(id).school.update_chapter_module, formData).then((res) => res.data);
};

const UpdateQuestion = async (id: string, payload: Partial<CreateQuestionDto>) => {
	return axios.put(endpoints(id).school.update_chapter_module, payload).then((res) => res.data);
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
