import React from "react"

import { DashboardLayout } from "@/components/layout"
import { Seo } from "@/components/shared"

const Page = () => {
	return (
		<>
			<Seo title="Subscriptions" />
			<DashboardLayout>
				<div>Subscriptions</div>
			</DashboardLayout>
		</>
	)
}

export default Page