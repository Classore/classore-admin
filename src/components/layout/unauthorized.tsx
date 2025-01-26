import { RiArrowLeftLine } from "@remixicon/react";
import { useRouter } from "next/router";
import React from "react";

import { DashboardLayout } from "./dashboard";
import { Button } from "../ui/button";

export const Unauthorized = () => {
	const router = useRouter();

	return (
		<DashboardLayout>
			<div className="grid h-full w-full place-items-center rounded-lg bg-white">
				<div className="flex max-w-[400px] flex-col items-center gap-y-2 text-center">
					<h2 className="text-2xl font-semibold">
						Unauthorized <span className="text-primary-400">Access</span>
					</h2>
					<p className="text-sm font-medium">
						You&apos;re unauthorized to view this page. Please contact your administrator.
					</p>
					<Button className="w-fit" onClick={() => router.back()}>
						<RiArrowLeftLine /> Go Back
					</Button>
				</div>
			</div>
		</DashboardLayout>
	);
};
