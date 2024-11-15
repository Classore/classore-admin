import React from "react"

import { DashboardLayout } from "@/components/layout"
import { Seo } from "@/components/shared"

const Page = () => {
	return (
		<>
			<Seo title="Settings" />
			<DashboardLayout>
				<div>Settings</div>
			</DashboardLayout>
		</>
	)
}

export default Page
