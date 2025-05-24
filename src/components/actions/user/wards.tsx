import React from "react";

import { TabPanel } from "@/components/shared";
import type { ViewUserProps } from "@/types";

interface Props {
	tab: string;
	user?: ViewUserProps;
}

export const Wards = ({ tab }: Props) => {
	return (
		<TabPanel selected={tab} value="wards">
			<div className="h-[calc(100%-294px)] w-full space-y-4 overflow-y-auto"></div>
		</TabPanel>
	);
};
