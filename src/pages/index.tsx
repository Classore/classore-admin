import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useFormik } from "formik"
import { toast } from "sonner"
import React from "react"

import { Seo, Spinner } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/z-store"
import { Input } from "@/components/ui/input"
import type { SignInDto } from "@/queries"
import { SignInMutation } from "@/queries"
import type { HttpError } from "@/types"
import { signinSchema } from "@/schema"

const initialValues: SignInDto = {
	email: "",
	password: "",
}

const Page = () => {
	const { signIn } = useUserStore()
	const router = useRouter()

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (payload: SignInDto) => SignInMutation(payload),
		onSuccess: (data) => {
			const { data: user } = data
			signIn(user, user.access_token)
			router.push("/dashboard")
		},
		onError: ({ response }: HttpError) => {
			console.error(response)
			const { message } = response.data
			toast.error(message)
		},
	})

	const { errors, handleChange, handleSubmit } = useFormik({
		initialValues,
		validationSchema: signinSchema,
		onSubmit: (values) => {
			mutateAsync(values)
		},
	})

	return (
		<>
			<Seo title="Welcome back" />
			<div className="grid h-screen w-screen grid-cols-2">
				<div className="grid h-full w-full place-items-center p-4">
					<div className="h-full w-full rounded-2xl bg-primary-400"></div>
				</div>
				<div className="grid h-full w-full place-items-center p-4">
					<div className="flex w-full max-w-[500px] flex-col gap-20 rounded-lg border bg-white p-8 shadow-lg">
						<div className="flex flex-col items-center gap-4">
							<h3 className="text-3xl font-semibold">Welcome Back</h3>
							<p className="text-neutral-400">Please enter your credentials to continue</p>
						</div>
						<form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
							<Input
								label="Email"
								type="email"
								name="email"
								onChange={handleChange}
								placeholder="Email"
								error={errors.email}
							/>
							<Input
								label="Password"
								type="password"
								name="password"
								onChange={handleChange}
								placeholder="xxxxxxxx"
								error={errors.password}
							/>
							<Button type="submit" disabled={isPending}>
								{isPending ? <Spinner /> : "Sign In"}
							</Button>
						</form>
					</div>
				</div>
			</div>
		</>
	)
}

export default Page
