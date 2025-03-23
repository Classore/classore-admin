import React from "react";

interface Props {
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
