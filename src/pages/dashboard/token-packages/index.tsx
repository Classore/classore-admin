import {
	RiAddLine,
	RiCoinLine,
	RiDeleteBinLine,
	RiEditLine,
	RiLoaderLine,
	RiToggleFill,
	RiToggleLine,
} from "@remixicon/react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout";
import { Seo, Spinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	type CreateTokenPackageDto,
	type TokenPackage,
	useCreateTokenPackage,
	useDeleteTokenPackage,
	useGetAllTokenPackages,
	useUpdateTokenPackage,
} from "@/queries";

// ── Form types ────────────────────────────────────────────────────────────────

interface PackageFormData {
	name: string;
	price: string;
	base_tokens: string;
	bonus_tokens: string;
	apple_product_id: string;
	google_product_id: string;
	is_active: boolean;
}

const defaultValues: PackageFormData = {
	name: "",
	price: "",
	base_tokens: "",
	bonus_tokens: "0",
	apple_product_id: "",
	google_product_id: "",
	is_active: true,
};

// ── Page ──────────────────────────────────────────────────────────────────────

const Page = () => {
	const [createOpen, setCreateOpen] = React.useState(false);
	const [editTarget, setEditTarget] = React.useState<TokenPackage | null>(null);
	const [deleteTarget, setDeleteTarget] = React.useState<TokenPackage | null>(null);

	const { data: packages = [], isLoading } = useGetAllTokenPackages();

	// ── Create ────────────────────────────────────────────────────────────────
	const {
		register: regCreate,
		handleSubmit: handleCreate,
		reset: resetCreate,
		formState: { errors: createErrors },
	} = useForm<PackageFormData>({ defaultValues });

	const createMutation = useCreateTokenPackage({
		onSuccess: () => {
			toast.success("Token package created successfully");
			setCreateOpen(false);
			resetCreate();
		},
		onError: (err) => {
			const msg =
				Array.isArray(err?.response?.data?.message)
					? err.response.data.message[0]
					: err?.response?.data?.message ?? "Failed to create package";
			toast.error(msg);
		},
	});

	const onCreateSubmit = (data: PackageFormData) => {
		const payload: CreateTokenPackageDto = {
			name: data.name,
			price: Number(data.price),
			base_tokens: Number(data.base_tokens),
			bonus_tokens: Number(data.bonus_tokens),
			apple_product_id: data.apple_product_id.trim() || undefined,
			google_product_id: data.google_product_id.trim() || undefined,
			is_active: data.is_active,
		};
		createMutation.mutate(payload);
	};

	// ── Edit ──────────────────────────────────────────────────────────────────
	const {
		register: regEdit,
		handleSubmit: handleEdit,
		reset: resetEdit,
		formState: { errors: editErrors },
	} = useForm<PackageFormData>({ defaultValues });

	React.useEffect(() => {
		if (editTarget) {
			resetEdit({
				name: editTarget.name,
				price: String(editTarget.price),
				base_tokens: String(editTarget.base_tokens),
				bonus_tokens: String(editTarget.bonus_tokens),
				apple_product_id: editTarget.apple_product_id || "",
				google_product_id: editTarget.google_product_id || "",
				is_active: editTarget.is_active,
			});
		}
	}, [editTarget, resetEdit]);

	const updateMutation = useUpdateTokenPackage({
		onSuccess: () => {
			toast.success("Token package updated successfully");
			setEditTarget(null);
		},
		onError: (err) => {
			toast.error(err?.response?.data?.message ?? "Failed to update package");
		},
	});

	const onEditSubmit = (data: PackageFormData) => {
		if (!editTarget) return;
		updateMutation.mutate({
			id: editTarget.id,
			payload: {
				name: data.name,
				price: Number(data.price),
				base_tokens: Number(data.base_tokens),
				bonus_tokens: Number(data.bonus_tokens),
				apple_product_id: data.apple_product_id.trim() || undefined,
				google_product_id: data.google_product_id.trim() || undefined,
				is_active: data.is_active,
			},
		});
	};

	// ── Delete ────────────────────────────────────────────────────────────────
	const deleteMutation = useDeleteTokenPackage({
		onSuccess: () => {
			toast.success("Token package deleted");
			setDeleteTarget(null);
		},
		onError: (err) => {
			toast.error(err?.response?.data?.message ?? "Failed to delete package");
		},
	});

	// ── Toggle active ─────────────────────────────────────────────────────────
	const toggleMutation = useUpdateTokenPackage({
		onSuccess: () => toast.success("Package status updated"),
		onError: () => toast.error("Failed to update status"),
	});

	const handleToggle = (pkg: TokenPackage) => {
		toggleMutation.mutate({ id: pkg.id, payload: { is_active: !pkg.is_active } });
	};

	// ── Reusable form fields ─────────────────────────────────────────────────
	const renderFields = (
		reg: typeof regCreate,
		errors: typeof createErrors
	) => (
		<div className="space-y-4">
			<div>
				<label className="mb-1 block text-xs font-medium text-neutral-600">
					Package Name
				</label>
				<Input
					placeholder="e.g. Starter Pack"
					{...reg("name", { required: "Name is required" })}
				/>
				{errors.name && (
					<p className="mt-0.5 text-xs text-red-500">{errors.name.message}</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="mb-1 block text-xs font-medium text-neutral-600">
						Price (₦)
					</label>
					<Input
						type="number"
						min={0}
						placeholder="e.g. 2000"
						{...reg("price", {
							required: "Price is required",
							min: { value: 0, message: "Must be ≥ 0" },
						})}
					/>
					{errors.price && (
						<p className="mt-0.5 text-xs text-red-500">{errors.price.message}</p>
					)}
				</div>
				<div>
					<label className="mb-1 block text-xs font-medium text-neutral-600">
						Base Tokens
					</label>
					<Input
						type="number"
						min={1}
						placeholder="e.g. 200"
						{...reg("base_tokens", {
							required: "Base tokens required",
							min: { value: 1, message: "Must be ≥ 1" },
						})}
					/>
					{errors.base_tokens && (
						<p className="mt-0.5 text-xs text-red-500">{errors.base_tokens.message}</p>
					)}
				</div>
			</div>

			<div>
				<label className="mb-1 block text-xs font-medium text-neutral-600">
					Bonus Tokens (optional)
				</label>
				<Input
					type="number"
					min={0}
					placeholder="e.g. 20"
					{...reg("bonus_tokens", {
						min: { value: 0, message: "Must be ≥ 0" },
					})}
				/>
				{errors.bonus_tokens && (
					<p className="mt-0.5 text-xs text-red-500">{errors.bonus_tokens.message}</p>
				)}
			</div>

			<div className="rounded-lg border border-neutral-100 bg-neutral-50/60 p-3">
				<div>
					<label className="mb-1 block text-xs font-medium text-neutral-700">
						Apple Product ID (SKU)
					</label>
					<Input
						placeholder="e.g. com.classore.tokens.100"
						{...reg("apple_product_id")}
					/>
					<p className="mt-1 text-[11px] text-neutral-400">
						StoreKit 2 In-App Purchase SKU configured in App Store Connect (iOS)
					</p>
				</div>

				{/* Google Product ID commented out for now since Paystack is used for Android & Web */}
				{/* <div>
					<label className="mb-1 block text-xs font-medium text-neutral-700">
						Google Product ID (SKU)
					</label>
					<Input
						placeholder="e.g. com.classore.tokens.100"
						{...reg("google_product_id")}
					/>
					<p className="mt-1 text-[11px] text-neutral-400">
						In-App SKU from Google Play Console
					</p>
				</div> */}
			</div>
		</div>
	);

	return (
		<>
			<Seo title="Token Packages" />
			<DashboardLayout>
				<div className="space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-xl font-semibold text-neutral-900">
								Token Packages
							</h1>
							<p className="mt-1 text-sm text-neutral-500">
								Manage purchasable token packs. Students buy tokens here and
								spend them on bundles.
							</p>
						</div>
						<Button
							size="sm"
							className="gap-x-1"
							onClick={() => setCreateOpen(true)}
						>
							<RiAddLine className="size-4" />
							New Package
						</Button>
					</div>

					{/* Pricing formula reminder */}
					<div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
						<p className="text-xs font-medium text-blue-700">
							💡 Pricing formula: If selected subjects ≤ allowed → use{" "}
							<strong>Bundle Token Cost</strong>. If more → add{" "}
							<strong>Single Course Token Cost × extra subjects</strong>. Set
							these per bundle in the Subcategories section.
						</p>
					</div>

					{/* Packages table */}
					{isLoading ? (
						<div className="flex h-40 items-center justify-center">
							<Spinner />
						</div>
					) : packages.length === 0 ? (
						<div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-200">
							<RiCoinLine className="size-10 text-neutral-300" />
							<p className="text-sm text-neutral-400">
								No token packages yet. Create one above.
							</p>
						</div>
					) : (
						<div className="overflow-hidden rounded-xl border border-neutral-200">
							<table className="w-full text-sm">
								<thead className="bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
									<tr>
										<th className="px-4 py-3 text-left">Name</th>
										<th className="px-4 py-3 text-right">Price (₦)</th>
										<th className="px-4 py-3 text-right">Base Tokens</th>
										<th className="px-4 py-3 text-right">Bonus Tokens</th>
										<th className="px-4 py-3 text-right">Total</th>
										<th className="px-4 py-3 text-left">Apple IAP SKU</th>
										<th className="px-4 py-3 text-center">Active</th>
										<th className="px-4 py-3 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-neutral-100">
									{(Array.isArray(packages) ? packages : []).map((pkg) => (
										<tr key={pkg.id} className="hover:bg-neutral-50">
											<td className="px-4 py-3 font-medium capitalize text-neutral-800">
												{pkg.name}
											</td>
											<td className="px-4 py-3 text-right text-neutral-600">
												₦{Number(pkg.price || 0).toLocaleString()}
											</td>
											<td className="px-4 py-3 text-right text-neutral-600">
												{Number(pkg.base_tokens || 0).toLocaleString()}
											</td>
											<td className="px-4 py-3 text-right text-green-600">
												{Number(pkg.bonus_tokens || 0) > 0
													? `+${Number(pkg.bonus_tokens).toLocaleString()}`
													: "—"}
											</td>
											<td className="px-4 py-3 text-right font-semibold text-neutral-800">
												{(
													Number(pkg.base_tokens || 0) + Number(pkg.bonus_tokens || 0)
												).toLocaleString()}
											</td>
											<td className="px-4 py-3 text-xs">
												{pkg.apple_product_id ? (
													<span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] text-neutral-700">
														<span className="font-sans">🍎</span> {pkg.apple_product_id}
													</span>
												) : (
													<span className="text-neutral-400">—</span>
												)}
											</td>
											<td className="px-4 py-3 text-center">
												<button
													onClick={() => handleToggle(pkg)}
													disabled={toggleMutation.isPending}
													className="text-primary-600"
												>
													{pkg.is_active ? (
														<RiToggleFill className="size-6" />
													) : (
														<RiToggleLine className="size-6 text-neutral-300" />
													)}
												</button>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center justify-end gap-x-2">
													<button
														onClick={() => setEditTarget(pkg)}
														className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600"
													>
														<RiEditLine className="size-4" />
													</button>
													<button
														onClick={() => setDeleteTarget(pkg)}
														className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500"
													>
														<RiDeleteBinLine className="size-4" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* ── Create dialog ─────────────────────────────────────────────── */}
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogContent className="w-[520px]">
						<DialogHeader>
							<DialogTitle>New Token Package</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreate(onCreateSubmit)} className="space-y-5 pt-2">
							{renderFields(regCreate, createErrors)}
							<Button
								type="submit"
								className="w-full"
								disabled={createMutation.isPending}
							>
								{createMutation.isPending ? (
									<RiLoaderLine className="animate-spin" />
								) : (
									"Create Package"
								)}
							</Button>
						</form>
					</DialogContent>
				</Dialog>

				{/* ── Edit dialog ───────────────────────────────────────────────── */}
				<Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
					<DialogContent className="w-[520px]">
						<DialogHeader>
							<DialogTitle>Edit Token Package</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleEdit(onEditSubmit)} className="space-y-5 pt-2">
							{renderFields(regEdit, editErrors)}
							<div className="flex gap-x-3">
								<Button
									type="button"
									variant="outline"
									className="flex-1"
									onClick={() => setEditTarget(null)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="flex-1"
									disabled={updateMutation.isPending}
								>
									{updateMutation.isPending ? (
										<RiLoaderLine className="animate-spin" />
									) : (
										"Save Changes"
									)}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>

				{/* ── Delete confirm dialog ─────────────────────────────────────── */}
				<Dialog
					open={!!deleteTarget}
					onOpenChange={(o) => !o && setDeleteTarget(null)}
				>
					<DialogContent className="w-[400px]">
						<DialogHeader>
							<DialogTitle>Delete Token Package</DialogTitle>
						</DialogHeader>
						<p className="text-sm text-neutral-600">
							Are you sure you want to delete{" "}
							<strong className="capitalize">{deleteTarget?.name}</strong>? This
							cannot be undone and will affect any students who have purchased
							tokens.
						</p>
						<div className="flex gap-x-3 pt-2">
							<Button
								variant="outline"
								className="flex-1"
								onClick={() => setDeleteTarget(null)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								className="flex-1"
								disabled={deleteMutation.isPending}
								onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
							>
								{deleteMutation.isPending ? (
									<RiLoaderLine className="animate-spin" />
								) : (
									"Delete"
								)}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</DashboardLayout>
		</>
	);
};

export default Page;
