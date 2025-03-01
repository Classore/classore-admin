import { skipToken, usePrefetchQuery } from "@tanstack/react-query";
import * as React from "react";

import { GetChapterModules } from "@/queries";
import { Chapters } from "./chapters";
import { Lessons } from "./lessons";
import { TabPanel } from "./shared";
import { Quiz } from "./quiz";

export const CreateCourseTabPanel = ({ tab }: { tab: string }) => {
	const [chapterId, setChapterId] = React.useState<string | undefined>(undefined);
	const [currentTab, setCurrentTab] = React.useState("lesson");
	const [lessonTab, setLessonTab] = React.useState("");

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
				chapterId={chapterId}
			/>
			<div className="col-span-4">
				<TabPanel selected={currentTab} value="lesson">
					<Lessons lessonTab={lessonTab} chapterId={chapterId} setCurrentTab={setCurrentTab} />
				</TabPanel>
				<TabPanel selected={currentTab} value="quiz">
					<Quiz chapterId={chapterId} lessonTab={lessonTab} setCurrentTab={setCurrentTab} />
				</TabPanel>
			</div>
		</TabPanel>
	);
};
