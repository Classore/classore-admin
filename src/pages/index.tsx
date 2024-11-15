import { useMutation } from "@tanstack/react-query"
import { useFormik } from "formik"
import React from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/shared"
import { Input } from "@/components/ui/input"
import { SignInMutation } from "@/queries"
import type { SignInDto } from "@/queries"

const initialValues: SignInDto = {
	email: "",
	password: "",
}

const Page = () => {
	const { isPending } = useMutation({
		mutationFn: SignInMutation,
		onSuccess: (data) => {
			console.log(data)
		},
		onError: (error) => {
			console.error(error)
		},
	})

	const { errors, handleChange, handleSubmit, isValid } = useFormik({
		initialValues,
		onSubmit: (values) => {
			console.log(values)
		},
	})

	return (
		<div className="grid h-screen w-screen grid-cols-5">
			<div className="col-span-2 grid h-full w-full place-items-center p-4">
				<div className="h-full w-full rounded-2xl bg-primary-400"></div>
			</div>
			<div className="col-span-3 grid h-full w-full place-items-center p-4">
				<div className="flex w-full max-w-[500px] flex-col gap-20 rounded-lg border bg-white p-8 shadow-lg">
					<div className="flex flex-col items-center gap-4">
						<h3 className="text-2xl font-semibold">Welcome Back</h3>
						<p className=""></p>
						<form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
							<Input
								label="Email"
								type="email"
								onChange={handleChange}
								placeholder="Email"
								error={errors.email}
							/>
							<Input
								label="Password"
								type="password"
								onChange={handleChange}
								placeholder="xxxxxxxx"
								error={errors.password}
							/>
							<Button type="submit" disabled={!isValid}>
								{isPending ? <Spinner /> : "Sign In"}
							</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Page
