export const endpoints = (id?: string) => {
	return {
		auth: {
			signin: "/admin/staff/login",
			create: "/admin/staff/create",
			create_role: `/admin/role/create`,
			get_roles: `/admin/role/fetch`,
			get_admins: `/admin/staff/fetch`,
			update_admin: `/admin/staff/update/${id}`,
			request_reset: "/admin/staff/password/reset-request",
			approve_reset: "/admin/staff/password/approve-reset-request",
			reset: "/admin/staff/password/reset",
			delete_entity: `/auth/delete-entity`,
		},
		calendar: {
			create: "",
			all: "",
			one: `${id}`,
			update: `${id}`,
			delete: `${id}`,
		},
		courses: {
			create_chapter: `/admin/learning/chapter/create-new/${id}`,
			create_questions: `/admin/learning/question/create-new/${id}`,
			all_chapters: "/admin/learning/chapter/fetch-all",
			all_questions: "/admin/learning/question/fetch-all",
		},
		payments: {
			all: "/admin/payment/get-all",
		},
		school: {
			create_exam: "/admin/examination/create-exam",
			create_exam_bundle: "/admin/examination/create-exam-bundle",
			create_class: "/admin/examination/create-class",
			create_subject: "/admin/examination/create-subject",
			get_exams: "/admin/examination/fetch-exams",
			get_exam_bundles: "/admin/examination/fetch-exam-bundles",
			get_exam_bundle: `/admin/examination/fetch-exam-bundle/${id}"`,
			get_classes: "/admin/examination/fetch-classes",
			get_subjects: "/admin/examination/fetch-subjects",
		},
		users: {
			all: "/admin/user/get-all",
			one: `/admin/user/view-one/${id}`,
		},
		waitlist: {
			get: `/admin/waitlist/fetch`,
		},
	};
};
