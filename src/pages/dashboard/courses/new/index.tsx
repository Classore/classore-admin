import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";

const Page = () => {
	return (
		<>
			<Seo title="New Course" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-y-6"></div>
			</DashboardLayout>
		</>
	);
};

export default Page;
