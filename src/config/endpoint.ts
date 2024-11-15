export const endpoints = (id?: string) => {
	const admins = {}

	const auth = {
		signin: "/auth/signin",
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
		join: `/mail/join-waitlist`,
		get: `/mail/fetch-waitlist`,
	}

	return { admins, auth, courses, payments, subscriptions, teachers, users, waitlist }
}
