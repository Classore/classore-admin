import { useRouter } from "next/router";
import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";

const Page = () => {
	const router = useRouter();
	const { id } = router.query;

	return (
		<>
			<Seo title="User" />
			<DashboardLayout>
				<div>User {id}</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
