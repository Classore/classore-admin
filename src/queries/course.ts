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
	VideoProps,
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
	video_urls: VideoProps[];
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
export type GetQuestionsResponse = HttpResponse<PaginatedResponse<CastedQuestionProps>>;
export type PaginatedQuestions = {
	data: CastedQuestionProps[];
	meta: PaginatedResponse<CastedQuestionProps>["meta"];
};

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
			if (image instanceof File) {
				formData.append(`questions[${index}][images][${imageIndex}]`, image, image.name);
			}
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

type GetChaptersParams = Partial<
	PaginationProps & {
		subject_id: string;
	}
>;
const GetChapters = async (params?: GetChaptersParams) => {
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

const GetQuestions = async (params?: PaginationProps & { module_id: string }) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return axios
		.get<GetQuestionsResponse>(endpoints().school.get_questions, { params })
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
	const formData = new FormData();
	if (payload.title) formData.append("title", payload.title);
	if (payload.content) formData.append("content", payload.content);
	if (payload.sequence) formData.append("sequence", String(payload.sequence));
	if (payload.tutor) formData.append("tutor", payload.tutor);
	if (payload.attachments?.length) {
		payload.attachments.forEach((attachment, i) => {
			formData.append(`attachments[${i}]`, attachment);
		});
	}
	if (payload.images?.length) {
		payload.images.forEach((image, i) => {
			formData.append(`images[${i}]`, image);
		});
	}
	if (payload.videos?.length) {
		payload.videos.forEach((video, i) => {
			formData.append(`videos[${i}]`, video);
		});
	}
	if (payload.video_urls) {
		payload.video_urls.forEach((video_url, i) => {
			formData.append(`video_urls[${i}][derived_url]`, video_url.derived_url);
			formData.append(`video_urls[${i}][duration]`, video_url.duration.toString());
			formData.append(`video_urls[${i}][secure_url]`, video_url.secure_url);
		});
	}
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
	return axios.put(endpoints(id).school.update_quiz_settings, payload).then((res) => res.data);
};

export type DeleteEntitiesPayload = {
	ids: string[];
	model_type: "CHAPTER" | "CHAPTER_MODULE" | "QUESTION" | "EXAM_BUNDLE" | "EXAMINATION" | "SUBJECT";
};
const DeleteEntities = async (payload: DeleteEntitiesPayload) => {
	return axios
		.delete(endpoints().school.delete_entities, {
			data: payload,
		})
		.then((res) => res.data);
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
