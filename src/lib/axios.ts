import Cookies from "js-cookie";
import axios from "axios";

const api = axios.create({
	baseURL: "https://classore-be-prod-1.up.railway.app/classore/v1",
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
