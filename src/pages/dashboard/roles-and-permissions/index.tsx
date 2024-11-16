import Link from "next/link"
import React from "react"

import { DashboardLayout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Seo } from "@/components/shared"

const Page = () => {
	return (
		<>
			<Seo title="Roles and Permissions" />
			<DashboardLayout>
				<div className="h-full w-full p-6">
					<div className="flex w-full items-center justify-between">
						<Input />
						<Link href="/dashboard/roles-and-permissions/create">
							<Button>Add Role</Button>
						</Link>
					</div>
					<div className="flex w-full flex-col"></div>
				</div>
			</DashboardLayout>
		</>
	)
}

export default Page
