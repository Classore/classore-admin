import { RiArrowLeftSLine, RiLoader2Line } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import React from "react";

import { ForgotPasswordGraphic } from "@/assets/icons";
import AuthLayout from "@/components/layout/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Seo } from "@/components/shared";

const Page = () => {
	const router = useRouter();

	const { isPending } = useMutation({
		onSuccess: () => {
			toast.success("Your super admin has been notified of your request");
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const { errors, handleChange, handleSubmit, touched } = useFormik({
		initialValues: {
			email: "",
		},
		validateOnChange: true,
		validationSchema: Yup.object({
			email: Yup.string().email("Invalid email address").required("Required"),
		}),
		onSubmit: (values) => {
			console.log(values);
		},
	});

	return (
		<>
			<Seo title="Forgot Password" />
			<AuthLayout screen="forgot-password">
				<div className="flex max-w-96 flex-col justify-center gap-6 pt-20">
					<header className="flex flex-col gap-4">
						<ForgotPasswordGraphic />
						<Button onClick={() => router.back()} className="w-fit" size="sm" variant="outline">
							<RiArrowLeftSLine className="size-4" /> Back
						</Button>
						<h2 className="font-body text-2xl font-bold text-neutral-900">Forgot Password</h2>
					</header>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4 font-body font-normal">
						<Input
							type="email"
							label="Email Address"
							placeholder="name@email.com"
							className="col-span-full"
							name="email"
							onChange={handleChange}
							error={touched.email && errors.email ? errors.email : ""}
						/>
						<div className="mt-2 flex flex-col gap-2">
							<Button type="submit" disabled={isPending}>
								{isPending ? <RiLoader2Line /> : "Next"}
							</Button>
						</div>
					</form>
				</div>
			</AuthLayout>
		</>
	);
};

export default Page;
