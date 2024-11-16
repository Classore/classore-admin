import * as Yup from "yup"

export const createAdminSchema = Yup.object({
	email: Yup.string().email("Please enter a valid email!").required("Your email is required!"),
	first_name: Yup.string().required("First name is required!"),
	last_name: Yup.string().required("Last name is required!"),
	password: Yup.string()
		.required("Password is required!")
		.matches(
			/^(?=.*[A-Z])(?=.*[\W])(?=.*[0-9])(?=.*[a-z]).{8,20}$/,
			"Password must be at least 8 characters and contain at least one uppercase, lowercase, number and special character!"
		),
	phone_number: Yup.string().required("Phone number is required!"),
	role: Yup.string().required("Role is required!"),
})

export const signinSchema = Yup.object({
	email: Yup.string().email("Please enter a valid email!").required("Your email is required!"),
	password: Yup.string()
		.required("Password is required!")
		.matches(
			/^(?=.*[A-Z])(?=.*[\W])(?=.*[0-9])(?=.*[a-z]).{8,20}$/,
			"Password must be at least 8 characters and contain at least one uppercase, lowercase, number and special character!"
		),
})
