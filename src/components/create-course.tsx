import * as React from "react";
import { Chapters } from "./chapters";
import { Lessons } from "./lessons";
import { TabPanel } from "./shared";

export const CreateCourseTabPanel = ({ tab }: { tab: string }) => {
	const [lessonTab, setLessonTab] = React.useState("");

	return (
		<TabPanel innerClassName="grid grid-cols-7 pt-5 gap-2" selected={tab} value="course">
			<Chapters setLessonTab={setLessonTab} lessonTab={lessonTab} />
			<Lessons lessonTab={lessonTab} />
		</TabPanel>
	);
};
