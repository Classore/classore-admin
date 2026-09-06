import type { ColumnDef } from "@tanstack/react-table";
import {
	RiAddLine,
	RiMore2Fill,
	RiEdit2Line,
	RiDeleteBinLine,
	RiBook3Line,
	RiLayoutGridLine,
} from "@remixicon/react";
import Link from "next/link";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout";
import { DataTable, Seo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { queryClient } from "@/providers";
import { useUserStore } from "@/store/z-store";
import { type BlogProps, DeleteBlog, GetAllBlogs } from "@/queries/blog";

type TabView = "articles" | "categories";

export default function StudyGuidesAdminPage() {
	const { user } = useUserStore();
	const userId = user?.id ?? "";

	const [tab, setTab] = useState<TabView>("articles");
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<BlogProps | null>(null);
	const [createCategoryOpen, setCreateCategoryOpen] = useState(false);

	const [localBlogs, setLocalBlogs] = useState<BlogProps[]>([]);

	const [localCategories, setLocalCategories] = useState<{ id: string; title: string }[]>([]);

	const { data: categoriesData } = useQuery({
		queryKey: ["blog-categories", userId],
		queryFn: () => GetAllBlogCategories(userId),
		enabled: !!userId,
		retry: false,
	});

	// Add an effect to sync the query data:
	React.useEffect(() => {
		const raw = categoriesData?.data;
		if (!raw) return;
		const arr: { id: string; title: string }[] = Array.isArray(raw)
			? (raw as { id: string; title: string }[])
			: Array.isArray((raw as { data?: unknown[] }).data)
				? (raw as { data: { id: string; title: string }[] }).data
				: [];
		setLocalCategories(arr);
	}, [categoriesData]);

	const { data: blogsData, isLoading } = useQuery({
		queryKey: ["blogs"],
		queryFn: () => GetAllBlogs(),
		retry: false,
	});

	// Normalize both paginated { data:[] } and direct-array responses
	React.useEffect(() => {
		const raw = blogsData?.data;
		if (!raw) return;
		const arr: BlogProps[] = Array.isArray(raw)
			? raw
			: Array.isArray((raw as { data?: BlogProps[] }).data)
				? (raw as { data: BlogProps[] }).data
				: [];
		setLocalBlogs(arr);
	}, [blogsData]);

	const { isPending: isDeleting, mutate: deleteBlog } = useMutation({
		mutationFn: (blogId: string) => DeleteBlog(blogId, userId),
		mutationKey: ["delete-blog"],
		onSuccess: (data, deletedId) => {
			toast.success(data.message ?? "Article deleted successfully");
			setLocalBlogs((prev) => prev.filter((b) => b.id !== deletedId));
			queryClient.invalidateQueries({ queryKey: ["blogs"] });
			setDeleteModalOpen(false);
			setSelectedItem(null);
		},
		onError: (error: { response?: { data?: { message?: string } } }) => {
			toast.error(error?.response?.data?.message ?? "Failed to delete article");
		},
	});

	const columns: ColumnDef<BlogProps>[] = [
		{
			accessorKey: "cover_photo",
			header: "Cover",
			cell: ({ row }) => (
				<div className="relative h-10 w-16 overflow-hidden rounded-md border border-neutral-200">
					{row.original.cover_photo ? (
						// Use native img to bypass Next.js optimizer (GCS bucket restricts proxy)
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={row.original.cover_photo}
							alt={row.original.title}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex size-full items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
							<RiBook3Line className="size-4 text-primary-400" />
						</div>
					)}
				</div>
			),
		},
		{
			accessorKey: "title",
			header: "Title",
			cell: ({ row }) => (
				<span className="line-clamp-2 max-w-[220px] font-medium text-neutral-900">
					{row.original.title}
				</span>
			),
		},
		// {
		// 	accessorKey: "category",
		// 	header: "Category",
		// 	cell: ({ row }) => {
		// 		const cat = row.original.category;
		// 		const label = typeof cat === "string" ? cat : cat?.title;
		// 		console.log("row original ", row.original);
		// 		console.log("label ", label);
		// 		return (
		// 			<span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-600">
		// 				{label ?? "—"}
		// 			</span>
		// 		);
		// 	},
		// },

		{
			accessorKey: "category",
			header: "Category",
			cell: ({ row }) => {
				const catId = row.original.category;
				const label =
					typeof catId === "string"
						? (localCategories.find((c) => c.id === catId)?.title ?? "—")
						: String(catId ?? "—");

				console.log("row original ", catId);

				return (
					<span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-600">
						{label}
					</span>
				);
			},
		},

		{
			accessorKey: "slug",
			header: "Slug",
			cell: ({ row }) => (
				<span className="font-mono text-xs text-neutral-500">{row.original.slug}</span>
			),
		},
		{
			accessorKey: "createdOn",
			header: "Date Published",
			cell: ({ row }) => (
				<span className="text-sm text-neutral-600">
					{row.original.createdOn ? format(new Date(row.original.createdOn), "MMM dd, yyyy") : "—"}
				</span>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="size-8 justify-center border-none p-0 text-neutral-500 hover:bg-neutral-100 focus-visible:ring-0">
							<span className="sr-only">Open menu</span>
							<RiMore2Fill className="size-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link
								href={`/dashboard/study-guides/${row.original.id}/edit`}
								className="flex cursor-pointer items-center gap-2">
								<RiEdit2Line className="size-4" />
								Edit
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								setSelectedItem(row.original);
								setDeleteModalOpen(true);
							}}
							className="mt-1 flex cursor-pointer items-center gap-2 border-t border-neutral-100 pt-2 text-red-600 transition-colors focus:bg-red-500 focus:text-white">
							<RiDeleteBinLine className="size-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return (
		<>
			<Seo title="Manage Study Guides" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-6">
					{/* Header */}
					<div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-2xl font-bold text-neutral-900">Study Guides & Tips</h1>
							<p className="text-sm text-neutral-500">
								Manage all published guides, tips articles, and categories.
							</p>
						</div>

						<div className="flex items-center gap-3">
							{tab === "articles" && (
								<Link href="/dashboard/study-guides/create">
									<Button variant="default" className="flex items-center gap-2 px-5 py-2.5">
										<RiAddLine className="size-4" />
										New Article
									</Button>
								</Link>
							)}
							{tab === "categories" && (
								<Button
									variant="default"
									onClick={() => setCreateCategoryOpen(true)}
									className="flex items-center gap-2 px-5 py-2.5">
									<RiAddLine className="size-4" />
									New Category
								</Button>
							)}
						</div>
					</div>

					{/* Tab Switcher */}
					<div className="flex items-center gap-1 self-start rounded-xl border border-neutral-200 bg-neutral-50/80 p-1.5 shadow-sm backdrop-blur-sm">
						<button
							type="button"
							onClick={() => setTab("articles")}
							className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${tab === "articles"
									? "bg-white text-primary-600 shadow-md ring-1 ring-neutral-200/50"
									: "text-neutral-500 hover:bg-neutral-100/50 hover:text-neutral-800"
								}`}>
							<RiBook3Line className="size-4" />
							Articles
						</button>
						<button
							type="button"
							onClick={() => setTab("categories")}
							className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${tab === "categories"
									? "bg-white text-primary-600 shadow-md ring-1 ring-neutral-200/50"
									: "text-neutral-500 hover:bg-neutral-100/50 hover:text-neutral-800"
								}`}>
							<RiLayoutGridLine className="size-4" />
							Categories
						</button>
					</div>

					{/* Articles Table */}
					{tab === "articles" && (
						<div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
							<DataTable columns={columns} data={localBlogs} isLoading={isLoading} />
						</div>
					)}

					{/* Categories Panel */}
					{tab === "categories" && (
						<CategoriesPanel
							userId={userId}
							open={createCategoryOpen}
							onOpenChange={setCreateCategoryOpen}
						/>
					)}
				</div>
			</DashboardLayout>

			{/* Delete Blog Dialog */}
			<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete Article</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete &quot;{selectedItem?.title}&quot;? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-4 gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							disabled={isDeleting}
							onClick={() => setDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isDeleting || !selectedItem?.id}
							onClick={() => selectedItem?.id && deleteBlog(selectedItem.id)}
							className="border-0 bg-red-600 text-white hover:bg-red-700">
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

// ─── Categories Sub-Panel ────────────────────────────────────────────────────

import type { ColumnDef as ColDef } from "@tanstack/react-table";
import {
	type BlogCategoryProps,
	DeleteBlogCategory,
	GetAllBlogCategories,
	CreateBlogCategory,
	UpdateBlogCategory,
} from "@/queries/blog";
import { Input } from "@/components/ui/input";

function CategoriesPanel({
	userId,
	open,
	onOpenChange,
}: {
	userId: string;
	open: boolean;
	onOpenChange: (v: boolean) => void;
}) {
	const [catDeleteOpen, setCatDeleteOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [selectedCat, setSelectedCat] = useState<BlogCategoryProps | null>(null);
	const [title, setTitle] = useState("");
	const [editTitle, setEditTitle] = useState("");
	const [localCategories, setLocalCategories] = useState<BlogCategoryProps[]>([]);

	const { data: categoriesData, isLoading: catsLoading } = useQuery({
		queryKey: ["blog-categories", userId],
		queryFn: () => GetAllBlogCategories(userId),
		enabled: !!userId,
		retry: false,
	});

	// Sync query results → local state whenever the fetch succeeds
	React.useEffect(() => {
		const raw = categoriesData?.data;
		if (!raw) return;
		// Handle both paginated { data: [] } and direct array responses
		const arr: BlogCategoryProps[] = Array.isArray(raw)
			? (raw as BlogCategoryProps[])
			: Array.isArray((raw as { data?: BlogCategoryProps[] }).data)
				? (raw as { data: BlogCategoryProps[] }).data
				: [];
		setLocalCategories(arr);
	}, [categoriesData]);

	const { isPending: isCreating, mutate: createCategory } = useMutation({
		mutationFn: (payload: { title: string }) => CreateBlogCategory(userId, payload),
		onSuccess: (data) => {
			toast.success(data.message ?? "Category created");
			// Immediately show the new category without waiting for a GET refetch
			if (data.data) {
				setLocalCategories((prev) => [data.data, ...prev]);
			}
			queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
			onOpenChange(false);
			setTitle("");
		},
		onError: (error: { response?: { data?: { message?: string } } }) => {
			toast.error(error?.response?.data?.message ?? "Failed to create category");
		},
	});

	const { isPending: isUpdating, mutate: updateCategory } = useMutation({
		mutationFn: ({ id, title }: { id: string; title: string }) =>
			UpdateBlogCategory(id, userId, { title }),
		onSuccess: (data, variables) => {
			toast.success(data.message ?? "Category updated");
			setLocalCategories((prev) =>
				prev.map((c) => (c.id === variables.id ? { ...c, title: variables.title } : c))
			);
			queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
			setEditOpen(false);
			setSelectedCat(null);
		},
		onError: (error: { response?: { data?: { message?: string } } }) => {
			toast.error(error?.response?.data?.message ?? "Failed to update category");
		},
	});

	const { isPending: isDeleting, mutate: deleteCategory } = useMutation({
		mutationFn: (id: string) => DeleteBlogCategory(id, userId),
		onSuccess: (data, deletedId) => {
			toast.success(data.message ?? "Category deleted");
			setLocalCategories((prev) => prev.filter((c) => c.id !== deletedId));
			queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
			setCatDeleteOpen(false);
			setSelectedCat(null);
		},
		onError: (error: { response?: { data?: { message?: string } } }) => {
			toast.error(error?.response?.data?.message ?? "Failed to delete category");
		},
	});

	const catColumns: ColDef<BlogCategoryProps>[] = [
		{
			accessorKey: "title",
			header: "Category Name",
			cell: ({ row }) => <span className="font-medium text-neutral-800">{row.original.title}</span>,
		},
		{
			accessorKey: "createdOn",
			header: "Created",
			cell: ({ row }) => (
				<span className="text-sm text-neutral-500">
					{row.original.createdOn ? format(new Date(row.original.createdOn), "MMM dd, yyyy") : "—"}
				</span>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="size-8 justify-center border-none p-0 text-neutral-500 hover:bg-neutral-100 focus-visible:ring-0">
							<span className="sr-only">Open menu</span>
							<RiMore2Fill className="size-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => {
								setSelectedCat(row.original);
								setEditTitle(row.original.title);
								setEditOpen(true);
							}}
							className="flex cursor-pointer items-center gap-2">
							<RiEdit2Line className="size-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								setSelectedCat(row.original);
								setCatDeleteOpen(true);
							}}
							className="mt-1 flex cursor-pointer items-center gap-2 border-t border-neutral-100 pt-2 text-red-600 transition-colors focus:bg-red-500 focus:text-white">
							<RiDeleteBinLine className="size-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	return (
		<>
			<div className="mb-2 flex items-center justify-between">
				<p className="text-sm text-neutral-500">
					{localCategories.length} {localCategories.length === 1 ? "category" : "categories"} total
				</p>
				<Button
					variant="default"
					size="sm"
					className="flex items-center gap-2"
					onClick={() => onOpenChange(true)}>
					<RiAddLine className="size-4" />
					New Category
				</Button>
			</div>

			<div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
				<DataTable columns={catColumns} data={localCategories} isLoading={catsLoading} />
			</div>

			{/* Create Category Dialog */}
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>New Category</DialogTitle>
						<DialogDescription>
							Add a new category for Study Guides &amp; Tips articles.
						</DialogDescription>
					</DialogHeader>
					<div className="mt-2">
						<Input
							label="Category Title"
							placeholder="e.g. Exam Guides"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<DialogFooter className="mt-4 gap-2 sm:gap-0">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							variant="default"
							disabled={isCreating || !title.trim()}
							onClick={() => createCategory({ title })}>
							{isCreating ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Category Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Edit Category</DialogTitle>
						<DialogDescription>Update the category name.</DialogDescription>
					</DialogHeader>
					<div className="mt-2">
						<Input
							label="Category Title"
							placeholder="e.g. Exam Guides"
							value={editTitle}
							onChange={(e) => setEditTitle(e.target.value)}
						/>
					</div>
					<DialogFooter className="mt-4 gap-2 sm:gap-0">
						<Button variant="outline" onClick={() => setEditOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="default"
							disabled={isUpdating || !editTitle.trim() || !selectedCat?.id}
							onClick={() => selectedCat?.id && updateCategory({ id: selectedCat.id, title: editTitle })}>
							{isUpdating ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Category Dialog */}
			<Dialog open={catDeleteOpen} onOpenChange={setCatDeleteOpen}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Delete Category</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete &quot;{selectedCat?.title}&quot;? Articles using this
							category may be affected.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-4 gap-2 sm:gap-0">
						<Button variant="outline" disabled={isDeleting} onClick={() => setCatDeleteOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							disabled={isDeleting || !selectedCat?.id}
							onClick={() => selectedCat?.id && deleteCategory(selectedCat.id)}
							className="border-0 bg-red-600 text-white hover:bg-red-700">
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
