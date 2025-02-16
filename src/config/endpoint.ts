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
			create: "/admin/calendar/events/new",
			all: "/admin/calendar/events/get-all",
			one: `${id}`,
			update: `${id}`,
			delete: `${id}`,
		},
		payments: {
			all: "/admin/payment/get-all",
			one: `/admin/payment/view-one/${id}`,
		},
		school: {
			create_exam: "/admin/examination/create-exam",
			create_exam_bundle: "/admin/examination/create-exam-bundle",
			create_class: "/admin/examination/create-class",
			create_subject: "/admin/examination/create-subject",
			create_chapter: `/admin/learning/chapter/create-new/${id}`,
			create_chapter_module: `/admin/learning/chapter-module/create-new/${id}`,
			create_questions: `/admin/learning/question/create-new/${id}`,
			get_exams: "/admin/examination/fetch-exams",
			get_exam_bundles: "/admin/examination/fetch-exam-bundles",
			get_exam_bundle: `/admin/examination/view-an-exam-bundle/${id}`,
			get_classes: "/admin/examination/fetch-classes",
			get_subjects: "/admin/examination/fetch-subjects",
			get_subject: `/admin/examination/view-a-subject/${id}`,
			get_chapters: "/admin/learning/chapter/fetch-all",
			get_chapter_modules: "/admin/learning/chapter-modules/fetch-all",
			get_questions: "/admin/learning/question/fetch-all",
			update_exam: `${id}`,
			update_exam_bundle: `${id}`,
			update_class: `${id}`,
			update_subject: `${id}`,
			update_chapter: `${id}`,
			update_chapter_module: `admin/learning/chapter-module/update-one/${id}`,
			update_question: `${id}`,
			delete: "/admin/learning/delete-entities",
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
