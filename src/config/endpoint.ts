export const endpoints = (id?: string) => {
	const admins = {}

	const auth = {
		signin: "/admin/staff/login",
		create: "/admin/staff/create",
		create_role: `/admin/role/create`,
		get_roles: `/admin/role/fetch`,
		delete_entity: `/auth/delete-entity`,
	}

	const courses = {
		get_all: "/courses",
		get_one: `/courses/${id}`,
		create: "/courses",
		update: `/courses/${id}`,
		delete: `/courses/${id}`,
	}

	const payments = {}

	const subscriptions = {}

	const teachers = {}

	const users = {}

	const waitlist = {
		get: `/admin/waitlist/fetch`,
	}

	return { admins, auth, courses, payments, subscriptions, teachers, users, waitlist }
}
