import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";

const Page = () => {
	return (
		<>
			<Seo title="Forums" />
			<DashboardLayout>
				<div>Forums</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
