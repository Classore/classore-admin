import React from "react";

import { TabPanel } from "@/components/shared";
import type { AdminProps } from "@/types";

interface Props {
	admin: AdminProps;
	tab: string;
}

export const Wards = ({ tab }: Props) => {
	return (
		<TabPanel selected={tab} value="wards">
			<div className="h-full space-y-3 overflow-y-auto rounded-md border border-neutral-300 p-4"></div>
		</TabPanel>
	);
};
