import type { PeriodProps } from "@/queries";

type Period = {
	period: PeriodProps;
	label: string;
};

export const periods: Period[] = [
	{ label: "Last 7 days", period: "LAST_7_DAYS" },
	{ label: "Last 30 days", period: "THIS_MONTH" },
	{ label: "Last 6 months", period: "LAST_6_MONTHS" },
	{ label: "Last 12 months", period: "LAST_12_MONTHS" },
	{ label: "Last 24 months", period: "LAST_2_YEARS" },
];
