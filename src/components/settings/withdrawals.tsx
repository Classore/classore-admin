import { RiMoneyDollarCircleLine } from "@remixicon/react";
import React from "react";

import type { SettingConfig } from "@/types";
import { Switch } from "../ui/switch";
import { TabPanel } from "../shared";
import { Input } from "../ui/input";

interface Props {
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	setFieldValue: (field: keyof SettingConfig, value: string | number) => void;
	tab: string;
	values: SettingConfig;
}

export const Withdrawals = ({ handleChange, setFieldValue, tab, values }: Props) => {
	return (
		<TabPanel selected={tab} value="withdrawals">
			<div className="grid h-full w-full grid-cols-2 gap-x-2">
				<div className="space-y-3 bg-[#F6F8FA] p-3">
					<p className="text-sm text-neutral-400">WITHDRAWAL SETTINGS</p>
					<div className="w-full space-y-2">
						<div className="flex w-full items-start gap-x-2 rounded-md bg-white p-4">
							<RiMoneyDollarCircleLine className="size-5" />
							<div className="space-y-2">
								<p className="text-sm">Allow Withdrawals</p>
								<p className="text-xs text-neutral-400">Users can withdraw their earnings at any time.</p>
								<div className="flex w-full flex-col gap-y-4">
									<div className="flex items-center gap-x-4">
										<label htmlFor="allow_withdrawal" className="text-sm text-neutral-400">
											Allow Withdrawals
										</label>
										<Switch
											checked={values.allow_withdrawal === "YES"}
											onCheckedChange={() =>
												setFieldValue("allow_withdrawal", values.allow_withdrawal === "YES" ? "NO" : "YES")
											}
										/>
									</div>
									{values.allow_withdrawal === "YES" && (
										<>
											<div className="flex items-center gap-x-4">
												<label htmlFor="allow_withdrawal" className="text-sm text-neutral-400">
													Add withdrawal Limit
												</label>
												<Switch
													checked={values.limit_withdrawal === "YES"}
													onCheckedChange={() =>
														setFieldValue("limit_withdrawal", values.limit_withdrawal === "YES" ? "NO" : "YES")
													}
												/>
											</div>
											{values.limit_withdrawal && (
												<Input
													label="Withdrawal Limit"
													name="Withdrawal_limit"
													value={values.Withdrawal_limit}
													onChange={handleChange}
												/>
											)}
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</TabPanel>
	);
};
