import { useFormik } from "formik";
import React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export const Attempts = () => {
	const { setFieldValue, values } = useFormik({
		initialValues: {
			attempt: "",
			frequency: "",
		},
		onSubmit: (values) => {
			console.log(values);
		},
	});

	return (
		<div className="flex h-10 items-center">
			<Select value={values.attempt} onValueChange={(value) => setFieldValue("attempt", value)}>
				<SelectTrigger className="w-[119px] rounded-r-none bg-neutral-200 text-xs">
					<SelectValue placeholder="Select attempts" />
				</SelectTrigger>
				<SelectContent>
					{[...Array(10)].map((_, index) => (
						<SelectItem className="text-xs" key={index} value={(index + 1).toString()}>
							{index + 1}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select value={values.frequency} onValueChange={(value) => setFieldValue("frequency", value)}>
				<SelectTrigger className="w-[119px] rounded-l-none text-xs">
					<SelectValue placeholder="Select frequuency" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem className="text-xs" value="never">
						Never
					</SelectItem>
					<SelectItem className="text-xs" value="daily">
						Every 24 hours
					</SelectItem>
					<SelectItem className="text-xs" value="weekly">
						Every week
					</SelectItem>
					<SelectItem className="text-xs" value="monthly">
						Every month
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
};

export const PassMark = () => {
	const { setFieldValue, values } = useFormik({
		initialValues: {
			passmark: "",
		},
		onSubmit: (values) => {
			console.log(values);
		},
	});

	return (
		<div className="h-10">
			<Select value={values.passmark} onValueChange={(value) => setFieldValue("passmark", value)}>
				<SelectTrigger className="w-[119px] bg-neutral-200 text-xs">
					<SelectValue placeholder="Select pass mark" />
				</SelectTrigger>
				<SelectContent>
					{[...Array(31)].map((_, index) => (
						<SelectItem className="text-xs" key={index} value={(index + 70).toString()}>
							{index + 70}%
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export const Timer = () => {
	const { setFieldValue, values } = useFormik({
		initialValues: {
			hours: "",
			minutes: "",
		},
		onSubmit: (values) => {
			console.log(values);
		},
	});

	return (
		<div className="flex h-10 items-center">
			<Select value={values.hours} onValueChange={(value) => setFieldValue("hours", value)}>
				<SelectTrigger className="w-[119px] rounded-r-none bg-neutral-200 text-xs">
					<SelectValue placeholder="Select hours" />
				</SelectTrigger>
				<SelectContent>
					{[...Array(6)].map((_, index) => (
						<SelectItem className="text-xs" key={index} value={(index * 1).toString()}>
							{index * 1} Hrs
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Select value={values.minutes} onValueChange={(value) => setFieldValue("minutes", value)}>
				<SelectTrigger className="w-[119px] rounded-l-none text-xs">
					<SelectValue placeholder="Select minutes" />
				</SelectTrigger>
				<SelectContent>
					{[...Array(12)].map((_, index) => (
						<SelectItem className="text-xs" key={index} value={(index * 5).toString()}>
							{index * 5} mins
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
