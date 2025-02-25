import type { HttpResponse, PaginatedResponse, PaginationProps, TestCenterProps } from "@/types";
import { endpoints } from "@/config";
import { axios } from "@/lib";

export interface CreateTestDto {
	title: string;
	description: string;
}

export interface UpdateTestSettingsDto {}

const CreateTest = async (payload: Partial<CreateTestDto>) => {
	return axios.post<HttpResponse<TestCenterProps>>(endpoints().test_center.create, payload);
};

const GetTests = async (params?: PaginationProps) => {
	return axios.get<HttpResponse<PaginatedResponse<TestCenterProps>>>(endpoints().test_center.all, {
		params,
	});
};

const GetTest = async (testId: string) => {
	return axios.get<HttpResponse<TestCenterProps>>(endpoints(testId).test_center.one);
};

const UpdateTest = async (testId: string, payload: Partial<CreateTestDto>) => {
	return axios.put<HttpResponse<TestCenterProps>>(endpoints(testId).test_center.update, payload);
};

const UpdateTestSettings = async (testId: string, payload: UpdateTestSettingsDto) => {
	return axios.put<HttpResponse<TestCenterProps>>(
		endpoints(testId).test_center.update_settings,
		payload
	);
};

const DeleteTest = async (testId: string) => {
	return axios.delete<HttpResponse<TestCenterProps>>(endpoints(testId).test_center.delete);
};

export { CreateTest, DeleteTest, GetTests, GetTest, UpdateTest, UpdateTestSettings };
