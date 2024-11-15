import React from "react"

import { DashboardLayout } from "@/components/layout"
import { Seo } from "@/components/shared"

const Page = () => {
	return (
		<>
			<Seo title="Teachers" />
			<DashboardLayout>
				<div>Teachers</div>
			</DashboardLayout>
		</>
	)
}

export default Page
