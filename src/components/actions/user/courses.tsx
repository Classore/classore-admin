import React from "react";

import { TabPanel } from "@/components/shared";
import type { ViewUserProps } from "@/types";

interface Props {
	tab: string;
	user?: ViewUserProps;
}

export const Courses = ({ tab, user }: Props) => {
	return (
		<TabPanel selected={tab} value="courses">
			<div className="h-[calc(100%-294px)] w-full space-y-4 overflow-y-auto">
				{user?.courses.map((course) => (
					<div key={course.id} className="w-full space-y-1">
						<p className="text-sm font-semibold capitalize">{course.exam}</p>
						<ul className="w-full pl-4">
							{course.subjects.map((subject) => (
								<li key={subject.id} className="list-item list-disc text-xs capitalize">
									{subject.name}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</TabPanel>
	);
};
