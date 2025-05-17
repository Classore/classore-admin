import { RiCreativeCommonsNdLine, RiPercentLine } from "@remixicon/react";
import React from "react";

import type { SettingConfig } from "@/types";
import { MetricInput } from "./input";
import { TabPanel } from "../shared";

interface Props {
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	tab: string;
	values: SettingConfig;
}

export const PointsAndReferrals = ({ handleChange, tab, values }: Props) => {
	return (
		<TabPanel selected={tab} value="points and referrals">
			<div className="grid h-full w-full grid-cols-2 gap-x-2">
				<div className="space-y-3 bg-[#F6F8FA] p-3">
					<p className="text-sm text-neutral-400">POINTS SETTINGS</p>
					<div className="w-full space-y-2">
						<div className="flex w-full items-start gap-x-2 rounded-md bg-white p-4">
							<RiCreativeCommonsNdLine className="size-5" />
							<div className="space-y-2">
								<p className="text-sm">Point-to-Naira Rate</p>
								<p className="text-xs text-neutral-400">
									Define the cash value of each point earned on Classore.
								</p>
								<div className="flex w-full items-center gap-x-1.5">
									<MetricInput label="Points" name="" value={1} onChange={handleChange} metric="Pts" />
									<MetricInput
										label="Amount Equivalance"
										name=""
										value={5}
										onChange={handleChange}
										metric="₦"
									/>
								</div>
							</div>
						</div>
						<div className="flex w-full items-start gap-x-2 rounded-md bg-white p-4">
							<RiCreativeCommonsNdLine className="size-5" />
							<div className="space-y-2">
								<p className="text-sm">Points per Completed Module</p>
								<p className="text-xs text-neutral-400">
									The number of points a student earns after successfully completing a learning module.
								</p>
								<div className="flex w-full items-center gap-x-1.5">
									<MetricInput
										label="Points"
										name="point_per_completed_module"
										value={values.point_per_completed_module}
										onChange={handleChange}
										metric="Pts"
									/>
									<MetricInput label="Modules" name="" value={1} onChange={handleChange} />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="space-y-3 bg-[#F6F8FA] p-3">
					<p className="text-xs text-neutral-400">REFERRAL SETTINGS</p>
					<div className="w-full space-y-2">
						<div className="flex w-full items-start gap-x-2 rounded-md bg-white p-4">
							<RiPercentLine className="size-5" />
							<div className="space-y-2">
								<p className="text-sm">Referral Percentage for Students</p>
								<p className="text-xs text-neutral-400">
									Define how much students when they refer new users. This is a flat rate across all
									students.
								</p>
								<div className="flex w-full items-center gap-x-1.5">
									<MetricInput
										label="Enter Percent"
										name="referral_percentage_for_students"
										value={values.referral_percentage_for_students}
										onChange={handleChange}
										metric="%"
									/>
								</div>
							</div>
						</div>
						<div className="flex w-full items-start gap-x-2 rounded-md bg-white p-4">
							<RiPercentLine className="size-5" />
							<div className="space-y-2">
								<p className="text-sm">Referral Percentage for Parents</p>
								<p className="text-xs text-neutral-400">
									Define how much parents when they refer new users. This is a flat rate across all parents.
								</p>
								<div className="flex w-full items-center gap-x-1.5">
									<MetricInput
										label="Enter Percent"
										name="referral_percentage_for_parents"
										value={values.referral_percentage_for_parents}
										onChange={handleChange}
										metric="%"
									/>
								</div>
							</div>
						</div>
						<div className="flex w-full items-start gap-x-2 rounded-md bg-white p-4">
							<RiPercentLine className="size-5" />
							<div className="space-y-2">
								<p className="text-sm">Referral Percentage for Marketers</p>
								<p className="text-xs text-neutral-400">
									Define how much marketers when they refer new users. This is a flat rate across all
									marketers.
								</p>
								<div className="flex w-full items-center gap-x-1.5">
									<MetricInput
										label="Enter Percent"
										name="referral_percentage_for_marketers"
										value={values.referral_percentage_for_marketers}
										onChange={handleChange}
										metric="%"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</TabPanel>
	);
};
