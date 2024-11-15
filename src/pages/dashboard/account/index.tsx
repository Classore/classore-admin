import React from "react"

import { DashboardLayout } from "@/components/layout"
import { Seo } from "@/components/shared"

const Page = () => {
	return (
		<>
			<Seo title="Account" />
			<DashboardLayout>
				<div>Account</div>
			</DashboardLayout>
		</>
	)
}

export default Page
