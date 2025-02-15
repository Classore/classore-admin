import React, { type PropsWithChildren } from "react";

import type { ChapterProps, ChapterModuleProps, CourseProps, Maybe } from "@/types";

type CourseContextProps = {
	course: Maybe<CourseProps>;
	chapter: Maybe<ChapterProps>;
	chapterModule: Maybe<ChapterModuleProps>;
	onSelectCourse: (course: CourseProps) => void;
	onSelectChapter: (chapter: ChapterProps) => void;
	onSelectChapterModule: (module: ChapterModuleProps) => void;
};

const defaultContextProps: CourseContextProps = {
	course: null,
	chapter: null,
	chapterModule: null,
	onSelectCourse: () => {},
	onSelectChapter: () => {},
	onSelectChapterModule: () => {},
};

const CourseContext = React.createContext<CourseContextProps>(defaultContextProps);

export const CourseProvider: React.FC<PropsWithChildren & {}> = (props) => {
	const { children } = props;

	/* Copy the default context so that strict equality checks against the context value are false. */
	const ctx = { ...defaultContextProps };

	return <CourseContext.Provider value={ctx}>{children}</CourseContext.Provider>;
};

export const useCourse = () => {
	const ctx = React.useContext(CourseContext);
	if (!ctx) {
		throw new Error("useCourse must be used within a CourseProvider");
	}
	return ctx;
};
