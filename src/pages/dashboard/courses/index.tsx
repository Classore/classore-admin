import React from "react"

import { DashboardLayout } from "@/components/layout"
import { Seo } from "@/components/shared"

const Page = () => {
	return (
		<>
			<Seo title="Courses" />
			<DashboardLayout>
				<div>Courses</div>
			</DashboardLayout>
		</>
	)
}

export default Page