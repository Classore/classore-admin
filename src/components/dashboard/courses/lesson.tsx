import * as React from "react";

import { TabPanel } from "@/components/shared";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RiArrowUpLine } from "@remixicon/react";
import { LessonDetails } from "./lesson-details";
import { LessonQuiz } from "./lesson-quiz";
import { LessonVideoUpload } from "./lesson-video-upload";

type LessonProps = {
	activeLessonId: string;
	chapterId: string;
};

export const Lesson = ({ activeLessonId, chapterId }: LessonProps) => {
	const scrollAreaRef = React.useRef<HTMLDivElement>(null);
	const [currentTab, setCurrentTab] = React.useState("lesson");

	const scrollToTop = () => {
		scrollAreaRef.current?.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	return (
		<ScrollArea
			viewportRef={scrollAreaRef}
			className="relative col-span-6 h-[500px] gap-2 overflow-y-hidden bg-white">
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

			<button
				onClick={scrollToTop}
				className="fixed bottom-6 right-6 flex size-8 items-center justify-center rounded-full bg-primary-300 text-white">
				<RiArrowUpLine className="size-4" />
			</button>
		</ScrollArea>
	);
};
