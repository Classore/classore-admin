import React from "react";

import { LessonVideoUpload } from "@/courses/lesson-video-upload";
import { LessonDetails } from "@/courses/lesson-details";
import { LessonQuiz } from "@/courses/lesson-quiz";
import { TabPanel } from "@/components/shared";

interface LessonProps {
	activeLessonId: string;
	chapterId: string;
}

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
