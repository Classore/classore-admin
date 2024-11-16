import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import React from "react"

import { DashboardLayout } from "@/components/layout"
import { DataTable, Seo } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GetRolesQuery } from "@/queries"
import { rolesColumns } from "@/config"

const Page = () => {
	const { data } = useQuery({
		queryFn: () => GetRolesQuery({ limit: 20, page: 1 }),
		queryKey: ["get-admin-roles"],
	})

	return (
		<>
			<Seo title="Roles and Permissions" />
			<DashboardLayout>
				<div className="flex h-full w-full flex-col gap-10 p-6">
					<div className="flex w-full items-center justify-between">
						<Input />
						<Link href="/dashboard/roles-and-permissions/create">
							<Button>Add Role</Button>
						</Link>
					</div>
					<DataTable columns={rolesColumns} data={data?.data.data ?? []} />
				</div>
			</DashboardLayout>
		</>
	)
}

export default Page
