import React from "react"

import { DashboardLayout } from "@/components/layout"
import { Seo } from "@/components/shared"

const Page = () => {
	return (
		<>
			<Seo title="Transactions" />
			<DashboardLayout>
				<div>Transactions</div>
			</DashboardLayout>
		</>
	)
}

export default Page
