import * as React from "react";

import { LessonVideoUpload } from "./lesson-video-upload";
import { LessonDetails } from "./lesson-details";
import { TabPanel } from "@/components/shared";
import { LessonQuiz } from "./lesson-quiz";

type LessonProps = {
	activeLessonId: string;
	chapterId: string;
};

export const Lesson = ({ activeLessonId, chapterId }: LessonProps) => {
	const [currentTab, setCurrentTab] = React.useState("lesson");

	return (
		<div className="col-span-5 gap-2 overflow-y-auto bg-white">
			<TabPanel selected={currentTab} value="lesson">
				<LessonDetails
					chapterId={chapterId}
					activeLessonId={activeLessonId}
					setCurrentTab={setCurrentTab}
				/>
			</TabPanel>
			<TabPanel selected={currentTab} value="video-upload">
				<LessonVideoUpload activeLessonId={activeLessonId} setCurrentTab={setCurrentTab} />
			</TabPanel>
			<TabPanel selected={currentTab} value="quiz">
				<LessonQuiz
					chapterId={chapterId}
					activeLessonId={activeLessonId}
					setCurrentTab={setCurrentTab}
				/>
			</TabPanel>
		</div>
	);
};
