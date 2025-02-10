import { toast } from "sonner";

import { createPersistMiddleware } from "../middleware";

interface NavigationStore {
	current: string;
	getCurrent: () => string;
	ids: string[];
	onNavigate: () => void;
	setIds: (ids: string[]) => void;
}

const initialState: NavigationStore = {
	current: "",
	getCurrent: () => initialState.current,
	ids: [],
	onNavigate: () => {},
	setIds: () => {},
};

const useNavigationStore = createPersistMiddleware<NavigationStore>(
	"navigation",
	(set) => ({
		...initialState,
		onNavigate: () => {
			set((state) => {
				const currentIndex = state.ids.indexOf(state.current);
				const nextId = state.ids[currentIndex + 1];
				if (!nextId) {
					toast.error("No more pages to navigate to");
					return state;
				}
				return { ...state, current: nextId || state.ids[0] };
			});
		},
		setIds: (ids) => set({ ids }),
		getCurrent: () => initialState.current,
	})
);

export { useNavigationStore };
