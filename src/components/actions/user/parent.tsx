import React from "react";

import { TabPanel } from "@/components/shared";
import type { ViewUserProps } from "@/types";

interface Props {
	tab: string;
	user?: ViewUserProps;
}

export const Parent = ({ tab }: Props) => {
	return (
		<TabPanel selected={tab} value="parent">
			<div>Parent</div>
		</TabPanel>
	);
};
