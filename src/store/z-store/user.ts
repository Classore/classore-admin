import Cookies from "js-cookie";

import { createPersistMiddleware } from "../middleware";
import type { AdminOneProps, Maybe } from "@/types";

interface UserStore {
	user: Maybe<AdminOneProps>;
	signIn: (user: AdminOneProps, token: string) => void;
	signOut: () => Promise<void>;
}

const initialState: UserStore = {
	user: null,
	signIn: () => {},
	signOut: async () => {},
};

const useUserStore = createPersistMiddleware<UserStore>("CLASSORE_ADMIN", (set) => ({
	...initialState,
	signIn: (user, token) => {
		Cookies.set("CLASSORE_ADMIN_TOKEN", token);
		set({ user });
	},
	signOut: async () => {
		try {
			set({ user: null });
			Cookies.remove("CLASSORE_ADMIN_TOKEN");
		} catch (error) {
			console.error(error);
		} finally {
			Cookies.remove("CLASSORE_ADMIN_TOKEN");
			window.location.replace("/");
		}
	},
}));

export { useUserStore };
