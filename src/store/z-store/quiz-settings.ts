import { create } from "zustand";

type QuizSettings = {
	bench_mark: number | undefined;
	shuffle_questions: boolean;
	skip_questions: boolean;
	timer_minute: number | undefined;
	timer_hour: number | undefined;
	attempt_limit: number | undefined;
	attempt_reset: number | undefined;
};

type QuizSettingsAction = {
	setValues: (setting: QuizSettings) => void;
	addValue: (key: keyof QuizSettings, value: number | string | boolean) => void;
	reset: () => void;
};

const initialState: QuizSettings = {
	bench_mark:undefined,
	shuffle_questions: false,
	skip_questions: false,
	timer_minute:undefined,
	timer_hour:undefined,
	attempt_limit:undefined,
	attempt_reset:undefined,
};

export const useQuizSettingsStore = create<QuizSettings>(() => ({
	...initialState,
}));

export const quizSettingsActions: QuizSettingsAction = {
	setValues: (setting) => {
		useQuizSettingsStore.setState((state) => ({
			...state,
			...setting,
		}));
	},
	addValue: (key, value) => {
		useQuizSettingsStore.setState((state) => ({
			...state,
			[key]: value,
		}));
	},
	reset: () => {
		useQuizSettingsStore.setState(initialState);
	},
};
