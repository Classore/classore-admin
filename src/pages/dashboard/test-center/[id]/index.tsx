import { useRouter } from "next/router";
import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";

const Page = () => {
	const router = useRouter();
	const id = router.query.id as string;

	return (
		<>
			<Seo title={id} />
			<DashboardLayout>
				<div className="w-full">
					<div className="w-full"></div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
