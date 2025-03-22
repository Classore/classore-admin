import { TabPanel } from "@/components/shared";
import * as React from "react";
import { LessonDetails } from "./lesson-details";
import { LessonQuiz } from "./lesson-quiz";
import { LessonVideoUpload } from "./lesson-video-upload";

type LessonProps = {
	activeLessonId: string;
	chapterId: string;
};

export const Lesson = ({ activeLessonId, chapterId }: LessonProps) => {
	console.log("lesson ative id", activeLessonId);
	const [currentTab, setCurrentTab] = React.useState("lesson");

	return (
		<div className="col-span-5 gap-2 overflow-y-auto bg-white p-3">
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
