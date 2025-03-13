import type { HttpResponse, PaginatedResponse, PaginationProps, TestCenterProps } from "@/types";
import { axios, createFormDataFromObject } from "@/lib";
import { endpoints } from "@/config";

export interface CreateTestDto {
	title: string;
	description: string;
	banner: File | null;
}

export interface UpdateTestDto {
	title: string;
	description: string;
	banner: File | null;
	is_published: "YES" | "NO";
	bench_mark: number;
	shuffle_questions: "YES" | "NO";
	skip_questions: "YES" | "NO";
	timer_minute: number;
	timer_hour: number;
	attempt_limit: number;
	attempt_reset: number;
	is_deleted: "YES" | "NO";
}

export interface UpdateQuestionDto {
	media: File | null;
	options: TestOptionDto[];
}

export interface TestQuestionDto {
	sequence: number;
	content: string;
	media: File | null;
	instruction: string;
	question_type: "MUTILCHOICE" | "LISTENING" | "SPEAKING" | "YES_OR_NO";
	options: TestOptionDto[];
}

export interface TestOptionDto {
	sequence_number: number;
	content: string;
	is_correct: "YES" | "NO";
}

export interface UpdateTestSettingsDto {
	attempts: number;
}

export type GetTestResponse = {
	banner: string;
	createdOn: Date;
	description: string;
	sections: PaginatedResponse<any>;
	title: string;
};

const CreateTest = async (payload: CreateTestDto) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.post<HttpResponse<TestCenterProps>>(endpoints().test_center.create, formData)
		.then((res) => res.data);
};

const GetTests = async (params?: PaginationProps & { sort_by?: "NAME" | "DATE_CREATED" }) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return axios
		.get<HttpResponse<PaginatedResponse<TestCenterProps>>>(endpoints().test_center.all, {
			params,
		})
		.then((res) => res.data);
};

const GetTest = async (
	id: string,
	params?: PaginationProps & { sort_by?: "NAME" | "DATE_CREATED" }
) => {
	if (params) {
		for (const key in params) {
			if (!params[key as keyof typeof params] || params[key as keyof typeof params] === undefined) {
				delete params[key as keyof typeof params];
			}
		}
	}
	return axios
		.get<HttpResponse<GetTestResponse>>(endpoints(id).test_center.one, {
			params,
		})
		.then((res) => res.data);
};

const UpdateTest = async (testId: string, payload: UpdateTestDto) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.put<HttpResponse<TestCenterProps>>(endpoints(testId).test_center.update, formData)
		.then((res) => res.data);
};

const CreateTestSection = async (testId: string, payload: CreateTestDto) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.post<HttpResponse<TestCenterProps>>(endpoints(testId).test_center.create_section, formData)
		.then((res) => res.data);
};

const UpdateTestSection = async (sectionId: string, payload: UpdateTestDto) => {
	const formData = createFormDataFromObject(payload);
	return axios
		.put<HttpResponse<TestCenterProps>>(endpoints(sectionId).test_center.update_section, formData)
		.then((res) => res.data);
};

const CreateTestQuestion = async (sectionId: string, payload: TestQuestionDto[]) => {
	const formData = new FormData();
	payload.forEach((question, index) => {
		formData.append(`questions[${index}][sequence]`, question.sequence.toString());
		formData.append(`questions[${index}][content]`, question.content);
		formData.append(`questions[${index}][question_type]`, question.question_type);
		formData.append(`questions[${index}][instruction]`, question.instruction);
		if (question.media) {
			formData.append(`questions[${index}][media]`, question.media);
		}
		question.options.forEach((option, optionIndex) => {
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
		.post<HttpResponse<TestCenterProps>>(endpoints(sectionId).test_center.create_question, formData)
		.then((res) => res.data);
};

const UpdateTestQuestion = async (questionId: string, payload: UpdateQuestionDto) => {
	const formData = new FormData();
	if (payload.media) {
		formData.append("media", payload.media);
	}
	if (payload.options) {
		payload.options.forEach((option, index) => {
			formData.append(`options[${index}][sequence_number]`, option.sequence_number.toString());
			formData.append(`options[${index}][content]`, option.content);
			formData.append(`options[${index}][is_correct]`, option.is_correct);
		});
	}
	return axios
		.put<HttpResponse<TestCenterProps>>(endpoints(questionId).test_center.update_question, payload)
		.then((res) => res.data);
};

export {
	CreateTest,
	CreateTestSection,
	CreateTestQuestion,
	GetTest,
	GetTests,
	UpdateTest,
	UpdateTestSection,
	UpdateTestQuestion,
};
