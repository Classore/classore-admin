import React from "react";

import { TabPanel } from "@/components/shared";

interface Props {
	tab: string;
}

export const Referrals = ({ tab }: Props) => {
	return (
		<TabPanel selected={tab} value="referrals">
			<div>Referrals</div>
		</TabPanel>
	);
};
