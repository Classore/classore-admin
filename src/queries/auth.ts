import { endpoints } from "@/config"
import { axios } from "@/lib"
import type {
	HttpResponse,
	PaginatedResponse,
	PaginationProps,
	UserProps,
	WaitlistUserProps,
} from "@/types"

export interface SignInDto {
	email: string
	password: string
}

const SignInMutation = async (payload: SignInDto) => {
	return axios.post<HttpResponse<UserProps>>("/auth/signin", payload).then((res) => res.data)
}

const GetWaitlistQuery = async (params: PaginationProps) => {
	return axios
		.get<HttpResponse<PaginatedResponse<WaitlistUserProps>>>(endpoints().waitlist.get, { params })
		.then((res) => res.data)
}

export { GetWaitlistQuery, SignInMutation }
