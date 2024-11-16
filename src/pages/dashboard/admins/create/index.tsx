import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useFormik } from "formik"
import { toast } from "sonner"
import React from "react"

import { CreateAdminMutation, GetRolesQuery } from "@/queries"
import { DashboardLayout } from "@/components/layout"
import { Seo, Spinner } from "@/components/shared"
import type { CreateAdminDto } from "@/queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createAdminSchema } from "@/schema"
import { queryClient } from "@/providers"
import type { HttpError } from "@/types"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

const initialValues: CreateAdminDto = {
	email: "",
	first_name: "",
	last_name: "",
	password: "",
	phone_number: "",
	role: "",
}

const Page = () => {
	const router = useRouter()

	const { data } = useQuery({
		queryFn: () => GetRolesQuery({ limit: 20, page: 1 }),
		queryKey: ["get-admin-roles"],
	})

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (payload: CreateAdminDto) => CreateAdminMutation(payload),
		mutationKey: ["create-admin"],
		onSuccess: () => {
			toast.success("Admin added successfully!")
			router.push("/dashboard/admins").then(() => {
				queryClient.invalidateQueries({ queryKey: ["get-admins"] })
			})
		},
		onError: ({ response }: HttpError) => {
			console.error(response)
			const { message } = response.data
			toast.error(message)
		},
	})

	const { errors, handleChange, handleSubmit, setFieldValue, values } = useFormik({
		initialValues,
		validationSchema: createAdminSchema,
		onSubmit: (values) => {
			mutateAsync(values)
		},
	})

	const roles = React.useMemo(() => {
		if (!data) return []
		return data.data.data
	}, [data])

	return (
		<>
			<Seo title="Create Admin" />
			<DashboardLayout>
				<div className="h-full w-full p-6">
					<form onSubmit={handleSubmit} className="flex max-w-[500px] flex-col gap-4">
						<Input
							label="First name"
							type="text"
							name="first_name"
							onChange={handleChange}
							placeholder="First name"
							error={errors.first_name}
						/>
						<Input
							label="Last name"
							type="text"
							name="last_name"
							onChange={handleChange}
							placeholder="Last name"
							error={errors.last_name}
						/>
						<Input
							label="Email"
							type="email"
							name="email"
							onChange={handleChange}
							placeholder="Email"
							error={errors.email}
						/>
						<Input
							label="Phone number"
							type="tel"
							name="phone_number"
							onChange={handleChange}
							placeholder="Phone number"
							error={errors.phone_number}
						/>
						<Input
							label="Password"
							type="password"
							name="password"
							onChange={handleChange}
							placeholder="xxxxxxxx"
							error={errors.password}
						/>
						<Select value={values.role} onValueChange={(value) => setFieldValue("role", value)}>
							<SelectTrigger className="capitalize">
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent className="capitalize">
								{roles.map((role) => (
									<SelectItem key={role.role_id} value={role.role_id}>
										{role.role_name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button type="submit" disabled={isPending}>
							{isPending ? <Spinner /> : "Add Admin"}
						</Button>
					</form>
				</div>
			</DashboardLayout>
		</>
	)
}

export default Page
