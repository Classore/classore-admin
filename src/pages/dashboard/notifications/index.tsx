import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";

const Page = () => {
	return (
		<>
			<Seo title="Notifications" />
			<DashboardLayout>
				<div>Notifications</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
