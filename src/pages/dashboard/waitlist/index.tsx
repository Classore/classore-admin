import { useQueries } from "@tanstack/react-query"
import { toast } from "sonner"
import React from "react"

import { DataTable, Pagination, Seo } from "@/components/shared"
import { DashboardLayout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { GetWaitlistQuery } from "@/queries"
import { waitlistColumns } from "@/config"
import { exportToXLSX } from "@/lib"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

type User = {
	"First Name": string
	"Last Name": string
	Email: string
	Role: string
	Date: Date | string
}

const roles = ["ALL", "PARENT", "STUDENT"] as const
type Role = (typeof roles)[number] | (string & {})
const LIMIT = 10

const Page = () => {
	const [role, setRole] = React.useState<Role>("")
	const [page, setPage] = React.useState(1)

	const [{ data }, { data: waitlist }] = useQueries({
		queries: [
			{
				queryFn: () => GetWaitlistQuery({ limit: LIMIT, page, role }),
				queryKey: ["get-waitlist", page, role],
			},
			{
				queryFn: () => GetWaitlistQuery({ limit: 1000, role }),
				queryKey: ["get-waitlist-for-export", role],
			},
		],
	})

	const xlsxData: User[] = React.useMemo(() => {
		if (!waitlist) return []
		return waitlist.data.data.reduce((acc, user) => {
			acc.push({
				"First Name": user.waitlists_first_name,
				"Last Name": user.waitlists_last_name,
				Email: user.waitlists_email,
				Role: user.waitlists_waitlist_type,
				Date: user.waitlists_createdOn,
			})
			return acc
		}, [] as User[])
	}, [waitlist])

	const handleDownload = async () => {
		if (xlsxData) {
			exportToXLSX(xlsxData, { filename: "waitlist" })
			toast.success("Exported to Excel")
		}
	}

	return (
		<>
			<Seo title="Waitlist" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-10 p-6">
					<div className="flex w-full items-center justify-end gap-4">
						<Select value={role} onValueChange={(value) => setRole(value === "ALL" ? "" : value)}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								{roles.map((role) => (
									<SelectItem key={role} value={role}>
										{role}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							onClick={handleDownload}
							className="w-fit text-sm"
							variant="outline"
							disabled={!xlsxData.length}>
							Export
						</Button>
					</div>
					<DataTable columns={waitlistColumns} data={data?.data.data ?? []} />
					<Pagination
						current={page}
						onPageChange={setPage}
						pageSize={LIMIT}
						total={Number(data?.data.meta.itemCount ?? 0)}
					/>
				</div>
			</DashboardLayout>
		</>
	)
}

export default Page
