import React from "react";

import { DashboardLayout, Unauthorized } from "@/components/layout";
import { hasPermission } from "@/lib/permission";
import { useUserStore } from "@/store/z-store";
import { Seo } from "@/components/shared";

const Page = () => {
	const { user } = useUserStore();

	if (!hasPermission(user, ["videos_read"])) {
		return <Unauthorized />;
	}

	return (
		<>
			<Seo title="Test Center" />
			<DashboardLayout>
				<div className="grid h-full w-full place-items-center">
					<div className="flex flex-col items-center gap-y-2">
						<h3 className="text-4xl font-semibold text-primary-400">Still Cooking</h3>
						<p>We&apos;re working on this module. Please check back later.</p>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
