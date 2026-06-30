export const PATH = {
	AUTH: {
		ADMIN_LOGIN: {
			ROOT: "/auth/admin-login",
		},
		LOGIN: {
			ROOT: "/auth/login",
		},
		REGISTER: {
			ROOT: "/auth/register",
		},
		VERIFY_OTP: {
			ROOT: "/auth/verify-otp",
		},
		FORGOT_OTP: {
			ROOT: "/auth/forgot-otp",
		},
	},
	DASHBOARD: {
		ROOT: "/dashboard",
	},
	COURSE_MANAGEMENT: {
		ROOT: "/course-management",
		COURSES: {
			ROOT: "/courses",
			CREATE_COURSE: {
				ROOT: "/courses/create-course",
			},
			EDIT_COURSE: {
				ROOT: (id?: number) =>
					id ? `/courses/${id}` : "/courses/:id",
				OVERVIEW: {
					ROOT: (id?: number) =>
						id ? `/courses/${id}/overview` : "/courses/:id/overview"
				},
				CURRICULUM: {
					ROOT: (id?: number) =>
						id ? `/courses/${id}/curriculum` : "/courses/:id/curriculum"
				},
				PLAYLIST: {
					ROOT: (id?: number, type?: string) => id && type ? `/courses/${id}/${type}/playlist` : "/courses/:id/:type/playlist",
					VIEW_PLAYLIST: {
						ROOT: (id?: number, type?: string, playlistId?: number) =>
							id && playlistId ? `/courses/${id}/${type}/playlist/${playlistId}` : "/courses/:id/:type/playlist/:playlistId"
					}
				},
				VIDEOS: {
					ROOT: (id?: number) =>
						id ? `/courses/${id}/videos` : "/courses/:id/videos"
				},

				NOTES: {
					ROOT: (id?: number) =>
						id ? `/courses/${id}/notes` : "/courses/:id/notes"
				},

				TEST: {
					ROOT: (id?: number) =>
						id ? `/courses/${id}/test` : "/courses/:id/test",
					TEST_CATEGORY: {
						ROOT: (id?: number, test_category_id?: number) => id && test_category_id ? `/courses/${id}/test/test-category/${test_category_id}` : "/courses/:id/test/test-category/:test_category_id",
					}
				},

				AUDIOS: {
					ROOT: (id?: number) =>
						id ? `/courses/${id}/audios` : "/courses/:id/audios"
				}
			},
			ANALYTICS: {
				ROOT: (id?: number) =>
					id ? `/courses/${id}/analytics` : "/courses/:id/analytics",
			}
		},
		LIVE_CLASSES: {
			ROOT: "/live-classes",
			CREATE_LIVE_CLASS: {
				ROOT: "/live-classes/create-live-class",
			},
			EDIT_LIVE_CLASS: {
				ROOT: (id?: number) =>
					id ? `/live-classes/${id}` : "/live-classes/:id",
			},
		},
		QUIZ: {
			ROOT: "/quiz",
			CREATE_QUIZ: {
				ROOT: "/quiz/create-quiz",
			},
			EDIT_QUIZ: {
				ROOT: (id?: string) =>
					id ? `/quiz/${id}` : "/quiz/:id",
			},
		},
	},
	SET: {
		ROOT: "/sets",
		CREATE_SET: {
			ROOT: "/sets/create-set",
		},
		EDIT_SET: {
			ROOT: (id?: number) =>
				id ? `/sets/${id}` : "/sets/:id",
		},
		VIEW_SET: {
			ROOT: (id?: number) =>
				id ? `/sets/${id}` : "/sets/:id",
		},
	},
	OMR: {
		ROOT: "/omr",
		CREATE_OMR: {
			ROOT: "/omr/create-omr",
		},
		FORMAT: {
			ROOT: "/omr/format",
			CREATE: {
				ROOT: "/omr/format/create",
			},
			EDIT: {
				ROOT: (id?: number) => id ? `/omr/format/${id}` : "/omr/format/:id",
			},
		},
	},
	CATEGORY_LEVEL_MANAGEMENT: {
		ROOT: "/category-level-management",
		CATEGORY: {
			ROOT: "/category"
		},
		LEVEL_POSITION: {
			ROOT: "/position"
		},
	},
	ENROLLMENT: {
		ROOT: "/enrollment",
		TEST_ANALYTICS: {
			ROOT: (id?: number) =>
				id ? `/enrollment/test/${id}/analytics` : "/enrollment/test/:id/analytics",
		},
		BUNDLE_ANALYTICS: {
			ROOT: (id?: number) =>
				id ? `/enrollment/bundle/${id}/analytics` : "/enrollment/bundle/:id/analytics",
		},
	},
	ROLES: {
		ROOT: "/role-management",
		CREATE_ROLE: {
			ROOT: "/role-management/create-role",
		},
		EDIT_ROLE: {
			ROOT: (id?: string) =>
				id ? `/role-management/${id}` : "/role-management/:id",
		},
	},
	USER_MANAGEMENT: {
		ROOT: "/user-management",
		CREATE_USER: {
			ROOT: "/user-management/create-user",
		},
		EDIT_USER: {
			ROOT: (id?: string) =>
				id ? `/user-management/${id}` : "/user-management/:id",
		},
		VIEW_USER: {
			ROOT: (id?: string) =>
				id ? `/user-management/${id}/view` : "/user-management/:id/view",
			PROFILE: {
				ROOT: (id?: string) =>
					id ? `/user-management/${id}/view/profile` : "/user-management/:id/view/profile",
			},
			COURSES: {
				ROOT: (id?: string) =>
					id ? `/user-management/${id}/view/courses` : "/user-management/:id/view/courses",
			},
			TRANSACTIONS: {
				ROOT: (id?: string) =>
					id ? `/user-management/${id}/view/transactions` : "/user-management/:id/view/transactions",
			},
			DEVICE_REQUESTS: {
				ROOT: (id?: string) =>
					id ? `/user-management/${id}/view/device-requests` : "/user-management/:id/view/device-requests",
			},
			PERFORMANCE: {
				ROOT: (id?: string) =>
					id ? `/user-management/${id}/view/performance` : "/user-management/:id/view/performance",
			},
			LOGIN_HISTORY: {
				ROOT: (id?: string) =>
					id ? `/user-management/${id}/view/login-history` : "/user-management/:id/view/login-history",
			},
			ACTIVITY_HISTORY: {
				ROOT: (id?: string) =>
					id ? `/user-management/${id}/view/activity-history` : "/user-management/:id/view/activity-history",
			},
			REFERRALS: {
				ROOT: (id?: string) =>
					id ? `/user-management/${id}/view/referrals` : "/user-management/:id/view/referrals",
			},
		},
	},
	TEST_QUESTION_MANAGEMENT: {
		ROOT: "/test-question-management/",
		QUESTIONS: {
			ROOT: "/questions",
		},
		QUESTION_LABELS: {
			ROOT: "/question-labels",
			DETAIL: {
				ROOT: (id?: number) =>
					id ? `/question-labels/${id}` : "/question-labels/:id",
			},
		},
		TEST: {
			ROOT: "/test",
			CREATE_TEST: {
				ROOT: "/test/create-test",
			},
			EDIT_TEST: {
				ROOT: (id?: number) =>
					id ? `/test/${id}` : "/test/:id",
			},
			VIEW_TEST: {
				ROOT: (id?: number) =>
					id ? `/test/${id}/view` : "/test/:id/view",
			},
			CHECK_PAPER: {
				ROOT: (id?: number, resultId?: number) =>
					id && resultId ? `/test/${id}/check-paper/${resultId}` : "/test/:id/check-paper/:resultId",
				CHECK_SUBJECTIVE_QUESTION: {
					ROOT: (id?: number, resultId?: number, questionId?: number) =>
						id && resultId ? `/test/${id}/check-paper/${resultId}/question/${questionId}` : "/test/:id/check-paper/:resultId/question/:questionId"
				}
			},
			INDIVIDUAL_TEST: {
				ROOT: "/test/individual"
			},
			TEST_CATEGORY: {
				ROOT: "/test/category",
				CREATE_TEST_CATEGORY: {
					ROOT: "/test/category/create-test-category"
				},
				EDIT_TEST_CATEGORY: {
					ROOT: (id?: number) => id ? `test/category/${id}/edit` : "/test/category/:id/edit"
				},
				VIEW_TEST_CATEGORY: {
					ROOT: (id?: number) => id ? `test/category/${id}/view` : "/test/category/:id/view"
				}
			}
		}
	},
	SUBSCRIPTION_PLAN_MANAGEMENT: {
		ROOT: "/subscription-management"
	},
	REFERRAL_POINTS: {
		ROOT: "/referral-points",
		REFERRALS: { ROOT: "/referral-points/referrals" },
		TRANSACTIONS: { ROOT: "/referral-points/transactions" },
	},
	MARKETING_LINKS: {
		ROOT: "/marketing-links",
		DETAIL: {
			ROOT: (id?: number) => id ? `/marketing-links/${id}` : "/marketing-links/:id",
		},
	},
	COUPON_CODES: {
		ROOT: "/coupon-codes",
	},
	TRANSACTION_MANAGEMENT: {
		ROOT: "/transaction-management"
	},
	NOTIFICATION_MANAGEMENT: {
		ROOT: "/notification-management",
		CREATE_NOTIFICATION: {
			ROOT: "/notification-management/create",
		},
		EDIT_NOTIFICATION: {
			ROOT: (id?: number) =>
				id ? `/notification-management/${id}` : "/notification-management/:id",
		},
		VIEW_NOTIFICATION: {
			ROOT: (id?: number) =>
				id ? `/notification-management/${id}/view` : "/notification-management/:id/view",
		},
	},
	GORKHAPATRA: {
		ROOT: "/gorkhapatra",
		CREATE_GORKHAPATRA: {
			ROOT: "/gorkhapatra/create"
		},
		EDIT_GORKHAPATRA: {
			ROOT: (id?: number) =>
				id ? `/gorkhapatra/${id}/edit` : "/gorkhapatra/:id/edit",
		},
	},
	CONTENT_MANAGEMENT: {
		ROOT: "/content-management",
		SPLASH_SCREEN: {
			ROOT: "/content-management/splash-screen"
		},
		ONBOARDING_SCREEN: {
			ROOT: "/content-management/onboarding-screen"
		},
		HOME_SCREEN: {
			ROOT: "/content-management/home-screen",
			WELCOME_POPUP: {
				ROOT: "/content-management/home-screen/welcome-popup"
			},
			BANNER: {
				ROOT: "/content-management/home-screen/banner"
			},
			FEATURED_COURSE: {
				ROOT: "/content-management/home-screen/featured-course"
			}
		},
		PAGES: {
			ROOT: "/content-management/pages",
			CREATE_PAGE: {
				ROOT: "/content-management/pages/create"
			},
			EDIT_PAGE: {
				ROOT: (id?: string) => id ? `/content-management/pages/${id}` : `/content-management/pages/:id`
			}
		}
	},
	SETTINGS: {
		ROOT: "/settings",
		SYSTEM: {
			ROOT: "/settings/system",
			PROFILE: {
				ROOT: "/settings/system/profile"
			},
			CHANGE_PASSWORD: {
				ROOT: "/settings/system/change-password"
			},
			SITE_INFO: {
				ROOT: "/settings/system/site-info"
			},
			SMTP: {
				ROOT: "/settings/system/smtp"
			},
			GENERAL: {
				ROOT: "/settings/system/general"
			},
			LINKED_DEVICE: {
				ROOT: "/settings/system/linked-devices"
			},
			EMAIL_TEMPLATES: {
				ROOT: "/settings/system/email-templates"
			},
			COURSE_SETTING: {
				ROOT: "/settings/system/course-setting"
			},
			LOGIN_TYPE: {
				ROOT: "/settings/system/login-type"
			},
			CONTROLS: {
				ROOT: "/settings/system/controls"
			},
			REFERRAL_CONFIG: {
				ROOT: "/settings/system/referral-config"
			},
		},
		API: {
			ROOT: "/settings/api",
			ZOOM: {
				ROOT: "/settings/api/zoom"
			},
			ESEWA: {
				ROOT: "/settings/api/esewa"
			},
			KHALTI: {
				ROOT: "/settings/api/khalti"
			},
			SMS_GATEWAY: {
				ROOT: "/settings/api/sms-gateway"
			},
		},
	},
	ACTIVITY_LOG: {
		ROOT: "/activity-log",
		ARCHIVED: {
			ROOT: "/activity-log/archived"
		}
	},
	MEDIA_MANAGEMENT: {
		ROOT: "/medias"
	},
	DISCUSSION: {
		ROOT: "/discussions",
		CREATE: {
			ROOT: "/discussions/create",
		},
		DETAIL: {
			ROOT: (id?: number) => id ? `/discussions/${id}` : "/discussions/:id",
		},
		EDIT: {
			ROOT: (id?: number) => id ? `/discussions/${id}/edit` : "/discussions/:id/edit",
		},
	},
	MODERATION: {
		ROOT: "/moderation",
	},
	DEVICE_RESET: {
		ROOT: "/device-reset",
		DETAIL: {
			ROOT: (id?: number) => id ? `/device-reset/${id}` : "/device-reset/:userId",
		},
	},
	TICKET: {
		ROOT: "/tickets",
		ALL_TICKETS: {
			ROOT: "/tickets/all-tickets",
		},
		CHATS: {
			ROOT: "/tickets/chats",
		},
		CHAT_DETAIL: {
			ROOT: (id?: number) => id ? `/tickets/chats/${id}` : "/tickets/chats/:ticketId",
		},
		TICKET_TYPES: {
			ROOT: "/tickets/ticket-types",
		},
	},
};
