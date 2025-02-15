import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import type { PaginatedRoleProps, WaitlistUserProps } from "@/types";
import { DeleteAction } from "@/components/actions/waitlist/delete";
import { Checkbox } from "@/components/ui/checkbox";

export const waitlistColumns: ColumnDef<WaitlistUserProps>[] = [
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
	{
		id: "actions",
		header: "",
		cell: ({ row }) => <DeleteAction id={row.original.waitlists_id} />,
	},
];

export const rolesColumns: ColumnDef<PaginatedRoleProps>[] = [
	{
		accessorKey: "role_name",
		header: "Role Name",
		cell: ({ row }) => <span className="capitalize">{row.original.role_name}</span>,
	},
	{
		accessorKey: "role_admin_read",
		header: "Admin Read",
		cell: ({ row }) => <span>{row.original.role_admin_read}</span>,
	},
	{
		accessorKey: "role_admin_write",
		header: "Admin Write",
		cell: ({ row }) => <span>{row.original.role_admin_write}</span>,
	},
	{
		accessorKey: "role_student_read",
		header: "Student Read",
		cell: ({ row }) => <span>{row.original.role_student_read}</span>,
	},
	{
		accessorKey: "role_student_write",
		header: "Student Write",
		cell: ({ row }) => <span>{row.original.role_student_write}</span>,
	},
	{
		accessorKey: "role_tutor_read",
		header: "Tutor Read",
		cell: ({ row }) => <span>{row.original.role_tutor_read}</span>,
	},
	{
		accessorKey: "role_tutor_write",
		header: "Tutor Write",
		cell: ({ row }) => <span>{row.original.role_tutor_write}</span>,
	},
	{
		accessorKey: "role_transactions_read",
		header: "Transactions Read",
		cell: ({ row }) => <span>{row.original.role_transactions_read}</span>,
	},
	{
		accessorKey: "role_transactions_write",
		header: "Transactions Write",
		cell: ({ row }) => <span>{row.original.role_transactions_write}</span>,
	},
	{
		accessorKey: "role_videos_admin_read",
		header: "Courses Read",
		cell: ({ row }) => <span>{row.original.role_videos_read}</span>,
	},
	{
		accessorKey: "role_videos_write",
		header: "Courses Write",
		cell: ({ row }) => <span>{row.original.role_videos_write}</span>,
	},
	{
		accessorKey: "role_waitlist_read",
		header: "Waitlist Read",
		cell: ({ row }) => <span>{row.original.role_waitlist_read}</span>,
	},
	{
		accessorKey: "role_waitlist_write",
		header: "Waitlist Write",
		cell: ({ row }) => <span>{row.original.role_waitlist_write}</span>,
	},
];
