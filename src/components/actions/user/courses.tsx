import React from "react";

import { TabPanel } from "@/components/shared";

interface Props {
	tab: string;
}

export const Courses = ({ tab }: Props) => {
	return (
		<TabPanel selected={tab} value="courses">
			<div>Courses</div>
		</TabPanel>
	);
};
