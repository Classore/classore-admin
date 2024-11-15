import React from "react"

import { DashboardLayout } from "@/components/layout"
import { Seo } from "@/components/shared"

const Page = () => {
	return (
		<>
			<Seo title="Payments" />
			<DashboardLayout>
				<div>Payments</div>
			</DashboardLayout>
		</>
	)
}

export default Page
