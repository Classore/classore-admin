import { GetChapterModules } from "@/queries";
import { skipToken, usePrefetchQuery } from "@tanstack/react-query";
import * as React from "react";
import { Chapters } from "./chapters";
import { Lessons } from "./lessons";
import { TabPanel } from "./shared";

export const CreateCourseTabPanel = ({ tab }: { tab: string }) => {
	const [lessonTab, setLessonTab] = React.useState("");
	const [chapterId, setChapterId] = React.useState<string | undefined>(undefined);

	// // how do i get each chapter id from chapters component?
	usePrefetchQuery({
		queryKey: ["get-modules", { chapterId }],
		queryFn: chapterId ? () => GetChapterModules({ chapter_id: chapterId }) : skipToken,
	});

	return (
		<TabPanel innerClassName="grid grid-cols-7 pt-5 gap-2" selected={tab} value="course">
			<Chapters
				setLessonTab={setLessonTab}
				lessonTab={lessonTab}
				onChapterIdChange={setChapterId}
			/>
			<Lessons lessonTab={lessonTab} chapterId={chapterId} />
		</TabPanel>
	);
};
