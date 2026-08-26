import {
	RiAddLine,
	RiDeleteBinLine,
	RiEditLine,
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
import { useUserStore } from "@/store/z-store";
import {
	type PromoCodeProps,
	useCreatePromoCode,
	useDeletePromoCode,
	useGetAllPromoCodes,
	useUpdatePromoCode,
} from "@/queries";

// ─── Form types (strings from inputs; cast to numbers before sending) ─────────
interface CreateFormData {
	code: string;
	influencer: string;
	percentageDiscount: string; // input is always a string; cast on submit
	useCount: string;
	is_Active: boolean;
}

interface EditFormData extends CreateFormData {}

// ─── Page ─────────────────────────────────────────────────────────────────────
const Page = () => {
	const { user } = useUserStore();
	const userId = user?.id ?? "";

	const [createOpen, setCreateOpen] = React.useState(false);
	const [editTarget, setEditTarget] = React.useState<PromoCodeProps | null>(null);
	const [deleteTarget, setDeleteTarget] = React.useState<PromoCodeProps | null>(null);

	const { data: promoCodes = [], isLoading } = useGetAllPromoCodes(userId);

	const createMutation = useCreatePromoCode(userId);
	const editMutation = useUpdatePromoCode(userId);
	const deleteMutation = useDeletePromoCode(userId);

	// ── Create ────────────────────────────────────────────────────────────────
	const {
		register: regCreate,
		handleSubmit: handleCreate,
		reset: resetCreate,
		formState: { errors: createErrors },
	} = useForm<CreateFormData>({ defaultValues: { is_Active: true } });

	const onCreateSubmit = (values: CreateFormData) => {
		createMutation.mutate(
			{
				code: values.code.trim().toUpperCase(),
				influencer: values.influencer.trim(),
				percentageDiscount: Number(values.percentageDiscount),
				useCount: Number(values.useCount),
				is_Active: Boolean(values.is_Active),
			},
			{
				onSuccess: () => {
					toast.success("Promo code created successfully");
					setCreateOpen(false);
					resetCreate({ is_Active: true });
				},
				onError: (err: unknown) => {
					const msgs = (err as { response?: { data?: { message?: string[] | string } } })
						?.response?.data?.message;
					const detail = Array.isArray(msgs) ? msgs[0] : msgs;
					toast.error(detail ?? "Failed to create promo code");
				},
			}
		);
	};

	// ── Edit ──────────────────────────────────────────────────────────────────
	const {
		register: regEdit,
		handleSubmit: handleEdit,
		reset: resetEdit,
		formState: { errors: editErrors },
	} = useForm<EditFormData>();

	React.useEffect(() => {
		if (editTarget) {
			resetEdit({
				code: editTarget.code,
				influencer: editTarget.influencer,
				percentageDiscount: String(editTarget.percentageDiscount),
				useCount: String(editTarget.useCount),
				is_Active: editTarget.isActive, // read camelCase from response
			});
		}
	}, [editTarget, resetEdit]);

	const onEditSubmit = (values: EditFormData) => {
		if (!editTarget) return;
		editMutation.mutate(
			{
				promoCodeId: editTarget.id,
				payload: {
					code: values.code.trim().toUpperCase(),
					influencer: values.influencer.trim(),
					percentageDiscount: Number(values.percentageDiscount),
					useCount: Number(values.useCount),
					is_Active: Boolean(values.is_Active),
				},
			},
			{
				onSuccess: () => {
					toast.success("Promo code updated");
					setEditTarget(null);
				},
				onError: (err: unknown) => {
					const msgs = (err as { response?: { data?: { message?: string[] | string } } })
						?.response?.data?.message;
					const detail = Array.isArray(msgs) ? msgs[0] : msgs;
					toast.error(detail ?? "Failed to update promo code");
				},
			}
		);
	};

	// ── Toggle active ─────────────────────────────────────────────────────────
	const handleToggleActive = (promo: PromoCodeProps) => {
		editMutation.mutate(
			{ promoCodeId: promo.id, payload: { is_Active: !promo.isActive } },
			{
				onSuccess: () =>
					toast.success(promo.isActive ? "Promo code deactivated" : "Promo code activated"),
				onError: () => toast.error("Failed to update status"),
			}
		);
	};

	// ── Delete ────────────────────────────────────────────────────────────────
	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteMutation.mutate(deleteTarget.id, {
			onSuccess: () => {
				toast.success("Promo code deleted");
				setDeleteTarget(null);
			},
			onError: () => toast.error("Failed to delete promo code"),
		});
	};

	// ─── Render ───────────────────────────────────────────────────────────────
	return (
		<>
			<Seo title="Promo Codes" />
			<DashboardLayout>
				<div className="flex w-full flex-col gap-6 p-6">
					{/* Header */}
					<div className="flex w-full items-center justify-between">
						<div>
							<h1 className="text-xl font-bold text-neutral-900">Promo Codes</h1>
							<p className="text-sm text-neutral-500">
								Manage discount codes for students
							</p>
						</div>
						<Button
							onClick={() => setCreateOpen(true)}
							className="flex items-center gap-2">
							<RiAddLine size={16} />
							New Promo Code
						</Button>
					</div>

					{/* Table */}
					<div className="w-full rounded-xl border border-neutral-200 bg-white">
						{isLoading ? (
							<div className="flex items-center justify-center p-12">
								<Spinner variant="primary" size="md" />
							</div>
						) : promoCodes.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
								<p className="text-neutral-500">No promo codes yet.</p>
								<Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
									Create your first promo code
								</Button>
							</div>
						) : (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
										<th className="px-5 py-3">Code</th>
										<th className="px-5 py-3">Influencer</th>
										<th className="px-5 py-3">Discount</th>
										<th className="px-5 py-3">Max Uses</th>
										<th className="px-5 py-3">Status</th>
										<th className="px-5 py-3">Created</th>
										<th className="px-5 py-3 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-neutral-100">
									{promoCodes.map((promo) => (
										<tr
											key={promo.id}
											className="transition-colors hover:bg-neutral-50">
											<td className="px-5 py-3 font-mono font-semibold text-neutral-900">
												{promo.code}
											</td>
											<td className="px-5 py-3 text-neutral-700">{promo.influencer}</td>
											<td className="px-5 py-3">
												<span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
													{promo.percentageDiscount}% off
												</span>
											</td>
											<td className="px-5 py-3 text-neutral-600">{promo.useCount}</td>
											<td className="px-5 py-3">
												<button
													onClick={() => handleToggleActive(promo)}
													disabled={editMutation.isPending}
													className="flex items-center gap-1.5 text-xs font-medium transition-colors"
													title={promo.isActive ? "Deactivate" : "Activate"}>
													{promo.isActive ? (
														<>
															<RiToggleFill size={20} className="text-primary-400" />
															<span className="text-primary-400">Active</span>
														</>
													) : (
														<>
															<RiToggleLine size={20} className="text-neutral-400" />
															<span className="text-neutral-400">Inactive</span>
														</>
													)}
												</button>
											</td>
											<td className="px-5 py-3 text-neutral-500">
												{new Date(promo.createdOn).toLocaleDateString()}
											</td>
											<td className="px-5 py-3">
												<div className="flex items-center justify-end gap-2">
													<button
														onClick={() => setEditTarget(promo)}
														className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
														title="Edit">
														<RiEditLine size={16} />
													</button>
													<button
														onClick={() => setDeleteTarget(promo)}
														className="rounded p-1.5 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
														title="Delete">
														<RiDeleteBinLine size={16} />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>

				{/* ── Create Dialog ── */}
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogContent className="flex w-[420px] flex-col gap-6">
						<DialogHeader>
							<DialogTitle>Create Promo Code</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreate(onCreateSubmit)} className="flex flex-col gap-4">
							<div className="flex flex-col gap-1.5">
								<label htmlFor="c-code" className="text-sm font-medium text-neutral-700">
									Code
								</label>
								<Input
									id="c-code"
									placeholder="e.g. SAVE20"
									className="uppercase"
									{...regCreate("code", { required: "Code is required" })}
								/>
								{createErrors.code && (
									<p className="text-xs text-red-500">{createErrors.code.message}</p>
								)}
							</div>

							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="c-influencer"
									className="text-sm font-medium text-neutral-700">
									Influencer
								</label>
								<Input
									id="c-influencer"
									placeholder="Influencer name or handle"
									{...regCreate("influencer", { required: "Influencer is required" })}
								/>
								{createErrors.influencer && (
									<p className="text-xs text-red-500">{createErrors.influencer.message}</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1.5">
									<label
										htmlFor="c-discount"
										className="text-sm font-medium text-neutral-700">
										Discount (%)
									</label>
									<Input
										id="c-discount"
										type="number"
										min={1}
										max={100}
										placeholder="e.g. 20"
										{...regCreate("percentageDiscount", {
											required: "Required",
											min: { value: 1, message: "Min 1" },
											max: { value: 100, message: "Max 100" },
										})}
									/>
									{createErrors.percentageDiscount && (
										<p className="text-xs text-red-500">
											{createErrors.percentageDiscount.message}
										</p>
									)}
								</div>

								<div className="flex flex-col gap-1.5">
									<label
										htmlFor="c-usecount"
										className="text-sm font-medium text-neutral-700">
										Max Uses
									</label>
									<Input
										id="c-usecount"
										type="number"
										min={1}
										placeholder="e.g. 100"
										{...regCreate("useCount", {
											required: "Required",
											min: { value: 1, message: "Min 1" },
										})}
									/>
									{createErrors.useCount && (
										<p className="text-xs text-red-500">{createErrors.useCount.message}</p>
									)}
								</div>
							</div>

							<div className="flex items-center gap-3">
								<input
									id="c-active"
									type="checkbox"
									className="size-4 rounded accent-primary-400"
									{...regCreate("is_Active")}
								/>
								<label htmlFor="c-active" className="text-sm font-medium text-neutral-700">
									Active
								</label>
							</div>

							<Button type="submit" disabled={createMutation.isPending} className="mt-2">
								{createMutation.isPending ? <Spinner /> : "Create Promo Code"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>

				{/* ── Edit Dialog ── */}
				<Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
					<DialogContent className="flex w-[420px] flex-col gap-6">
						<DialogHeader>
							<DialogTitle>Edit Promo Code</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleEdit(onEditSubmit)} className="flex flex-col gap-4">
							<div className="flex flex-col gap-1.5">
								<label htmlFor="e-code" className="text-sm font-medium text-neutral-700">
									Code
								</label>
								<Input
									id="e-code"
									placeholder="e.g. SAVE20"
									className="uppercase"
									{...regEdit("code", { required: "Code is required" })}
								/>
								{editErrors.code && (
									<p className="text-xs text-red-500">{editErrors.code.message}</p>
								)}
							</div>

							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="e-influencer"
									className="text-sm font-medium text-neutral-700">
									Influencer
								</label>
								<Input
									id="e-influencer"
									placeholder="Influencer name or handle"
									{...regEdit("influencer", { required: "Influencer is required" })}
								/>
								{editErrors.influencer && (
									<p className="text-xs text-red-500">{editErrors.influencer.message}</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex flex-col gap-1.5">
									<label
										htmlFor="e-discount"
										className="text-sm font-medium text-neutral-700">
										Discount (%)
									</label>
									<Input
										id="e-discount"
										type="number"
										min={1}
										max={100}
										placeholder="e.g. 20"
										{...regEdit("percentageDiscount", {
											required: "Required",
											min: { value: 1, message: "Min 1" },
											max: { value: 100, message: "Max 100" },
										})}
									/>
									{editErrors.percentageDiscount && (
										<p className="text-xs text-red-500">
											{editErrors.percentageDiscount.message}
										</p>
									)}
								</div>

								<div className="flex flex-col gap-1.5">
									<label
										htmlFor="e-usecount"
										className="text-sm font-medium text-neutral-700">
										Max Uses
									</label>
									<Input
										id="e-usecount"
										type="number"
										min={1}
										placeholder="e.g. 100"
										{...regEdit("useCount", {
											required: "Required",
											min: { value: 1, message: "Min 1" },
										})}
									/>
									{editErrors.useCount && (
										<p className="text-xs text-red-500">{editErrors.useCount.message}</p>
									)}
								</div>
							</div>

							<div className="flex items-center gap-3">
								<input
									id="e-active"
									type="checkbox"
									className="size-4 rounded accent-primary-400"
									{...regEdit("is_Active")}
								/>
								<label htmlFor="e-active" className="text-sm font-medium text-neutral-700">
									Active
								</label>
							</div>

							<Button type="submit" disabled={editMutation.isPending} className="mt-2">
								{editMutation.isPending ? <Spinner /> : "Save Changes"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>

				{/* ── Delete Confirm Dialog ── */}
				<Dialog
					open={!!deleteTarget}
					onOpenChange={(open) => !open && setDeleteTarget(null)}>
					<DialogContent className="flex w-[380px] flex-col gap-6">
						<DialogHeader>
							<DialogTitle>Delete Promo Code</DialogTitle>
						</DialogHeader>
						<p className="text-sm text-neutral-500">
							Are you sure you want to delete{" "}
							<span className="font-mono font-semibold text-neutral-900">
								{deleteTarget?.code}
							</span>
							? This action cannot be undone.
						</p>
						<div className="flex justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => setDeleteTarget(null)}
								disabled={deleteMutation.isPending}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDelete}
								disabled={deleteMutation.isPending}>
								{deleteMutation.isPending ? <Spinner /> : "Delete"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</DashboardLayout>
		</>
	);
};

export default Page;
