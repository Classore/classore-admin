import { endpoints } from "@/config";
import { axios, createFormDataFromObject } from "@/lib";
import type { QuestionDto } from "@/store/z-store/quiz";
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
	title: string;
	content: string;
	sequence: number;
	tutor: string;
	attachment_urls: string[];
	videos: (File | string)[];
	images: (File | string)[];
	attachments: (File | string)[];
	image_urls: string[];
	video_urls: string[];
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

export type GetChapterModuleResponse = HttpResponse<
	PaginatedResponse<CastedChapterModuleProps>
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
	const formdata = new FormData();
	formdata.append("title", payload.title);
	formdata.append("content", payload.content);
	formdata.append("sequence", payload.sequence.toString());
	formdata.append("tutor", payload.tutor);
	for (const image of payload.images) {
		if (typeof image === "string") return formdata.append("images", image);
		formdata.append("images", image, image.name);
	}

	for (const video of payload.videos) {
		if (typeof video === "string") return formdata.append("videos", video);
		formdata.append("videos", video, video.name);
	}

	for (const attachment of payload.attachments) {
		if (typeof attachment === "string") return formdata.append("attachments", attachment);
		formdata.append("attachments", attachment, attachment.name);
	}

	for (const video of payload.video_urls) {
		formdata.append("video_urls", video);
	}

	return axios
		.post<
			HttpResponse<ChapterModuleProps>
		>(endpoints(chapter_id).school.create_chapter_module, formdata)
		.then((res) => res.data);
};

const CreateQuestions = async (module_id: string, payload: QuestionDto[]) => {
	const formdata = createFormDataFromObject(payload);
	return axios
		.post<HttpResponse<string>>(endpoints(module_id).school.create_questions, formdata, {
			headers: {
				Accept: "application/json",
				"Content-Type": "multipart/form-data",
			},
		})
		.then((res) => res.data);
};

type GetChaptersParams = Partial<
	PaginationProps & {
		subject_id: string;
	}
>;
const GetChapters = async (params?: GetChaptersParams) => {
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
		.get<PaginatedResponse<CastedChapterProps>>(endpoints().school.get_chapters, { params })
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

export type UpdateQuizSettingsPayload = {
	bench_mark: number;
	shuffle_questions: string;
	skip_questions: string;
	timer_minute: number;
	timer_hour: number;
	attempt_limit: number;
	attempt_reset: number;
};
const UpdateQuizSettings = async (id: string, payload: UpdateQuizSettingsPayload) => {
	return axios
		.put(endpoints(id).school.update_quiz_settings, payload)
		.then((res) => res.data);
};

export type DeleteEntitiesPayload = {
	ids: string[];
	model_type:
		| "CHAPTER"
		| "CHAPTER_MODULE"
		| "QUESTION"
		| "EXAM_BUNDLE"
		| "EXAMINATION"
		| "SUBJECT";
};
const DeleteEntities = async (payload: DeleteEntitiesPayload) => {
	return axios
		.delete(endpoints().school.delete_entities, {
			data: payload,
		})
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
	DeleteEntities,
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
	UpdateQuizSettings,
};

