import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { Checkbox } from "@/components/ui/checkbox"
import type { WaitlistUserProps } from "@/types"

export const columns: ColumnDef<WaitlistUserProps>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "waitlists_first_name",
		header: "First Name",
		cell: ({ row }) => <span className="capitalize">{row.original.waitlists_first_name}</span>,
	},
	{
		accessorKey: "waitlists_last_name",
		header: "Last Name",
		cell: ({ row }) => <span className="capitalize">{row.original.waitlists_last_name}</span>,
	},
	{
		accessorKey: "waitlists_email",
		header: "Email",
		cell: ({ row }) => <span>{row.original.waitlists_email}</span>,
	},
	{
		accessorKey: "waitlists_waitlist_type",
		header: "Role",
		cell: ({ row }) => <span>{row.original.waitlists_waitlist_type}</span>,
	},
	{
		accessorKey: "waitlists_createdOn",
		header: "Joined On",
		cell: ({ row }) => <span>{format(row.original.waitlists_createdOn, "dd/MM/yyyy")}</span>,
	},
]
