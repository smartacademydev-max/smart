import {
    Box,
    ClickAwayListener,
    Grow,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Popper,
    useTheme
} from "@mui/material";
import { ArrangeHorizontal, Copy, Key, MoneyRecive, MoneyRemove, Send, Slash, TickCircle } from "iconsax-reactjs";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { showAttachment } from "../../../slice/attachmentSlice";
import { useAppDispatch } from "../../../store/hook";
import AttachmentViewerDialog from "../../organism/Dialog/AttachmentViewerDialog";
interface Props {
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    viewUrl?: string;
    editUrl?: string;
    deleting?: boolean;
    onSuspend?: () => void;
    onClone?: () => void;
    onGenerateOtp?: () => void;
    onSendPasswordReset?: () => void;
    onStatus?: () => void;
    onManageInstallment?: () => void;
    onMarkPaid?: () => void;
    /** Gate on the `add_refunds` permission — pass `undefined` to hide it. */
    onRefund?: () => void;
    userStatus?: boolean;
    file?: string;
    courseStatus?: "published" | "draft"
}

export default function Actions({ onEdit, onDelete, onView, deleting = false, onSuspend, userStatus, file, onClone, onGenerateOtp, onSendPasswordReset, onStatus, onManageInstallment, onMarkPaid, onRefund, courseStatus, viewUrl, editUrl }: Props) {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement | null>(null);
    const { t } = useTranslation();
    const theme = useTheme();

    const handleToggle = () => setOpen((prev) => !prev);

    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }
        setOpen(false);
    };

    const handleMenuClick = (action: () => void) => {
        action();
        setOpen(false);
    };

    return (
        <Box>
            <IconButton ref={anchorRef} onClick={handleToggle}>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2 9L2 15C2 20 4 22 9 22L15 22C20 22 22 20 22 15L22 9C22 4 20 2 15 2L9 2C4 2 2 4 2 9Z"
                        stroke="#848484"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 16L12 16.005"
                        stroke="#848484"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 12L12 12.005"
                        stroke="#848484"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 8L12 8.005"
                        stroke="#848484"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </IconButton>

            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                placement="bottom-end"
                disablePortal
                sx={{
                    zIndex: 10
                }}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps}>
                        <Paper elevation={3}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <List className="min-w-[188px] p-2!">
                                    {onView ? <ListItem className="menu__item action__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onView)}>
                                            <ListItemIcon>
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12.9833 10.0001C12.9833 11.6501 11.6499 12.9834 9.99993 12.9834C8.34993 12.9834 7.0166 11.6501 7.0166 10.0001C7.0166 8.35006 8.34993 7.01672 9.99993 7.01672C11.6499 7.01672 12.9833 8.35006 12.9833 10.0001Z" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M9.99987 16.8916C12.9415 16.8916 15.6832 15.1583 17.5915 12.1583C18.3415 10.9833 18.3415 9.00831 17.5915 7.83331C15.6832 4.83331 12.9415 3.09998 9.99987 3.09998C7.0582 3.09998 4.31654 4.83331 2.4082 7.83331C1.6582 9.00831 1.6582 10.9833 2.4082 12.1583C4.31654 15.1583 7.0582 16.8916 9.99987 16.8916Z" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </ListItemIcon>
                                            <ListItemText primary={t("actions.view")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {viewUrl && (
                                        <ListItem className="menu__item action__item">
                                            <ListItemButton
                                                component={RouterLink}
                                                to={viewUrl}
                                                onClick={() => setOpen(false)}
                                                sx={{ m: 0, border: "none" }}
                                            >
                                                <ListItemIcon><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12.9833 10.0001C12.9833 11.6501 11.6499 12.9834 9.99993 12.9834C8.34993 12.9834 7.0166 11.6501 7.0166 10.0001C7.0166 8.35006 8.34993 7.01672 9.99993 7.01672C11.6499 7.01672 12.9833 8.35006 12.9833 10.0001Z" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M9.99987 16.8916C12.9415 16.8916 15.6832 15.1583 17.5915 12.1583C18.3415 10.9833 18.3415 9.00831 17.5915 7.83331C15.6832 4.83331 12.9415 3.09998 9.99987 3.09998C7.0582 3.09998 4.31654 4.83331 2.4082 7.83331C1.6582 9.00831 1.6582 10.9833 2.4082 12.1583C4.31654 15.1583 7.0582 16.8916 9.99987 16.8916Z" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg></ListItemIcon>
                                                <ListItemText primary={t("actions.view")} />
                                            </ListItemButton>
                                        </ListItem>
                                    )}
                                    {editUrl && (
                                        <ListItem className="menu__item action__item">
                                            <ListItemButton
                                                component={RouterLink}
                                                to={editUrl}
                                                onClick={() => setOpen(false)}
                                                sx={{ m: 0, border: "none" }}
                                            >
                                                <ListItemIcon><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.05 3.00002L4.20829 10.2417C3.94996 10.5167 3.69996 11.0584 3.64996 11.4334L3.34162 14.1333C3.23329 15.1083 3.93329 15.775 4.89996 15.6084L7.58329 15.15C7.95829 15.0834 8.48329 14.8084 8.74162 14.525L15.5833 7.28335C16.7666 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2333 1.75002 11.05 3.00002Z" stroke="#9CA3B0" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M9.9082 4.20837C10.2665 6.50837 12.1332 8.26671 14.4499 8.50004" stroke="#9CA3B0" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M2.5 18.3334H17.5" stroke="#9CA3B0" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg></ListItemIcon>
                                                <ListItemText primary={t("actions.edit")} />
                                            </ListItemButton>
                                        </ListItem>
                                    )}

                                    {onEdit ? <ListItem className="menu__item action__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onEdit)}>
                                            <ListItemIcon>
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11.05 3.00002L4.20829 10.2417C3.94996 10.5167 3.69996 11.0584 3.64996 11.4334L3.34162 14.1333C3.23329 15.1083 3.93329 15.775 4.89996 15.6084L7.58329 15.15C7.95829 15.0834 8.48329 14.8084 8.74162 14.525L15.5833 7.28335C16.7666 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2333 1.75002 11.05 3.00002Z" stroke="#9CA3B0" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M9.9082 4.20837C10.2665 6.50837 12.1332 8.26671 14.4499 8.50004" stroke="#9CA3B0" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M2.5 18.3334H17.5" stroke="#9CA3B0" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </ListItemIcon>
                                            <ListItemText primary={t("actions.edit")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {onDelete ? <ListItem className="menu__item action__item delete__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onDelete)}>
                                            <ListItemIcon>
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M7.0835 4.14163L7.26683 3.04996C7.40016 2.25829 7.50016 1.66663 8.9085 1.66663H11.0918C12.5002 1.66663 12.6085 2.29163 12.7335 3.05829L12.9168 4.14163" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M15.7082 7.6167L15.1665 16.0084C15.0748 17.3167 14.9998 18.3334 12.6748 18.3334H7.32484C4.99984 18.3334 4.92484 17.3167 4.83317 16.0084L4.2915 7.6167" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M8.6084 13.75H11.3834" stroke="#848484" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M7.9165 10.4166H12.0832" stroke="#848484" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>

                                            </ListItemIcon>
                                            <ListItemText primary={!deleting ? t("actions.delete") : "Deleting"} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {onSuspend ? <ListItem className="menu__item action__item suspend__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onSuspend)}>
                                            <ListItemIcon>
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.99992 9.99984C12.3011 9.99984 14.1666 8.13436 14.1666 5.83317C14.1666 3.53198 12.3011 1.6665 9.99992 1.6665C7.69873 1.6665 5.83325 3.53198 5.83325 5.83317C5.83325 8.13436 7.69873 9.99984 9.99992 9.99984Z" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M2.84155 18.3333C2.84155 15.1083 6.04991 12.5 9.99991 12.5C10.7999 12.5 11.5749 12.6083 12.2999 12.8083" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M18.3334 14.9998C18.3334 15.2665 18.3001 15.5248 18.2334 15.7748C18.1584 16.1082 18.0251 16.4332 17.8501 16.7165C17.2751 17.6832 16.2167 18.3332 15.0001 18.3332C14.1417 18.3332 13.3668 18.0081 12.7834 17.4748C12.5334 17.2581 12.3168 16.9998 12.1501 16.7165C11.8418 16.2165 11.6667 15.6248 11.6667 14.9998C11.6667 14.0998 12.0251 13.2749 12.6084 12.6749C13.2168 12.0499 14.0667 11.6665 15.0001 11.6665C15.9834 11.6665 16.8751 12.0915 17.4751 12.7749C18.0084 13.3665 18.3334 14.1498 18.3334 14.9998Z" stroke="#9CA3B0" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M16.2416 14.9834H13.7583" stroke="#848484" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>


                                            </ListItemIcon>
                                            <ListItemText primary={!userStatus ? t("actions.suspend") : t("actions.unsuspend")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {onClone ? <ListItem className="menu__item action__item suspend__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onClone)}>
                                            <ListItemIcon>
                                                <Copy size={20} color={theme.palette.separator.darker} />
                                            </ListItemIcon>
                                            <ListItemText primary={t("actions.clone")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {onGenerateOtp ? <ListItem className="menu__item action__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onGenerateOtp)}>
                                            <ListItemIcon>
                                                <ArrangeHorizontal size={20} color={theme.palette.separator.darker} />
                                            </ListItemIcon>
                                            <ListItemText primary={t("actions.generate_otp")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {onSendPasswordReset ? <ListItem className="menu__item action__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onSendPasswordReset)}>
                                            <ListItemIcon>
                                                <Key size={20} color={theme.palette.separator.darker} />
                                            </ListItemIcon>
                                            <ListItemText primary={t("actions.send_password_reset")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {onStatus ? <ListItem className="menu__item action__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onStatus)}>
                                            <ListItemIcon>
                                                {courseStatus === "draft" ? <Send size={20} color={theme.palette.separator.darker} /> : <Slash size={20} color={theme.palette.separator.darker} />}
                                            </ListItemIcon>
                                            <ListItemText primary={courseStatus === "draft" ? t("actions.publish") : t("actions.unpublish")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {onMarkPaid ? <ListItem className="menu__item action__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onMarkPaid)}>
                                            <ListItemIcon>
                                                <TickCircle size={20} color={theme.palette.success.main} />
                                            </ListItemIcon>
                                            <ListItemText primary={t("actions.mark_as_paid", "Mark as Paid")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {onManageInstallment ? <ListItem className="menu__item action__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onManageInstallment)}>
                                            <ListItemIcon>
                                                <MoneyRecive size={20} color={theme.palette.separator.darker} />
                                            </ListItemIcon>
                                            <ListItemText primary={t("actions.manage_installment", "Installments")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {onRefund ? <ListItem className="menu__item action__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => handleMenuClick(onRefund)}>
                                            <ListItemIcon>
                                                <MoneyRemove size={20} color={theme.palette.error.main} />
                                            </ListItemIcon>
                                            <ListItemText primary={t("actions.refund", "Refund")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                    {file ? <ListItem className="menu__item action__item view__item">
                                        <ListItemButton sx={{
                                            m: 0,
                                            border: "none"
                                        }} onClick={() => dispatch(showAttachment(file))}>
                                            <ListItemIcon>
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.99992 9.99984C12.3011 9.99984 14.1666 8.13436 14.1666 5.83317C14.1666 3.53198 12.3011 1.6665 9.99992 1.6665C7.69873 1.6665 5.83325 3.53198 5.83325 5.83317C5.83325 8.13436 7.69873 9.99984 9.99992 9.99984Z" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M2.84155 18.3333C2.84155 15.1083 6.04991 12.5 9.99991 12.5C10.7999 12.5 11.5749 12.6083 12.2999 12.8083" stroke="#9CA3B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M18.3334 14.9998C18.3334 15.2665 18.3001 15.5248 18.2334 15.7748C18.1584 16.1082 18.0251 16.4332 17.8501 16.7165C17.2751 17.6832 16.2167 18.3332 15.0001 18.3332C14.1417 18.3332 13.3668 18.0081 12.7834 17.4748C12.5334 17.2581 12.3168 16.9998 12.1501 16.7165C11.8418 16.2165 11.6667 15.6248 11.6667 14.9998C11.6667 14.0998 12.0251 13.2749 12.6084 12.6749C13.2168 12.0499 14.0667 11.6665 15.0001 11.6665C15.9834 11.6665 16.8751 12.0915 17.4751 12.7749C18.0084 13.3665 18.3334 14.1498 18.3334 14.9998Z" stroke="#9CA3B0" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M16.2416 14.9834H13.7583" stroke="#848484" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>


                                            </ListItemIcon>
                                            <ListItemText primary={t("actions.view_file")} />
                                        </ListItemButton>
                                    </ListItem> : ""}
                                </List>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
            <AttachmentViewerDialog />
        </Box>
    );
}
