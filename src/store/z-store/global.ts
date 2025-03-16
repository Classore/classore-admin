import { createReportableStore } from "../middleware";
import type { Chapter } from "../z-store/chapter";

interface GlobalStore {
	loading: boolean;
	isChapterListOpen: boolean;
	setIsChapterListOpen: (isChapterListOpen: boolean) => void;
	selectedChapter: Chapter | null;
	setSelectedChapter: (chapter: Chapter | null) => void;
}

const initialState: GlobalStore = {
	loading: false,
	isChapterListOpen: false,
	setIsChapterListOpen: () => {},
	selectedChapter: null,
	setSelectedChapter: () => {},
};

const useGlobalStore = createReportableStore<GlobalStore>((set) => ({
	...initialState,
	setLoading: (loading: boolean) => set({ loading }),
	setIsChapterListOpen: (isChapterListOpen) => set({ isChapterListOpen }),
	setSelectedChapter: (selectedChapter) => set({ selectedChapter }),
}));

export { useGlobalStore };
