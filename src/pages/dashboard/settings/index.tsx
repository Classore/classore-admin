import { RiLoaderLine, RiSettings6Line } from "@remixicon/react";
import { useFormik } from "formik";
import { toast } from "sonner";
import React from "react";

import { PointsAndReferrals } from "@/components/settings/points-and-referrals";
import { Withdrawals } from "@/components/settings/withdrawals";
import { useGetConfig, useUpdateConfig } from "@/queries";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import type { SettingConfig } from "@/types";
import { Seo } from "@/components/shared";
import { queryClient } from "@/providers";

const tabs = [
	{ label: "points and referrals", icon: RiSettings6Line },
	// { label: "withdrawals", icon: RiMoneyDollarCircleLine },
];
const initialConfig: SettingConfig = {
	allow_withdrawal: "YES",
	Withdrawal_limit: 0,
	limit_withdrawal: "YES",
	point_conversion_factor: "",
	point_per_completed_module: "",
	referral_active: "YES",
	referral_percentage_for_marketers: "",
	referral_percentage_for_parents: "",
	referral_percentage_for_students: "",
};

const Page = () => {
	const [tab, setTab] = React.useState(tabs[0].label);

	const { data } = useGetConfig();

	const config = React.useMemo(() => {
		if (!data) return initialConfig;
		return data.data;
	}, [data]);

	const { handleChange, resetForm, setFieldValue, values } = useFormik<SettingConfig>({
		initialValues: {
			allow_withdrawal: "YES",
			Withdrawal_limit: config.Withdrawal_limit,
			limit_withdrawal: config.limit_withdrawal || "YES",
			point_conversion_factor: config.point_conversion_factor || 0.5,
			point_per_completed_module: config.point_per_completed_module,
			referral_active: config.referral_active || "YES",
			referral_percentage_for_marketers: config.referral_percentage_for_marketers,
			referral_percentage_for_parents: config.referral_percentage_for_parents,
			referral_percentage_for_students: config.referral_percentage_for_students,
		},
		onSubmit: (values) => {
			console.log(values);
		},
		enableReinitialize: true,
	});

	const { isPending, mutate } = useUpdateConfig({
		onError: (error) => {
			const errorMessage = Array.isArray(error.response?.data.message)
				? error.response?.data.message[0]
				: error.response?.data.message;
			const message = errorMessage || "An error occurred";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-config"] });
		},
		onSuccess: () => {
			toast.success("Settings updated successfully");
		},
	});

	return (
		<>
			<Seo title="Settings" />
			<DashboardLayout>
				<div className="h-full w-full space-y-6">
					<div className="flex w-full items-center justify-between rounded-xl bg-white p-5">
						<p className="text-xl font-medium">Settings</p>
						<div className="flex items-center gap-x-4">
							<Button
								disabled={isPending}
								onClick={() => resetForm({ values: config })}
								size="sm"
								variant="outline">
								Discard Changes
							</Button>
							<Button onClick={() => mutate(values)} size="sm">
								{isPending ? <RiLoaderLine className="animate-spin" /> : "Save Changes"}
							</Button>
						</div>
					</div>
					<div className="h-[calc(100%-100px)] w-full space-y-5 rounded-xl bg-white p-5">
						<div className="flex h-10 items-center gap-x-4 border-b">
							{tabs.map(({ icon: Icon, label }) => (
								<button
									key={label}
									onClick={() => setTab(label)}
									className={`relative flex h-10 items-center gap-x-1 text-sm font-medium capitalize before:absolute before:bottom-0 before:left-0 before:h-[1px] before:bg-primary-400 ${label === tab ? "text-primary-400 before:w-full" : "text-neutral-400 before:w-0"}`}>
									<Icon className="size-5" /> {label}
								</button>
							))}
						</div>
						<div className="h-[calc(100%-60px)] w-full">
							<PointsAndReferrals handleChange={handleChange} tab={tab} values={values} />
							<Withdrawals
								handleChange={handleChange}
								setFieldValue={setFieldValue}
								tab={tab}
								values={values}
							/>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
