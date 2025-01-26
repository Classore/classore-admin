import React from "react";

import { DashboardLayout, Unauthorized } from "@/components/layout";
import { hasPermission } from "@/lib/permission";
import { useUserStore } from "@/store/z-store";
import { Seo } from "@/components/shared";

const Page = () => {
	const { user } = useUserStore();

	if (!hasPermission(user, ["transactions_read"])) {
		return <Unauthorized />;
	}

	return (
		<>
			<Seo title="Transactions" />
			<DashboardLayout>
				<div>Transactions</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
