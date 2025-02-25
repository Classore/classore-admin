import { RiSettings6Line } from "@remixicon/react";
import React from "react";

import { TEST_SETTINGS, type TestSettingAction } from "@/constants/test-settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export const TestSettings = () => {
	const handleAction = (action: TestSettingAction) => {
		switch (action) {
			case "ATTEMPTS":
				break;
			case "PASS_MARK":
				break;
			case "SHUFFLE":
				break;
			case "SKIP_QUESTIONS":
				break;
			case "TIMER":
				break;
			default:
				break;
		}
	};
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-fit" size="sm" variant="outline">
					<RiSettings6Line /> Test Settings
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[500px] p-1">
				<div className="w-full space-y-4 rounded-lg border p-4">
					<DialogTitle>Test Settings</DialogTitle>
					<DialogDescription hidden>Test Settings</DialogDescription>
					<hr />
					{TEST_SETTINGS.map(({ label, settings }) => (
						<div key={label} className="w-full space-y-3">
							<p className="text-xs uppercase text-neutral-400">{label}</p>
							{settings.map(({ action, description, icon: Icon, label }) => (
								<div key={label} className="flex h-[75px] w-full items-start gap-x-3 p-2">
									<div className="grid size-5 place-items-center">
										<Icon className="size-4" />
									</div>
									<div className="flex-1 space-y-2">
										<p className="text-sm capitalize">{label}</p>
										<p className="text-xs text-neutral-400">{description}</p>
									</div>
									<div className="w-8">
										<Switch onChange={() => handleAction(action)} />
									</div>
								</div>
							))}
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
};
