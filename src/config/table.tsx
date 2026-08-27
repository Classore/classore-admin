import type { ColumnDef } from "@tanstack/react-table";

import type { PaginatedRoleProps } from "@/types";

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
