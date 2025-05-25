import Cookies from "js-cookie";
import axios from "axios";

const isDev = process.env.NEXT_PUBLIC_NODE_ENV === "development";

const api = axios.create({
	baseURL: isDev
		? process.env.NEXT_PUBLIC_API_URL
		: "https://classore-be-prod-1.up.railway.app/classore/v1",
});

api.interceptors.request.use(
	(config) => {
		const token = Cookies.get("CLASSORE_ADMIN_TOKEN");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export { api };
