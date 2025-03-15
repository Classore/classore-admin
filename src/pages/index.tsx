import { RiLoader2Line } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { AuthGraphic } from "@/assets/icons";
import AuthLayout from "@/components/layout/auth";
import { Seo } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SignInDto } from "@/queries";
import { SignInMutation } from "@/queries";
import { signinSchema } from "@/schema";
import { useUserStore } from "@/store/z-store";
import type { HttpError } from "@/types";

const initialValues: SignInDto = {
	email: "",
	password: "",
};

const Page = () => {
	const { signIn } = useUserStore();
	const router = useRouter();

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (payload: SignInDto) => SignInMutation(payload),
		onSuccess: (data) => {
			const { data: user } = data;
			signIn(user, user.access_token);
			toast.success("Logged in successfully");
			router.push("/dashboard");
		},
		onError: ({ response }: HttpError) => {
			console.error(response);
			const { message } = response.data;
			toast.error(message);
		},
	});

	const { errors, handleChange, handleSubmit, touched } = useFormik({
		initialValues,
		validationSchema: signinSchema,
		onSubmit: (values) => {
			mutateAsync(values);
		},
	});

	return (
		<>
			<Seo title="Welcome back" />
			<AuthLayout screen="signin">
				<div className="flex max-w-96 flex-col justify-center gap-6 pt-20">
					<header className="flex flex-col gap-4">
						<AuthGraphic />
						<h2 className="font-body text-2xl font-bold text-neutral-900">Welcome Back</h2>
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
						<div className="flex flex-col gap-4">
							<Input
								type="password"
								label="Password"
								placeholder="***************"
								className="col-span-full"
								name="password"
								onChange={handleChange}
								error={touched.password && errors.password ? errors.password : ""}
							/>
							<div className="flex items-center justify-between gap-1 text-sm">
								<label className="col-span-full flex items-center gap-3 font-normal">
									<input
										type="checkbox"
										name="agree"
										id="agree"
										className="size-5 rounded border border-neutral-200 text-primary-300"
									/>
									<p className="text-neutral-500">Remember me</p>
								</label>
								<Link href="/forgot-password" className="text-secondary-300 hover:underline">
									Forgot Password ?
								</Link>
							</div>
						</div>
						<div className="mt-2 flex flex-col gap-2">
							<Button type="submit" disabled={isPending}>
								{isPending ? <RiLoader2Line /> : "Sign In"}
							</Button>
						</div>
					</form>
				</div>
			</AuthLayout>
		</>
	);
};

export default Page;
