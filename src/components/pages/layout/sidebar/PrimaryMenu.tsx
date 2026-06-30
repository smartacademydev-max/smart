import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
    Box,
    Collapse,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from "@mui/material";
import { AttachSquare, Brodcast, Gift, Mobile, Setting2 } from "iconsax-reactjs";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useMenuCounts } from "../../../../hooks/useMenuCounts";
import CAN from "../../../../routes/CAN";
import { PATH } from "../../../../routes/PATH";
import MenuBadge from "../../../atoms/MenuBadge";

interface PrimaryMenuProps {
    collapsed?: boolean;
}

export default function PrimaryMenu({ collapsed = false }: PrimaryMenuProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [openCourse, setOpenCourse] = React.useState<boolean>(false);
    const [openCategory, setOpenCategory] = React.useState<boolean>(false);
    const [openTest, setOpenTest] = React.useState<boolean>(false);
    const [openOmr, setOpenOmr] = React.useState<boolean>(false);
    const [openDiscussion, setOpenDiscussion] = React.useState<boolean>(false);
    const [openReferral, setOpenReferral] = React.useState<boolean>(false);
    const [openTicket, setOpenTicket] = React.useState<boolean>(false);
    const [openActivityLog, setOpenActivityLog] = React.useState<boolean>(false);
    const counts = useMenuCounts();

    React.useEffect(() => {
        if (collapsed) {
            setOpenCourse(false);
            setOpenCategory(false);
            setOpenTest(false);
            setOpenOmr(false);
            setOpenDiscussion(false);
            setOpenReferral(false);
            setOpenTicket(false);
            setOpenActivityLog(false);
        }
    }, [collapsed]);

    React.useEffect(() => {
        const p = location.pathname;
        if (
            p.startsWith(PATH.COURSE_MANAGEMENT.COURSES.ROOT) ||
            p.startsWith(PATH.COURSE_MANAGEMENT.LIVE_CLASSES.ROOT) ||
            p.startsWith(PATH.COURSE_MANAGEMENT.QUIZ.ROOT) ||
            p.startsWith(PATH.ENROLLMENT.ROOT) ||
            p.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.CATEGORY.ROOT) ||
            p.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.LEVEL_POSITION.ROOT) ||
            p.startsWith(PATH.SUBSCRIPTION_PLAN_MANAGEMENT.ROOT)
        ) setOpenCourse(true);
        if (
            p.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.CATEGORY.ROOT) ||
            p.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.LEVEL_POSITION.ROOT)
        ) setOpenCategory(true);
        if (
            p.startsWith(PATH.TEST_QUESTION_MANAGEMENT.QUESTIONS.ROOT) ||
            p.startsWith(PATH.TEST_QUESTION_MANAGEMENT.TEST.ROOT) ||
            p.startsWith(PATH.TEST_QUESTION_MANAGEMENT.QUESTION_LABELS.ROOT) ||
            p.startsWith(PATH.SET.ROOT) ||
            p.startsWith(PATH.OMR.ROOT)
        ) setOpenTest(true);
        if (p.startsWith(PATH.OMR.ROOT)) setOpenOmr(true);
        if (p.startsWith(PATH.DISCUSSION.ROOT) || p.startsWith(PATH.MODERATION.ROOT)) setOpenDiscussion(true);
        if (p.startsWith(PATH.REFERRAL_POINTS.ROOT) || p.startsWith(PATH.MARKETING_LINKS.ROOT) || p.startsWith(PATH.COUPON_CODES.ROOT)) setOpenReferral(true);
        if (p.startsWith(PATH.TICKET.ROOT)) setOpenTicket(true);
        if (p.startsWith(PATH.ACTIVITY_LOG.ROOT)) setOpenActivityLog(true);
    }, [location.pathname]);

    const isActive = (path: string) => location.pathname === path;

    const isCourseGroupActive = () =>
        location.pathname.startsWith(PATH.COURSE_MANAGEMENT.COURSES.ROOT) ||
        location.pathname.startsWith(PATH.COURSE_MANAGEMENT.LIVE_CLASSES.ROOT) ||
        location.pathname.startsWith(PATH.COURSE_MANAGEMENT.QUIZ.ROOT) ||
        location.pathname.startsWith(PATH.ENROLLMENT.ROOT) ||
        location.pathname.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.CATEGORY.ROOT) ||
        location.pathname.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.LEVEL_POSITION.ROOT) ||
        location.pathname.startsWith(PATH.SUBSCRIPTION_PLAN_MANAGEMENT.ROOT);

    const isCategoryGroupActive = () =>
        location.pathname.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.CATEGORY.ROOT) ||
        location.pathname.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.LEVEL_POSITION.ROOT);

    const isTestGroupActive = () =>
        location.pathname.startsWith(PATH.TEST_QUESTION_MANAGEMENT.QUESTIONS.ROOT) ||
        location.pathname.startsWith(PATH.TEST_QUESTION_MANAGEMENT.TEST.ROOT) ||
        location.pathname.startsWith(PATH.TEST_QUESTION_MANAGEMENT.QUESTION_LABELS.ROOT) ||
        location.pathname.startsWith(PATH.SET.ROOT) ||
        location.pathname.startsWith(PATH.OMR.ROOT) || location.pathname.startsWith(PATH.TEST_QUESTION_MANAGEMENT.TEST.TEST_CATEGORY.ROOT);

    const isOmrActive = () => location.pathname.startsWith(PATH.OMR.ROOT);

    const isDiscussionGroupActive = () =>
        location.pathname.startsWith(PATH.DISCUSSION.ROOT) ||
        location.pathname.startsWith(PATH.MODERATION.ROOT);

    const isTicketGroupActive = () => location.pathname.startsWith(PATH.TICKET.ROOT);

    const isReferralGroupActive = () =>
        location.pathname.startsWith(PATH.REFERRAL_POINTS.ROOT) ||
        location.pathname.startsWith(PATH.MARKETING_LINKS.ROOT) ||
        location.pathname.startsWith(PATH.COUPON_CODES.ROOT);

    const isSettingGroupActive = () => location.pathname.startsWith(PATH.SETTINGS.ROOT);


    const btnSx = collapsed ? { justifyContent: "center", px: 1, minHeight: 44 } : {};
    const iconSx = collapsed ? { minWidth: 0 } : {};

    return (
        <Box
            className="primary__menu relative h-full"
            sx={{ padding: collapsed ? "0 8px 8px" : "0 32px 32px", overflow: "hidden" }}
        >
            <List sx={{
                maxHeight: { xs: "calc(100svh - 150px)", lg: "calc(100svh - 180px)" },
                overflowY: "auto",
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
            }}>

                {/* Dashboard */}
                <ListItem disablePadding className="menu__item">
                    <Tooltip title={collapsed ? t("menus.dashboard") : ""} placement="right" arrow>
                        <ListItemButton
                            onClick={() => navigate(PATH.DASHBOARD.ROOT)}
                            className={isActive(PATH.DASHBOARD.ROOT) ? "active" : ""}
                            sx={btnSx}
                        >
                            <ListItemIcon sx={iconSx}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.3333 9.08341V3.41675C18.3333 2.16675 17.8 1.66675 16.475 1.66675H13.1083C11.7833 1.66675 11.25 2.16675 11.25 3.41675V9.08341C11.25 10.3334 11.7833 10.8334 13.1083 10.8334H16.475C17.8 10.8334 18.3333 10.3334 18.3333 9.08341Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M18.3333 16.5833V15.0833C18.3333 13.8333 17.8 13.3333 16.475 13.3333H13.1083C11.7833 13.3333 11.25 13.8333 11.25 15.0833V16.5833C11.25 17.8333 11.7833 18.3333 13.1083 18.3333H16.475C17.8 18.3333 18.3333 17.8333 18.3333 16.5833Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8.75 10.9167V16.5834C8.75 17.8334 8.21667 18.3334 6.89167 18.3334H3.525C2.2 18.3334 1.66667 17.8334 1.66667 16.5834V10.9167C1.66667 9.66675 2.2 9.16675 3.525 9.16675H6.89167C8.21667 9.16675 8.75 9.66675 8.75 10.9167Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8.75 3.41675V4.91675C8.75 6.16675 8.21667 6.66675 6.89167 6.66675H3.525C2.2 6.66675 1.66667 6.16675 1.66667 4.91675V3.41675C1.66667 2.16675 2.2 1.66675 3.525 1.66675H6.89167C8.21667 1.66675 8.75 2.16675 8.75 3.41675Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </ListItemIcon>
                            {!collapsed && <ListItemText primary={t("menus.dashboard")} />}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>

                {/* Courses */}
                <CAN permissions={["add_courses", "edit_courses", "delete_courses", "view_courses", "add_live_classes", "edit_live_classes", "delete_live_classes", "view_live_classes", "add_enrollments", "edit_enrollments", "delete_enrollments", "view_enrollments", "add_categories", "edit_categories", "delete_categories", "view_categories", "add_positions", "edit_positions", "delete_positions", "view_positions", "add_subscriptions", "edit_subscriptions", "delete_subscriptions", "view_subscriptions"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("menus.course_management.root") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => collapsed
                                    ? navigate(PATH.COURSE_MANAGEMENT.COURSES.ROOT)
                                    : setOpenCourse((prev) => !prev)
                                }
                                className={isCourseGroupActive() ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18.3333 13.9501V3.89174C18.3333 2.89174 17.5167 2.15008 16.525 2.23341H16.475C14.725 2.38341 12.0667 3.27508 10.5833 4.20841L10.4417 4.30008C10.2 4.45008 9.8 4.45008 9.55833 4.30008L9.35 4.17508C7.86667 3.25008 5.21667 2.36674 3.46667 2.22508C2.475 2.14174 1.66667 2.89174 1.66667 3.88341V13.9501C1.66667 14.7501 2.31667 15.5001 3.11667 15.6001L3.35833 15.6334C5.16667 15.8751 7.95833 16.7917 9.55833 17.6667L9.59167 17.6834C9.81667 17.8084 10.175 17.8084 10.3917 17.6834C11.9917 16.8001 14.7917 15.8751 16.6083 15.6334L16.8833 15.6001C17.6833 15.5001 18.3333 14.7501 18.3333 13.9501Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10 4.57495V17.075" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6.45833 7.07495H4.58333" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7.08333 9.57495H4.58333" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("menus.course_management.root")} />}
                                {!collapsed && (openCourse ? <ExpandLess /> : <ExpandMore />)}
                            </ListItemButton>
                        </Tooltip>
                        <Collapse in={openCourse && !collapsed} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 3 }}>

                                <CAN permissions={["add_courses", "edit_courses", "delete_courses", "view_courses"]}>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.COURSE_MANAGEMENT.COURSES.ROOT)}
                                            className={location.pathname.startsWith(PATH.COURSE_MANAGEMENT.COURSES.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.course_management.courses.root")} />
                                        </ListItemButton>
                                    </ListItem>
                                </CAN>

                                <CAN permissions={["add_live_classes", "edit_live_classes", "delete_live_classes", "view_live_classes"]}>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.COURSE_MANAGEMENT.LIVE_CLASSES.ROOT)}
                                            className={location.pathname.startsWith(PATH.COURSE_MANAGEMENT.LIVE_CLASSES.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.course_management.live_classes.root")} />
                                        </ListItemButton>
                                    </ListItem>
                                </CAN>

                                <CAN permissions={["add_enrollments", "edit_enrollments", "delete_enrollments", "view_enrollments"]}>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.ENROLLMENT.ROOT)}
                                            className={location.pathname.startsWith(PATH.ENROLLMENT.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.enrollment.root")} />
                                        </ListItemButton>
                                    </ListItem>
                                </CAN>

                                <CAN permissions={["add_categories", "edit_categories", "delete_categories", "view_categories", "add_positions", "edit_positions", "delete_positions", "view_positions"]}>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => setOpenCategory((prev) => !prev)}
                                            className={isCategoryGroupActive() ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.category_level_management.root")} />
                                            {openCategory ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                                        </ListItemButton>
                                    </ListItem>
                                    <Collapse in={openCategory} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding sx={{ pl: 2 }}>
                                            <ListItem disablePadding className="menu__item">
                                                <ListItemButton
                                                    onClick={() => navigate(PATH.CATEGORY_LEVEL_MANAGEMENT.CATEGORY.ROOT)}
                                                    className={location.pathname.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.CATEGORY.ROOT) ? "active-nested" : ""}>
                                                    <ListItemText primary={t("menus.category_level_management.category.root")} />
                                                </ListItemButton>
                                            </ListItem>
                                            <ListItem disablePadding className="menu__item">
                                                <ListItemButton
                                                    onClick={() => navigate(PATH.CATEGORY_LEVEL_MANAGEMENT.LEVEL_POSITION.ROOT)}
                                                    className={location.pathname.startsWith(PATH.CATEGORY_LEVEL_MANAGEMENT.LEVEL_POSITION.ROOT) ? "active-nested" : ""}>
                                                    <ListItemText primary={t("menus.category_level_management.level_position.root")} />
                                                </ListItemButton>
                                            </ListItem>
                                        </List>
                                    </Collapse>
                                </CAN>

                                <CAN permissions={["add_subscriptions", "edit_subscriptions", "delete_subscriptions", "view_subscriptions"]}>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.SUBSCRIPTION_PLAN_MANAGEMENT.ROOT)}
                                            className={location.pathname.startsWith(PATH.SUBSCRIPTION_PLAN_MANAGEMENT.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.subscription_plan.root")} />
                                        </ListItemButton>
                                    </ListItem>
                                </CAN>

                                <CAN permissions={["add_quizes", "edit_quizes", "delete_quizes", "view_quizes"]}>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.COURSE_MANAGEMENT.QUIZ.ROOT)}
                                            className={location.pathname.startsWith(PATH.COURSE_MANAGEMENT.QUIZ.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.course_management.quiz.root")} />
                                        </ListItemButton>
                                    </ListItem>
                                </CAN>

                            </List>
                        </Collapse>
                    </ListItem>
                </CAN>

                {/* Test */}
                <CAN permissions={["add_questions", "edit_questions", "delete_questions", "view_questions", "add_tests", "edit_tests", "delete_tests", "view_tests"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("menus.test_question_management.root") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => collapsed
                                    ? navigate(PATH.TEST_QUESTION_MANAGEMENT.QUESTIONS.ROOT)
                                    : setOpenTest((prev) => !prev)
                                }
                                className={isTestGroupActive() ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18.3333 13.9501V3.89174C18.3333 2.89174 17.5167 2.15008 16.525 2.23341H16.475C14.725 2.38341 12.0667 3.27508 10.5833 4.20841L10.4417 4.30008C10.2 4.45008 9.8 4.45008 9.55833 4.30008L9.35 4.17508C7.86667 3.25008 5.21667 2.36674 3.46667 2.22508C2.475 2.14174 1.66667 2.89174 1.66667 3.88341V13.9501C1.66667 14.7501 2.31667 15.5001 3.11667 15.6001L3.35833 15.6334C5.16667 15.8751 7.95833 16.7917 9.55833 17.6667L9.59167 17.6834C9.81667 17.8084 10.175 17.8084 10.3917 17.6834C11.9917 16.8001 14.7917 15.8751 16.6083 15.6334L16.8833 15.6001C17.6833 15.5001 18.3333 14.7501 18.3333 13.9501Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10 4.57495V17.075" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6.45833 7.07495H4.58333" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7.08333 9.57495H4.58333" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("menus.test_question_management.root")} />}
                                {!collapsed && (openTest ? <ExpandLess /> : <ExpandMore />)}
                            </ListItemButton>
                        </Tooltip>
                        <Collapse in={openTest && !collapsed} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 3 }}>

                                <CAN permissions={["add_questions", "edit_questions", "delete_questions", "view_questions"]}>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.TEST_QUESTION_MANAGEMENT.QUESTIONS.ROOT)}
                                            className={location.pathname.startsWith(PATH.TEST_QUESTION_MANAGEMENT.QUESTIONS.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.test_question_management.question.root")} />
                                        </ListItemButton>
                                    </ListItem>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.TEST_QUESTION_MANAGEMENT.QUESTION_LABELS.ROOT)}
                                            className={location.pathname.startsWith(PATH.TEST_QUESTION_MANAGEMENT.QUESTION_LABELS.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.test_question_management.question_labels.root")} />
                                        </ListItemButton>
                                    </ListItem>
                                </CAN>

                                <CAN permissions={["add_tests", "edit_tests", "delete_tests", "view_tests"]}>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.TEST_QUESTION_MANAGEMENT.TEST.TEST_CATEGORY.ROOT)}
                                            className={location.pathname.startsWith(PATH.TEST_QUESTION_MANAGEMENT.TEST.TEST_CATEGORY.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.test_question_management.test.test_category.root")} />
                                        </ListItemButton>
                                    </ListItem>
                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.TEST_QUESTION_MANAGEMENT.TEST.ROOT)}
                                            className={location.pathname.startsWith(PATH.TEST_QUESTION_MANAGEMENT.TEST.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.test_question_management.test.root")} />
                                        </ListItemButton>
                                    </ListItem>

                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.TEST_QUESTION_MANAGEMENT.TEST.INDIVIDUAL_TEST.ROOT)}
                                            className={location.pathname.startsWith(PATH.TEST_QUESTION_MANAGEMENT.TEST.INDIVIDUAL_TEST.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.test_question_management.test.individual.root")} />
                                        </ListItemButton>
                                    </ListItem>

                                    <ListItem disablePadding className="menu__item">
                                        <ListItemButton
                                            onClick={() => navigate(PATH.SET.ROOT)}
                                            className={location.pathname.startsWith(PATH.SET.ROOT) ? "active-nested" : ""}>
                                            <ListItemText primary={t("menus.test_question_management.test.bundle_test.root")} />
                                        </ListItemButton>
                                    </ListItem>

                                    <CAN permissions={["add_omr_sheets", "edit_omr_sheets", "delete_omr_sheets", "view_omr_sheets"]}>
                                        <ListItem disablePadding className="menu__item">
                                            <ListItemButton
                                                onClick={() => setOpenOmr((prev) => !prev)}
                                                className={isOmrActive() ? "active-nested" : ""}>
                                                <ListItemText primary={t("menus.test_question_management.test.omr.root")} />
                                                {openOmr ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                                            </ListItemButton>
                                        </ListItem>
                                        <Collapse in={openOmr} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding sx={{ pl: 2 }}>
                                                <ListItem disablePadding className="menu__item">
                                                    <ListItemButton
                                                        onClick={() => navigate(PATH.OMR.ROOT)}
                                                        className={location.pathname === PATH.OMR.ROOT ? "active-nested" : ""}>
                                                        <ListItemText primary="Sheet" />
                                                    </ListItemButton>
                                                </ListItem>
                                                <ListItem disablePadding className="menu__item">
                                                    <ListItemButton
                                                        onClick={() => navigate(PATH.OMR.FORMAT.ROOT)}
                                                        className={location.pathname.startsWith(PATH.OMR.FORMAT.ROOT) ? "active-nested" : ""}>
                                                        <ListItemText primary="Instructions" />
                                                    </ListItemButton>
                                                </ListItem>
                                            </List>
                                        </Collapse>
                                    </CAN>
                                </CAN>

                            </List>
                        </Collapse>
                    </ListItem>
                </CAN>

                {/* Users */}
                <CAN permissions={["add_users", "edit_users", "delete_users", "view_users"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("menus.user_management.root") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate(PATH.USER_MANAGEMENT.ROOT)}
                                className={location.pathname.startsWith(PATH.USER_MANAGEMENT.ROOT) ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.63333 9.05841C7.55 9.05008 7.45 9.05008 7.35833 9.05841C5.375 8.99175 3.8 7.36675 3.8 5.36675C3.8 3.32508 5.45 1.66675 7.5 1.66675C9.54167 1.66675 11.2 3.32508 11.2 5.36675C11.1917 7.36675 9.61667 8.99175 7.63333 9.05841Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M13.675 3.33325C15.2917 3.33325 16.5917 4.64159 16.5917 6.24992C16.5917 7.82492 15.3417 9.10825 13.7833 9.16659C13.7167 9.15825 13.6417 9.15825 13.5667 9.16659" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M3.46667 12.1333C1.45 13.4833 1.45 15.6833 3.46667 17.0249C5.75833 18.5583 9.51667 18.5583 11.8083 17.0249C13.825 15.6749 13.825 13.4749 11.8083 12.1333C9.525 10.6083 5.76667 10.6083 3.46667 12.1333Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M15.2833 16.6667C15.8833 16.5417 16.45 16.3001 16.9167 15.9417C18.2167 14.9667 18.2167 13.3584 16.9167 12.3834C16.4583 12.0334 15.9 11.8001 15.3083 11.6667" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("menus.user_management.root")} />}
                                {!collapsed && <MenuBadge count={counts.newUsers} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </CAN>

                {/* Transactions */}
                <CAN permissions={["add_transactions", "edit_transactions", "delete_transactions", "view_transactions"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("menus.transaction_management.root") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate(PATH.TRANSACTION_MANAGEMENT.ROOT)}
                                className={location.pathname.startsWith(PATH.TRANSACTION_MANAGEMENT.ROOT) ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.0831 6.60023V10.8919C16.0831 13.4586 14.6165 14.5586 12.4165 14.5586H5.09147C4.71647 14.5586 4.35813 14.5253 4.0248 14.4503C3.81647 14.4169 3.61647 14.3586 3.43314 14.2919C2.18314 13.8253 1.4248 12.7419 1.4248 10.8919V6.60023C1.4248 4.03356 2.89147 2.93359 5.09147 2.93359H12.4165C14.2831 2.93359 15.6248 3.72526 15.9831 5.53359C16.0415 5.86692 16.0831 6.20856 16.0831 6.60023Z" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M18.5842 9.1018V13.3935C18.5842 15.9601 17.1176 17.0601 14.9176 17.0601H7.59254C6.97588 17.0601 6.41755 16.9768 5.93422 16.7935C4.94255 16.4268 4.26755 15.6685 4.02588 14.4518C4.35921 14.5268 4.71754 14.5601 5.09254 14.5601H12.4176C14.6176 14.5601 16.0842 13.4601 16.0842 10.8935V6.6018C16.0842 6.21013 16.0509 5.86016 15.9842 5.53516C17.5676 5.86849 18.5842 6.98513 18.5842 9.1018Z" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8.74835 10.9508C9.96338 10.9508 10.9484 9.96582 10.9484 8.75079C10.9484 7.53577 9.96338 6.55078 8.74835 6.55078C7.53333 6.55078 6.54834 7.53577 6.54834 8.75079C6.54834 9.96582 7.53333 10.9508 8.74835 10.9508Z" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M3.98291 6.91797V10.5847" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M13.5181 6.91797V10.5847" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("menus.transaction_management.root")} />}
                                {!collapsed && <MenuBadge count={counts.transaction} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </CAN>

                {/* Referral & Points */}
                <CAN permissions={["view_referrals", "add_referrals", "edit_referrals", "delete_referrals"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? "Referral & Points" : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => collapsed
                                    ? navigate(PATH.REFERRAL_POINTS.ROOT)
                                    : setOpenReferral((prev) => !prev)
                                }
                                className={isReferralGroupActive() ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <Gift size={20} color="#9CA3B0" />
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary="Referral & Points" />}
                                {!collapsed && (openReferral ? <ExpandLess /> : <ExpandMore />)}
                            </ListItemButton>
                        </Tooltip>
                        <Collapse in={openReferral && !collapsed} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 3 }}>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.REFERRAL_POINTS.ROOT)}
                                        className={location.pathname === PATH.REFERRAL_POINTS.ROOT ? "active-nested" : ""}
                                    >
                                        <ListItemText primary="Overview" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.REFERRAL_POINTS.REFERRALS.ROOT)}
                                        className={location.pathname.startsWith(PATH.REFERRAL_POINTS.REFERRALS.ROOT) ? "active-nested" : ""}
                                    >
                                        <ListItemText primary="All Referrals" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.REFERRAL_POINTS.TRANSACTIONS.ROOT)}
                                        className={location.pathname.startsWith(PATH.REFERRAL_POINTS.TRANSACTIONS.ROOT) ? "active-nested" : ""}
                                    >
                                        <ListItemText primary="Points Transactions" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.MARKETING_LINKS.ROOT)}
                                        className={location.pathname.startsWith(PATH.MARKETING_LINKS.ROOT) ? "active-nested" : ""}
                                    >
                                        <ListItemText primary="Marketing Links" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.COUPON_CODES.ROOT)}
                                        className={location.pathname.startsWith(PATH.COUPON_CODES.ROOT) ? "active-nested" : ""}
                                    >
                                        <ListItemText primary="Coupon Codes" />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Collapse>
                    </ListItem>
                </CAN>

                {/* Notifications */}
                <CAN permissions={["add_notifications", "edit_notifications", "delete_notifications", "view_notifications"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("menus.notification_management.root") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate(PATH.NOTIFICATION_MANAGEMENT.ROOT)}
                                className={location.pathname.startsWith(PATH.NOTIFICATION_MANAGEMENT.ROOT) ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.0165 2.42578C7.25816 2.42578 5.0165 4.66745 5.0165 7.42578V9.83412C5.0165 10.3424 4.79983 11.1174 4.5415 11.5508L3.58316 13.1424C2.9915 14.1258 3.39983 15.2174 4.48316 15.5841C8.07483 16.7841 11.9498 16.7841 15.5415 15.5841C16.5498 15.2508 16.9915 14.0591 16.4415 13.1424L15.4832 11.5508C15.2332 11.1174 15.0165 10.3424 15.0165 9.83412V7.42578C15.0165 4.67578 12.7665 2.42578 10.0165 2.42578Z" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                                        <path d="M11.5584 2.66719C11.3001 2.59219 11.0334 2.53385 10.7584 2.50052C9.95843 2.40052 9.19176 2.45885 8.4751 2.66719C8.71676 2.05052 9.31676 1.61719 10.0168 1.61719C10.7168 1.61719 11.3168 2.05052 11.5584 2.66719Z" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.5166 15.8828C12.5166 17.2578 11.3916 18.3828 10.0166 18.3828C9.33327 18.3828 8.69993 18.0995 8.24993 17.6495C7.79993 17.1995 7.5166 16.5661 7.5166 15.8828" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" />
                                    </svg>
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("menus.notification_management.root")} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </CAN>

                {/* Support */}
                <CAN permissions={["add_tickets", "edit_tickets", "delete_tickets", "view_tickets"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("menus.ticket.root") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => collapsed
                                    ? navigate(PATH.TICKET.ALL_TICKETS.ROOT)
                                    : setOpenTicket((prev) => !prev)
                                }
                                className={isTicketGroupActive() ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 9C2 7.89543 2.89543 7 4 7H20C21.1046 7 22 7.89543 22 9V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V9Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 12V17M9.5 14.5H14.5" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("menus.ticket.root")} />}
                                {!collapsed && <MenuBadge count={counts.supportTicket} />}
                                {!collapsed && (openTicket ? <ExpandLess /> : <ExpandMore />)}
                            </ListItemButton>
                        </Tooltip>
                        <Collapse in={openTicket && !collapsed} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 3 }}>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.TICKET.ALL_TICKETS.ROOT)}
                                        className={location.pathname.startsWith(PATH.TICKET.ALL_TICKETS.ROOT) ? "active-nested" : ""}>
                                        <ListItemText primary={t("menus.ticket.all_tickets")} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.TICKET.CHATS.ROOT)}
                                        className={location.pathname.startsWith(PATH.TICKET.CHATS.ROOT) ? "active-nested" : ""}>
                                        <ListItemText primary={t("menus.ticket.chats")} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.TICKET.TICKET_TYPES.ROOT)}
                                        className={location.pathname.startsWith(PATH.TICKET.TICKET_TYPES.ROOT) ? "active-nested" : ""}>
                                        <ListItemText primary={t("menus.ticket.ticket_types")} />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Collapse>
                    </ListItem>
                </CAN>

                {/* Discussions */}
                <ListItem disablePadding className="menu__item">
                    <Tooltip title={collapsed ? "Discussion" : ""} placement="right" arrow>
                        <ListItemButton
                            onClick={() => collapsed
                                ? navigate(PATH.DISCUSSION.ROOT)
                                : setOpenDiscussion((prev) => !prev)
                            }
                            className={isDiscussionGroupActive() ? "active" : ""}
                            sx={btnSx}
                        >
                            <ListItemIcon sx={iconSx}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M8 10h8M8 13h5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.6.376 3.112 1.043 4.453L2 22l5.547-1.043A9.955 9.955 0 0012 22z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </ListItemIcon>
                            {!collapsed && <ListItemText primary="Discussion" />}
                            {!collapsed && <MenuBadge count={counts.discussion} />}
                            {!collapsed && (openDiscussion ? <ExpandLess /> : <ExpandMore />)}
                        </ListItemButton>
                    </Tooltip>
                    <Collapse in={openDiscussion && !collapsed} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ pl: 3 }}>
                            <CAN permissions={["view_discussions", "add_discussions", "edit_discussions", "delete_discussions"]}>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.DISCUSSION.ROOT)}
                                        className={location.pathname.startsWith(PATH.DISCUSSION.ROOT) ? "active-nested" : ""}>
                                        <ListItemText primary={t("menus.discussion.root")} />
                                    </ListItemButton>
                                </ListItem>
                            </CAN>
                            <CAN permissions={["view_moderations", "add_moderations", "edit_moderations", "delete_moderations"]}>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.MODERATION.ROOT)}
                                        className={location.pathname.startsWith(PATH.MODERATION.ROOT) ? "active-nested" : ""}>
                                        <ListItemText primary="Moderation" />
                                    </ListItemButton>
                                </ListItem>
                            </CAN>
                        </List>
                    </Collapse>
                </ListItem>

                {/* Device Reset */}
                <CAN permissions={["add_reset_requests", "edit_reset_requests", "delete_reset_requests", "view_reset_requests"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? "Device Reset" : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate(PATH.DEVICE_RESET.ROOT)}
                                className={location.pathname.startsWith(PATH.DEVICE_RESET.ROOT) ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <Mobile size={20} />
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary="Device Reset" />}
                                {!collapsed && <MenuBadge count={counts.deviceReset} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </CAN>

                {/* Activity Logs */}
                <CAN permissions={["add_activity_logs", "edit_activity_logs", "delete_activity_logs", "view_activity_logs"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("messages.activity_log") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => collapsed
                                    ? navigate(PATH.ACTIVITY_LOG.ROOT)
                                    : setOpenActivityLog((prev) => !prev)
                                }
                                className={location.pathname.startsWith(PATH.ACTIVITY_LOG.ROOT) ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <Brodcast />
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("messages.activity_log")} />}
                                {!collapsed && <MenuBadge count={counts.activityLog} />}
                                {!collapsed && (openActivityLog ? <ExpandLess /> : <ExpandMore />)}
                            </ListItemButton>
                        </Tooltip>
                        <Collapse in={openActivityLog && !collapsed} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 3 }}>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.ACTIVITY_LOG.ROOT)}
                                        className={location.pathname === PATH.ACTIVITY_LOG.ROOT ? "active-nested" : ""}>
                                        <ListItemText primary={t("messages.current_logs")} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding className="menu__item">
                                    <ListItemButton
                                        onClick={() => navigate(PATH.ACTIVITY_LOG.ARCHIVED.ROOT)}
                                        className={location.pathname.startsWith(PATH.ACTIVITY_LOG.ARCHIVED.ROOT) ? "active-nested" : ""}>
                                        <ListItemText primary={t("messages.archived_logs")} />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Collapse>
                    </ListItem>
                </CAN>

                {/* Media */}
                <CAN permissions={["add_medias", "edit_medias", "delete_medias", "view_medias"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("messages.medias") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate(PATH.MEDIA_MANAGEMENT.ROOT)}
                                className={location.pathname.startsWith(PATH.MEDIA_MANAGEMENT.ROOT) ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <AttachSquare />
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("messages.medias")} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </CAN>

                {/* Content */}
                <CAN permissions={["add_contents", "edit_contents", "delete_contents", "view_contents"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("menus.content_management.root") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate(PATH.CONTENT_MANAGEMENT.SPLASH_SCREEN.ROOT)}
                                className={location.pathname.startsWith(PATH.CONTENT_MANAGEMENT.ROOT) ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.1665 17.0846H5.83317C3.33317 17.0846 1.6665 15.8346 1.6665 12.918V7.08464C1.6665 4.16797 3.33317 2.91797 5.83317 2.91797H14.1665C16.6665 2.91797 18.3332 4.16797 18.3332 7.08464V12.918C18.3332 15.8346 16.6665 17.0846 14.1665 17.0846Z" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4.5835 7.91797V12.0846" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M15.4165 7.91797V12.0846" stroke="#9CA3B0" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("menus.content_management.root")} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </CAN>

                {/* Gorkhapatra */}
                <CAN permissions={["add_gorkhapatras", "edit_gorkhapatras", "delete_gorkhapatras", "view_gorkhapatras"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("menus.gorkhapatra.root") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate(PATH.GORKHAPATRA.ROOT)}
                                className={location.pathname.startsWith(PATH.GORKHAPATRA.ROOT) ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                        <path d="M10.5 2.16667H13C13.221 2.16667 13.433 2.25446 13.5893 2.41074C13.7455 2.56702 13.8333 2.77899 13.8333 3V12.1667C13.8333 12.6087 13.6577 13.0326 13.3452 13.3452C13.0326 13.6577 12.6087 13.8333 12.1667 13.8333M12.1667 13.8333C11.7246 13.8333 11.3007 13.6577 10.9882 13.3452C10.6756 13.0326 10.5 12.6087 10.5 12.1667V1.33333C10.5 1.11232 10.4122 0.900358 10.2559 0.744078C10.0996 0.587798 9.88768 0.5 9.66667 0.5H1.33333C1.11232 0.5 0.900358 0.587798 0.744078 0.744078C0.587798 0.900358 0.5 1.11232 0.5 1.33333V11.3333C0.5 11.9964 0.763392 12.6323 1.23223 13.1011C1.70107 13.5699 2.33696 13.8333 3 13.8333H12.1667ZM3.83333 3.83333H7.16667M3.83333 7.16667H7.16667M3.83333 10.5H7.16667" stroke="#9CA3B0" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("menus.gorkhapatra.root")} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </CAN>

                {/* Roles & Permission */}
                <CAN permissions={["add_roles", "edit_roles", "delete_roles", "view_roles"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("menus.role_permission.root") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate(PATH.ROLES.ROOT)}
                                className={location.pathname.startsWith(PATH.ROLES.ROOT) ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.1167 18.0166C14.3833 18.2333 13.5167 18.3333 12.5 18.3333H7.5C6.48333 18.3333 5.61667 18.2333 4.88334 18.0166C5.06667 15.85 7.29167 14.1416 10 14.1416C12.7083 14.1416 14.9333 15.85 15.1167 18.0166Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.5 1.66675H7.5C3.33333 1.66675 1.66667 3.33341 1.66667 7.50008V12.5001C1.66667 15.6501 2.61667 17.3751 4.88334 18.0167C5.06667 15.8501 7.29167 14.1417 10 14.1417C12.7083 14.1417 14.9333 15.8501 15.1167 18.0167C17.3833 17.3751 18.3333 15.6501 18.3333 12.5001V7.50008C18.3333 3.33341 16.6667 1.66675 12.5 1.66675ZM10 11.8084C8.35 11.8084 7.01667 10.4668 7.01667 8.81676C7.01667 7.16676 8.35 5.83341 10 5.83341C11.65 5.83341 12.9833 7.16676 12.9833 8.81676C12.9833 10.4668 11.65 11.8084 10 11.8084Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.9833 8.8166C12.9833 10.4666 11.65 11.8082 10 11.8082C8.35 11.8082 7.01667 10.4666 7.01667 8.8166C7.01667 7.1666 8.35 5.83325 10 5.83325C11.65 5.83325 12.9833 7.1666 12.9833 8.8166Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("menus.role_permission.root")} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </CAN>

                {/* Settings */}
                <CAN permissions={["add_settings", "edit_settings", "delete_settings", "view_settings"]}>
                    <ListItem disablePadding className="menu__item">
                        <Tooltip title={collapsed ? t("messages.settings") : ""} placement="right" arrow>
                            <ListItemButton
                                onClick={() => navigate(PATH.SETTINGS.SYSTEM.PROFILE.ROOT)}
                                className={isSettingGroupActive() ? "active" : ""}
                                sx={btnSx}
                            >
                                <ListItemIcon sx={iconSx}>
                                    <Setting2 />
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary={t("messages.settings")} />}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </CAN>

            </List>
        </Box>
    );
}
