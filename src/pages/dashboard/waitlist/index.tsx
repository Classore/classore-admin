import { useQueries } from "@tanstack/react-query"
import { toast } from "sonner"
import React from "react"

import { DataTable, Pagination, Seo } from "@/components/shared"
import { DashboardLayout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { GetWaitlistQuery } from "@/queries"
import { exportToXLSX } from "@/lib"
import { columns } from "@/config"

type User = {
	"First Name": string
	"Last Name": string
	Email: string
	Role: string
	Date: Date | string
}

const LIMIT = 10

const Page = () => {
	const [page, setPage] = React.useState(1)

	const [{ data }, { data: waitlist }] = useQueries({
		queries: [
			{
				queryFn: () => GetWaitlistQuery({ limit: LIMIT, page }),
				queryKey: ["get-waitlist", page],
			},
			{
				queryFn: () => GetWaitlistQuery({ limit: 1000 }),
				queryKey: ["get-waitlist-for-export"],
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
					<div className="flex w-full items-center justify-end">
						<Button onClick={handleDownload} className="w-fit text-sm" variant="outline">
							Export
						</Button>
					</div>
					<DataTable columns={columns} data={data?.data.data ?? []} />
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
