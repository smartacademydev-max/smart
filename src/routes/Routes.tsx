import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Pages & Layouts
import App from "../App";
import CategoryManagementRoot from "../components/pages/CategoryManagement";
import AllCategories from "../components/pages/CategoryManagement/allCategory";

import ActivityRoot from "../components/pages/ActivityLog";
import ArchivedLogs from "../components/pages/ActivityLog/ArchivedLogs";
import ContentManagementRoot from "../components/pages/ContentManagement";
import HomeScreens from "../components/pages/ContentManagement/HomeScreens";
import BannerRoot from "../components/pages/ContentManagement/HomeScreens/Banner";
import FeaturedCourseRoot from "../components/pages/ContentManagement/HomeScreens/FeaturedCourse";
import WelcomePopupRoot from "../components/pages/ContentManagement/HomeScreens/WelcomePopup";
import OnBoardingScreenRoot from "../components/pages/ContentManagement/OnBoardingScreen";
import PagesRoot from "../components/pages/ContentManagement/Pages";
import PageCreationForm from "../components/pages/ContentManagement/Pages/PageCreationForm";
import SplashScreenRoot from "../components/pages/ContentManagement/SplashScreen";
import ControlsRoot from "../components/pages/Controls";
import CouponCodesPage from "../components/pages/CouponCodes";
import CourseManagementRoot from "../components/pages/CourseManagement/Course";
import AllCourse from "../components/pages/CourseManagement/Course/allCourse";
import CourseAnalyticsRootLayout from "../components/pages/CourseManagement/Course/analytics";
import CreateCourseRoot from "../components/pages/CourseManagement/Course/createCourse";
import CourseMedia from "../components/pages/CourseManagement/Course/createCourse/CourseMedia";
import CourseCurriculumForm from "../components/pages/CourseManagement/Course/createCourse/CourseSubFields/Curriculum";
import PlaylistDetailPage from "../components/pages/CourseManagement/Course/createCourse/CourseSubFields/PlaylistDetail";
import CourseTest from "../components/pages/CourseManagement/Course/createCourse/CourseSubFields/Test";
import LiveClassRoot from "../components/pages/CourseManagement/LiveClass";
import AllLiveClass from "../components/pages/CourseManagement/LiveClass/allLiveClass";
import CreateLiveClassRoot from "../components/pages/CourseManagement/LiveClass/createLiveClass";
import SetRoot from "../components/pages/CourseManagement/Sets";
import AllSets from "../components/pages/CourseManagement/Sets/AllSets";
import CreateSet from "../components/pages/CourseManagement/Sets/CreateSet";
import QuizManagementRoot from "../components/pages/CourseManagement/quiz";
import AllQuizes from "../components/pages/CourseManagement/quiz/allQuiz";
import DeviceResetManagementRoot from "../components/pages/DeviceResetManagement";
import DeviceResetDetailPage from "../components/pages/DeviceResetManagement/DeviceResetDetailPage";
import DiscussionManagementRoot from "../components/pages/DiscussionManagement";
import DiscussionDetail from "../components/pages/DiscussionManagement/DiscussionDetail";
import DiscussionForm from "../components/pages/DiscussionManagement/DiscussionForm";
import AllDiscussions from "../components/pages/DiscussionManagement/allDiscussions";
import EnrollmentRoot from "../components/pages/Enrollments";
import AllEntrollments from "../components/pages/Enrollments/AllEnrollments";
import BundleEnrollmentPage from "../components/pages/Enrollments/BundleEnrollment";
import TestEnrollmentPage from "../components/pages/Enrollments/TestEnrollment";
import GorkhapatraRoot from "../components/pages/Gorkhapatra";
import AllGorkhapatraRoot from "../components/pages/Gorkhapatra/allGorkhapatra";
import CreateGorkhapatraRoot from "../components/pages/Gorkhapatra/createGorkhapatra";
import AllMarketingLinksPage from "../components/pages/MarketingLinks";
import MarketingLinkDetailPage from "../components/pages/MarketingLinks/Detail";
import MediaManagementRoot from "../components/pages/MediaManagement";
import AllMediaRoot from "../components/pages/MediaManagement/allMedia";
import ModerationManagementRoot from "../components/pages/ModerationManagement";
import WordModeration from "../components/pages/ModerationManagement/WordModeration";
import NotificationRoot from "../components/pages/NotificationManagement";
import AllNotificationsRoot from "../components/pages/NotificationManagement/allNotification";
import CreateNotificationRoot from "../components/pages/NotificationManagement/createNotification";
import NotificationDetail from "../components/pages/NotificationManagement/detail/NotificationDetail";
import ReferralPointsRoot from "../components/pages/ReferralPoints";
import AllReferralsPage from "../components/pages/ReferralPoints/AllReferrals";
import PointsTransactionsPage from "../components/pages/ReferralPoints/PointsTransactions";
import RoleManagementRoot from "../components/pages/RoleManagement";
import AllRoles from "../components/pages/RoleManagement/allRoles";
import CreateRoleRoot from "../components/pages/RoleManagement/createRole";
import SettingRoot from "../components/pages/Setting";
import EsewaSettingRoot from "../components/pages/Setting/ApiSetting/Esewa";
import KhaltiSettingRoot from "../components/pages/Setting/ApiSetting/Khalti";
import SmsGatewayRoot from "../components/pages/Setting/ApiSetting/SmsGateway";
import ZoomSettingRoot from "../components/pages/Setting/ApiSetting/Zoom";
import AppSettingRoot from "../components/pages/Setting/AppSetting";
import ChangePassword from "../components/pages/Setting/ChangePassword";
import CourseSettingRoot from "../components/pages/Setting/CourseSetting";
import EmailTemplatesRoot from "../components/pages/Setting/EmailTemplates";
import LinkedDevices from "../components/pages/Setting/LinkedDevices";
import LoginTypeRoot from "../components/pages/Setting/LoginType";
import ProfilePageRoot from "../components/pages/Setting/Profile";
import ReferralConfigPage from "../components/pages/Setting/ReferralConfig";
import SiteInfoRoot from "../components/pages/Setting/SiteInfo";
import SmtpSettingRoot from "../components/pages/Setting/Smtp";
import SubscriptionManagementRoot from "../components/pages/SubscriptionManagement";
import TestAndQuestionManagementRoot from "../components/pages/TestAndQuestionManagement";
import OmrSheetRoot from "../components/pages/TestAndQuestionManagement/OmrSheets";
import OmrFormatForm from "../components/pages/TestAndQuestionManagement/OmrSheets/OmrFormatForm";
import AllOmrSheets from "../components/pages/TestAndQuestionManagement/OmrSheets/allOmr";
import AllOmrFormats from "../components/pages/TestAndQuestionManagement/OmrSheets/allOmrFormat";
import QuestionLabelsRoot from "../components/pages/TestAndQuestionManagement/QuestionLabels";
import QuestionLabelDetail from "../components/pages/TestAndQuestionManagement/QuestionLabels/detail";
import QuestionManagementRoot from "../components/pages/TestAndQuestionManagement/QuestionManagement";
import TestManagementRoot from "../components/pages/TestAndQuestionManagement/TestManagement";
import AllIndividualTestListing from "../components/pages/TestAndQuestionManagement/TestManagement/allIndividualTest";
import SingleStudentSingleQuestion from "../components/pages/TestAndQuestionManagement/TestManagement/checkSinlgeQuestion";
import QuestionAnswerLisitingLayout from "../components/pages/TestAndQuestionManagement/TestManagement/checkTest/Layout";
import SingleStudentAnswerLayout from "../components/pages/TestAndQuestionManagement/TestManagement/checkTest/SingleStudentAnswerLayout";
import CreatTestRoot from "../components/pages/TestAndQuestionManagement/TestManagement/createTest";
import ResultRoot from "../components/pages/TestAndQuestionManagement/TestManagement/result";
import ViewTestRoot from "../components/pages/TestAndQuestionManagement/TestManagement/viewTest";
import TicketManagementRoot from "../components/pages/TicketManagement";
import TicketTypes from "../components/pages/TicketManagement/TicketTypes";
import AllTickets from "../components/pages/TicketManagement/allTickets";
import TicketChats from "../components/pages/TicketManagement/chats";
import TicketChatPage from "../components/pages/TicketManagement/chats/TicketChatPage";
import TransactionManagementRoot from "../components/pages/TransactionManagement";
import AllTransactionRoot from "../components/pages/TransactionManagement/allTransation";
import AuthRoot from "../components/pages/auth";
import Login from "../components/pages/auth/login";
import NotFound from "../components/pages/layout/NotFound";
import SingleFormAuthLayout from "../components/pages/layout/SingleFormAuthLayout";
import AllPositions from "../components/pages/positionManagement/allPositions";
import UserManagementRoot from "../components/pages/userManagement";
import AllUsers from "../components/pages/userManagement/allUsers";
import CreateUser from "../components/pages/userManagement/createUser";
import ViewUserRoot from "../components/pages/userManagement/viewUser";
import UserActivityHistory from "../components/pages/userManagement/viewUser/UserActivityHistory";
import UserLoginHistory from "../components/pages/userManagement/viewUser/UserLoginHistory";
import CoursesTab from "../components/pages/userManagement/viewUser/tabs/CoursesTab";
import DeviceRequestsTab from "../components/pages/userManagement/viewUser/tabs/DeviceRequestsTab";
import PerformanceTab from "../components/pages/userManagement/viewUser/tabs/PerformanceTab";
import ProfileTab from "../components/pages/userManagement/viewUser/tabs/ProfileTab";
import ReferralsTab from "../components/pages/userManagement/viewUser/tabs/ReferralsTab";
import TransactionsTab from "../components/pages/userManagement/viewUser/tabs/TransactionsTab";
import { PATH } from "./PATH";
import Private from "./Private";
import Unauthorized from "./Unauthorized";

const router = createBrowserRouter([
	{
		element: <AuthRoot />,
		children: [
			{
				path: PATH.AUTH.LOGIN.ROOT,
				element: (
					<SingleFormAuthLayout>
						<Login requirePassword={true} />
					</SingleFormAuthLayout>
				),
			},

		],
	},

	// 🔒 PRIVATE MODULE
	{
		element: <Private />,
		children: [
			{
				index: true,
				path: "/",
				element: <App />,
			},
			{
				path: PATH.DASHBOARD.ROOT,
				element: <App />,
			},
			{
				element: <Unauthorized permissions={["add_courses", "edit_courses", "delete_courses", "view_courses"]}><CourseManagementRoot /></Unauthorized>,
				children: [
					{ path: PATH.COURSE_MANAGEMENT.COURSES.ROOT, element: <AllCourse /> },
					{ path: PATH.COURSE_MANAGEMENT.COURSES.CREATE_COURSE.ROOT, element: <CreateCourseRoot /> },
					{
						path: PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.ROOT(), element: <CreateCourseRoot />,
						children: [
							{ path: PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.CURRICULUM.ROOT(), element: <CourseCurriculumForm /> },
							{ path: PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.PLAYLIST.ROOT(), element: <CourseMedia /> },
							{ path: PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.PLAYLIST.VIEW_PLAYLIST.ROOT(), element: <PlaylistDetailPage /> },
							{ path: PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.TEST.ROOT(), element: <CourseTest /> },
						]
					},
					{ path: PATH.COURSE_MANAGEMENT.COURSES.ANALYTICS.ROOT(), element: <CourseAnalyticsRootLayout /> },
				],
			},
			{
				element: <Unauthorized permissions={["add_enrollments", "edit_enrollments", "delete_enrollments", "view_enrollments"]} >
					<EnrollmentRoot />
				</Unauthorized>,
				children: [
					{ path: "/enrollment", element: <AllEntrollments /> },
					{ path: PATH.ENROLLMENT.TEST_ANALYTICS.ROOT(), element: <TestEnrollmentPage /> },
					{ path: PATH.ENROLLMENT.BUNDLE_ANALYTICS.ROOT(), element: <BundleEnrollmentPage /> },
				]
			},
			{
				element: <Unauthorized permissions={["add_live_classes", "edit_live_classes", "delete_live_classes", "view_live_classes"]}> <LiveClassRoot /></Unauthorized>,
				children: [
					{ path: PATH.COURSE_MANAGEMENT.LIVE_CLASSES.ROOT, element: <AllLiveClass /> },
					{ path: PATH.COURSE_MANAGEMENT.LIVE_CLASSES.CREATE_LIVE_CLASS.ROOT, element: <CreateLiveClassRoot /> },
					{
						path: PATH.COURSE_MANAGEMENT.LIVE_CLASSES.EDIT_LIVE_CLASS.ROOT(),
						element: <CreateLiveClassRoot />,

					},
				],
			},
			{
				element: <Unauthorized permissions={["add_omr_sheets", "edit_omr_sheets", "delete_omr_sheets", "view_omr_sheets"]}><OmrSheetRoot /></Unauthorized>,
				children: [
					{ path: PATH.OMR.ROOT, element: <AllOmrSheets /> },
					{ path: PATH.OMR.FORMAT.ROOT, element: <AllOmrFormats /> },
					{ path: PATH.OMR.FORMAT.CREATE.ROOT, element: <OmrFormatForm /> },
					{ path: PATH.OMR.FORMAT.EDIT.ROOT(), element: <OmrFormatForm /> },
				],
			},
			{
				element: <Unauthorized permissions={["add_bundles", "edit_bundles", "delete_bundles", "view_bundles"]}><SetRoot /></Unauthorized>,
				children: [
					{ path: PATH.SET.ROOT, element: <AllSets /> },
					{ path: PATH.SET.CREATE_SET.ROOT, element: <CreateSet /> },
					{ path: PATH.SET.EDIT_SET.ROOT(), element: <CreateSet /> },
				],
			},
			{
				element: <Unauthorized permissions={["add_quizes", "edit_quizes", "delete_quizes", "view_quizes"]}><QuizManagementRoot /></Unauthorized>,
				children: [
					{ path: PATH.COURSE_MANAGEMENT.QUIZ.ROOT, element: <AllQuizes /> },
				],
			},
			{
				element: <Unauthorized permissions={["add_questions", "edit_questions", "delete_questions", "view_questions", "add_tests", "edit_tests", "delete_tests", "view_tests"]}><TestAndQuestionManagementRoot /></Unauthorized>,
				children: [
					{
						path: PATH.TEST_QUESTION_MANAGEMENT.QUESTIONS.ROOT,
						element: <QuestionManagementRoot />,
					},
					{
						path: PATH.TEST_QUESTION_MANAGEMENT.QUESTION_LABELS.ROOT,
						element: <QuestionLabelsRoot />,
					},
					{
						path: PATH.TEST_QUESTION_MANAGEMENT.QUESTION_LABELS.DETAIL.ROOT(),
						element: <QuestionLabelDetail />,
					},
					{
						path: PATH.TEST_QUESTION_MANAGEMENT.TEST.ROOT,
						element: <TestManagementRoot />,
					},
					{
						path: PATH.TEST_QUESTION_MANAGEMENT.TEST.INDIVIDUAL_TEST.ROOT,
						element: <AllIndividualTestListing />,
					},
					{
						path: PATH.TEST_QUESTION_MANAGEMENT.TEST.EDIT_TEST.ROOT(),
						element: <CreatTestRoot />,
					},
					{
						element: <ResultRoot />,
						children: [
							{
								path: PATH.TEST_QUESTION_MANAGEMENT.TEST.VIEW_TEST.ROOT(),
								element: <ViewTestRoot />,
							},
							{
								element: <SingleStudentAnswerLayout />,
								children: [
									{
										path: PATH.TEST_QUESTION_MANAGEMENT.TEST.CHECK_PAPER.ROOT(),
										element: <QuestionAnswerLisitingLayout />

									},
									{
										path: PATH.TEST_QUESTION_MANAGEMENT.TEST.CHECK_PAPER.CHECK_SUBJECTIVE_QUESTION.ROOT(),
										element: <SingleStudentSingleQuestion />,
									},
								]
							},
						],
					},
				],
			},
			{
				element: <Unauthorized permissions={["add_roles", "edit_roles", "delete_roles", "view_roles"]}>
					<RoleManagementRoot />
				</Unauthorized>,
				children: [
					{ path: PATH.ROLES.ROOT, element: <AllRoles /> },
					{ path: PATH.ROLES.CREATE_ROLE.ROOT, element: <CreateRoleRoot /> },
					{ path: PATH.ROLES.EDIT_ROLE.ROOT(), element: <CreateRoleRoot /> },
				],
			},
			{
				element: <Unauthorized permissions={["add_users", "edit_users", "delete_users", "view_users"]}><UserManagementRoot /></Unauthorized>,
				children: [
					{ index: true, path: PATH.USER_MANAGEMENT.ROOT, element: <AllUsers /> },
					{ path: PATH.USER_MANAGEMENT.CREATE_USER.ROOT, element: <CreateUser /> },
					{ path: PATH.USER_MANAGEMENT.EDIT_USER.ROOT(), element: <CreateUser /> },
					{
						path: PATH.USER_MANAGEMENT.VIEW_USER.ROOT(),
						element: <ViewUserRoot />,
						children: [
							{ index: true, element: <ProfileTab /> },
							{ path: "profile", element: <ProfileTab /> },
							{ path: "courses", element: <CoursesTab /> },
							{ path: "transactions", element: <TransactionsTab /> },
							{ path: "device-requests", element: <DeviceRequestsTab /> },
							{ path: "performance", element: <PerformanceTab /> },
							{ path: "login-history", element: <UserLoginHistory /> },
							{ path: "activity-history", element: <UserActivityHistory /> },
							{ path: "referrals", element: <ReferralsTab /> },
						],
					},
				],
			},
			{
				element: <Unauthorized permissions={["add_categories", "edit_categories", "delete_categories", "view_categories", "add_positions", "edit_positions", "delete_positions", "view_positions"]}
				> <CategoryManagementRoot /></Unauthorized >,
				children: [
					{
						path: PATH.CATEGORY_LEVEL_MANAGEMENT.CATEGORY.ROOT,
						element: <Unauthorized permissions={["add_categories", "edit_categories", "delete_categories", "view_categories"]}>
							<AllCategories />
						</Unauthorized>
					},
					{
						path: PATH.CATEGORY_LEVEL_MANAGEMENT.LEVEL_POSITION.ROOT, element:
							<Unauthorized permissions={["add_positions", "edit_positions", "delete_positions", "view_positions"]}>
								<AllPositions />
							</Unauthorized>
					},
				],
			},
			{
				path: PATH.SUBSCRIPTION_PLAN_MANAGEMENT.ROOT,
				element: <Unauthorized permissions={["add_subscriptions", "edit_subscriptions", "delete_subscriptions", "view_subscriptions"]}> <SubscriptionManagementRoot /></Unauthorized>,
			},
			{
				path: PATH.REFERRAL_POINTS.ROOT,
				element: <Unauthorized permissions={["view_referrals", "add_referrals", "edit_referrals", "delete_referrals"]}><ReferralPointsRoot /></Unauthorized>,
			},
			{
				path: PATH.REFERRAL_POINTS.REFERRALS.ROOT,
				element: <Unauthorized permissions={["view_referrals", "add_referrals", "edit_referrals", "delete_referrals"]}><AllReferralsPage /></Unauthorized>,
			},
			{
				path: PATH.REFERRAL_POINTS.TRANSACTIONS.ROOT,
				element: <Unauthorized permissions={["view_referrals", "add_referrals", "edit_referrals", "delete_referrals"]}><PointsTransactionsPage /></Unauthorized>,
			},
			{
				path: PATH.MARKETING_LINKS.ROOT,
				element: <Unauthorized permissions={["view_referrals", "add_referrals", "edit_referrals", "delete_referrals"]}><AllMarketingLinksPage /></Unauthorized>,
			},
			{
				path: PATH.MARKETING_LINKS.DETAIL.ROOT(),
				element: <Unauthorized permissions={["view_referrals", "add_referrals", "edit_referrals", "delete_referrals"]}><MarketingLinkDetailPage /></Unauthorized>,
			},
			{
				path: PATH.COUPON_CODES.ROOT,
				element: <Unauthorized permissions={["view_referrals", "add_referrals", "edit_referrals", "delete_referrals"]}><CouponCodesPage /></Unauthorized>,
			},
			{
				element:
					<Unauthorized permissions={["add_transactions", "edit_transactions", "delete_transactions", "view_transactions"]}> <TransactionManagementRoot />
					</Unauthorized>,
				children: [
					{ path: PATH.TRANSACTION_MANAGEMENT.ROOT, element: <AllTransactionRoot /> },
				],
			},
			{
				element: <Unauthorized permissions={["add_notifications", "edit_notifications", "delete_notifications", "view_notifications"]}>
					<NotificationRoot />
				</Unauthorized>,
				children: [
					{ path: PATH.NOTIFICATION_MANAGEMENT.ROOT, element: <AllNotificationsRoot /> },
					{ path: PATH.NOTIFICATION_MANAGEMENT.CREATE_NOTIFICATION.ROOT, element: <CreateNotificationRoot /> },
					{ path: PATH.NOTIFICATION_MANAGEMENT.EDIT_NOTIFICATION.ROOT(), element: <CreateNotificationRoot /> },
					{ path: PATH.NOTIFICATION_MANAGEMENT.VIEW_NOTIFICATION.ROOT(), element: <NotificationDetail /> },
				],
			},
			{
				element: <Unauthorized permissions={["add_gorkhapatras", "edit_gorkhapatras", "delete_gorkhapatras", "view_gorkhapatras"]}>
					<GorkhapatraRoot />
				</Unauthorized>,
				children: [
					{ path: PATH.GORKHAPATRA.ROOT, element: <AllGorkhapatraRoot /> },
					{ path: PATH.GORKHAPATRA.CREATE_GORKHAPATRA.ROOT, element: <CreateGorkhapatraRoot /> },
					{ path: PATH.GORKHAPATRA.EDIT_GORKHAPATRA.ROOT(), element: <CreateGorkhapatraRoot /> },
				],
			},
			{
				path: "/content-management",
				element: <Unauthorized permissions={["add_contents", "edit_contents", "delete_contents", "view_contents"]}> <ContentManagementRoot /></Unauthorized>,
				children: [
					{ path: PATH.CONTENT_MANAGEMENT.SPLASH_SCREEN.ROOT, element: <SplashScreenRoot /> },
					{ path: PATH.CONTENT_MANAGEMENT.ONBOARDING_SCREEN.ROOT, element: <OnBoardingScreenRoot /> },
					{
						path: PATH.CONTENT_MANAGEMENT.HOME_SCREEN.ROOT, element: <HomeScreens />, children: [
							{ path: PATH.CONTENT_MANAGEMENT.HOME_SCREEN.WELCOME_POPUP.ROOT, element: <WelcomePopupRoot /> },
							{ path: PATH.CONTENT_MANAGEMENT.HOME_SCREEN.BANNER.ROOT, element: <BannerRoot /> },
							{ path: PATH.CONTENT_MANAGEMENT.HOME_SCREEN.FEATURED_COURSE.ROOT, element: <FeaturedCourseRoot /> },
						]
					},
					{ path: PATH.CONTENT_MANAGEMENT.PAGES.ROOT, element: <PagesRoot /> },
					{ path: PATH.CONTENT_MANAGEMENT.PAGES.CREATE_PAGE.ROOT, element: <PageCreationForm /> },
					{ path: PATH.CONTENT_MANAGEMENT.PAGES.EDIT_PAGE.ROOT(), element: <PageCreationForm /> },
				]
			},
			{
				path: PATH.SETTINGS.ROOT,
				element: (
					<Unauthorized permissions={["add_settings", "edit_settings", "delete_settings", "view_settings"]}>
						<SettingRoot />
					</Unauthorized>
				),
				children: [
					{ path: PATH.SETTINGS.SYSTEM.PROFILE.ROOT, element: <ProfilePageRoot /> },
					{ path: PATH.SETTINGS.SYSTEM.CHANGE_PASSWORD.ROOT, element: <ChangePassword /> },
					{ path: PATH.SETTINGS.SYSTEM.SITE_INFO.ROOT, element: <SiteInfoRoot /> },
					{ path: PATH.SETTINGS.SYSTEM.SMTP.ROOT, element: <SmtpSettingRoot /> },
					{ path: PATH.SETTINGS.SYSTEM.GENERAL.ROOT, element: <AppSettingRoot /> },
					{ path: PATH.SETTINGS.SYSTEM.LINKED_DEVICE.ROOT, element: <LinkedDevices /> },
					{ path: PATH.SETTINGS.SYSTEM.EMAIL_TEMPLATES.ROOT, element: <EmailTemplatesRoot /> },
					{ path: PATH.SETTINGS.SYSTEM.COURSE_SETTING.ROOT, element: <CourseSettingRoot /> },
					{ path: PATH.SETTINGS.SYSTEM.LOGIN_TYPE.ROOT, element: <LoginTypeRoot /> },
					{ path: PATH.SETTINGS.SYSTEM.REFERRAL_CONFIG.ROOT, element: <ReferralConfigPage /> },
					{ path: PATH.SETTINGS.API.ZOOM.ROOT, element: <ZoomSettingRoot /> },
					{ path: PATH.SETTINGS.API.ESEWA.ROOT, element: <EsewaSettingRoot /> },
					{ path: PATH.SETTINGS.API.KHALTI.ROOT, element: <KhaltiSettingRoot /> },
					{ path: PATH.SETTINGS.API.SMS_GATEWAY.ROOT, element: <SmsGatewayRoot /> },
					{ path: PATH.SETTINGS.SYSTEM.CONTROLS.ROOT, element: <ControlsRoot /> },
				],
			},
			{
				path: PATH.ACTIVITY_LOG.ROOT,
				element: <ActivityRoot />
			},
			{
				path: PATH.ACTIVITY_LOG.ARCHIVED.ROOT,
				element: <ArchivedLogs />
			},
			{
				element: <MediaManagementRoot />,
				children: [
					{ path: PATH.MEDIA_MANAGEMENT.ROOT, element: <AllMediaRoot /> },
				]
			},
			{
				element: <Unauthorized permissions={["view_discussions", "add_discussions", "edit_discussions", "delete_discussions", "hide_discussions"]}>
					<DiscussionManagementRoot />
				</Unauthorized>,
				children: [
					{ path: PATH.DISCUSSION.ROOT, element: <AllDiscussions /> },
					{ path: PATH.DISCUSSION.CREATE.ROOT, element: <DiscussionForm /> },
					{ path: PATH.DISCUSSION.DETAIL.ROOT(), element: <DiscussionDetail /> },
					{ path: PATH.DISCUSSION.EDIT.ROOT(), element: <DiscussionForm /> },
				],
			},
			{
				element: <ModerationManagementRoot />,
				children: [
					{ path: PATH.MODERATION.ROOT, element: <WordModeration /> },
				],
			},
			{
				element: <DeviceResetManagementRoot />,
				children: [
					{ path: PATH.DEVICE_RESET.ROOT, element: <DeviceResetDetailPage /> },
					{ path: PATH.DEVICE_RESET.DETAIL.ROOT(), element: <DeviceResetDetailPage /> },
				],
			},
			{
				element: (
					<Unauthorized permissions={["add_tickets", "edit_tickets", "delete_tickets", "view_tickets"]}>
						<TicketManagementRoot />
					</Unauthorized>
				),
				children: [
					{ path: PATH.TICKET.ALL_TICKETS.ROOT, element: <AllTickets /> },
					{
						path: PATH.TICKET.CHATS.ROOT,
						element: <TicketChats />,
						children: [
							{ path: PATH.TICKET.CHAT_DETAIL.ROOT(), element: <TicketChatPage /> },
						],
					},
					{ path: PATH.TICKET.TICKET_TYPES.ROOT, element: <TicketTypes /> },
				],
			},
		],
	},

	{
		path: "*",
		element: <NotFound />,
	},
]);

export default function GlobalRoutes() {
	return <RouterProvider router={router} />;
}
