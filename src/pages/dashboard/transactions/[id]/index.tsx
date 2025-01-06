import { useRouter } from "next/router";
import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";

const Page = () => {
	const router = useRouter();
	const { id } = router.query;

	return (
		<>
			<Seo title="Transactions" />
			<DashboardLayout>
				<div>Transactions {id}</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
