import React from "react";

import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";

const Page = () => {
	return (
		<>
			<Seo title="Forums" />
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
