import { skipToken, usePrefetchQuery } from "@tanstack/react-query";
import * as React from "react";

import { GetChapterModules } from "@/queries";
import { VideoTab } from "./video-tab";
import { Chapters } from "./chapters";
import { Lessons } from "./lessons";
import { TabPanel } from "./shared";
import { Quiz } from "./quiz";

interface Props {
	courseName: string;
	setChapterID: (id: string) => void;
	setModuleId: (id: string) => void;
	tab: string;
}

const requestNotificationPermission = () => {
	if ("Notification" in window) {
		Notification.requestPermission().then((permission) => {
			if (permission === "granted") {
				console.log("Notification permission granted.");
			}
		});
	}
};

export const CreateCourseTabPanel = ({ courseName, setChapterID, setModuleId, tab }: Props) => {
	const [chapterId, setChapterId] = React.useState<string | undefined>(undefined);
	const [currentTab, setCurrentTab] = React.useState("lesson");
	const [lessonTab, setLessonTab] = React.useState("");

	const handleChapterChange = (chapterId?: string) => {
		setChapterId(chapterId);
		setChapterID(chapterId || "");
	};

	const handleModuleChange = (moduleId: string) => {
		setModuleId(moduleId);
		setLessonTab(moduleId);
	};

	React.useEffect(() => {
		window.scrollTo({ behavior: "smooth", top: 0 });
	}, [currentTab, lessonTab]);

	React.useEffect(() => {
		requestNotificationPermission();
	}, []);

	usePrefetchQuery({
		queryKey: ["get-modules", { chapterId }],
		queryFn: chapterId ? () => GetChapterModules({ chapter_id: chapterId }) : skipToken,
	});

	return (
		<TabPanel innerClassName="grid grid-cols-7 gap-2 p-3 bg-white" selected={tab} value="course">
			<Chapters
				setLessonTab={(moduleId) => handleModuleChange(moduleId)}
				lessonTab={lessonTab}
				onChapterIdChange={(chapterId) => handleChapterChange(chapterId)}
				chapterId={chapterId}
				courseName={courseName}
			/>

			<div className="col-span-4 h-full overflow-y-auto">
				<TabPanel selected={currentTab} value="lesson">
					<Lessons lessonTab={lessonTab} chapterId={chapterId} setCurrentTab={setCurrentTab} />
				</TabPanel>
				<TabPanel selected={currentTab} value="quiz">
					<Quiz chapterId={chapterId} lessonTab={lessonTab} setCurrentTab={setCurrentTab} />
				</TabPanel>
				<TabPanel selected={currentTab} value="video">
					<VideoTab chapterId={chapterId} lessonTab={lessonTab} setCurrentTab={setCurrentTab} />
				</TabPanel>
			</div>
		</TabPanel>
	);
};
