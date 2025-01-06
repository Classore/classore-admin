import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";

const Page = () => {
	return (
		<>
			<Seo title="Dashboard" />
			<DashboardLayout>
				<div>Dashboard</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
