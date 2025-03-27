import * as React from "react";

import { TabPanel } from "@/components/shared";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LessonDetails } from "./lesson-details";
import { LessonQuiz } from "./lesson-quiz";
import { LessonVideoUpload } from "./lesson-video-upload";

type LessonProps = {
	activeLessonId: string;
	chapterId: string;
};

export const Lesson = ({ activeLessonId, chapterId }: LessonProps) => {
	const [currentTab, setCurrentTab] = React.useState("lesson");

	return (
		<ScrollArea className="col-span-6 h-[500px] gap-2 overflow-y-auto bg-white">
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
		</ScrollArea>
	);
};
