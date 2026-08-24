import { Add } from "@mui/icons-material";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControlLabel, IconButton, List, ListItem, Stack, Tooltip, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Copy } from "iconsax-reactjs";
import { PATH } from "../../../../../routes/PATH";
import { useChangeCourseStatusMutation, useCloneCourseMutation, useDeleteCourseMutation, useGetAllCourseQuery } from "../../../../../services/courseApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import { useCourseFilter } from "../../../../../store/useCourseFilter";
import type { courseClonePropertyProps, CourseProps } from "../../../../../types/course";
import { formatDate } from "../../../../../utils/dateFormat";
import Actions from "../../../../molecules/Action";
import TabController from "../../../../molecules/TabController";
import CustomTable from "../../../../molecules/Table";
import TablePagination from "../../../../molecules/Table/Pagination";
import ActiveFilterBar from "../../../../organism/ActiveFilterBar";
import ConfirmationDialog from "../../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../../organism/EmptyRoute";
import { CourseFilter } from "../../../../organism/Filter/CourseFilter";
import PageHeader from "../../../../organism/PageHeader";
import type { LayoutProps } from "../../../../organism/TableFilter";
import TableFilter from "../../../../organism/TableFilter";
import AllCourseGrid from "./AllCourseGrid";

export default function AllCourse() {
    const cloneOptions = [
        { label: "Curriculums", value: "curriculums" },
        { label: "Audio", value: "audios" },
        { label: "Video", value: "videos" },
        { label: "Notes", value: "notes" },
        { label: "Live Classes", value: "live_classes" },
        { label: "Tests", value: "tests" },
    ];

    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());
    const [search, setSearch] = useState<string>("");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 8,
    });
    const [courseToClone, setCourseToClone] = useState<number | null>(null);
    const [openCloneDialog, setOpenCloneDialog] = useState(false);
    const [selectedCloneProperties, setSelectedCloneProperties] =
        useState<courseClonePropertyProps[]>([]);


    const [openConfirm, setOpenConfirm] = useState(false);
    const [coursesToDelete, setCoursesToDelete] = useState<string[]>([]);
    const [layout, setLayout] = useState<LayoutProps>("table");
    const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
    const [cloneCourse] = useCloneCourseMutation();

    const {
        selections,
        appliedPills,
        megaCategories,
        categories,
        subCategories,
        positions,
        teachers,
        loadingMegaCategory,
        searchTeacher,
        setSearchTeacher,
        handleCategoryChange,
        handleApplyFilter,
        resetFilters,
        getCategoryFilterParams,
        filterDialogOpen,
        setFilterDialogOpen
    } = useCourseFilter({ persistOnMount: true, namespace: "allcourse" });

    const categoryFilter = getCategoryFilterParams();

    const courseTypes = [
        { value: "free", label: "Free" },
        { value: "subscription", label: "Subscription" },
        { value: "expiry", label: "Expiry" }
    ];

    const { data, isLoading, isFetching } = useGetAllCourseQuery({
        ...qp,
        search,
        categoryFilter: { ...categoryFilter },
        status: activeTab
    });
    const [changeStatus] = useChangeCourseStatusMutation();

    const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation();

    const courses = data?.data?.data || [];

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(courses.map((course) => course.id || ''));
            setSelectedRows(allIds);
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: number | string, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedRows(newSelected);
    };

    const isAllSelected = courses.length > 0 && selectedRows.size === courses.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < courses.length;

    const openDeleteConfirmation = (selectedCourseIds: string[]) => {
        setCoursesToDelete(selectedCourseIds);
        setOpenConfirm(true);
    };

    const handleCourseDeletion = async () => {
        try {
            const response = await deleteCourse({
                body: coursesToDelete,
            }).unwrap();

            dispatch(
                showToast({
                    message: response.message || "Course deleted successfully",
                    severity: "success",
                })
            );
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setCoursesToDelete([]);
        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to delete course.",
                    severity: "error",
                })
            );
            setOpenConfirm(false);
        }
    }

    const handleCourseClone = async () => {
        if (!courseToClone) return;

        try {
            const response = await cloneCourse({
                id: courseToClone,
                properties: selectedCloneProperties
            }).unwrap();

            dispatch(
                showToast({
                    message: response?.message || "Course Cloned Successfully",
                    severity: "success"
                })
            );

            setOpenCloneDialog(false);
            setCourseToClone(null);
            setSelectedCloneProperties([]);

        } catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to Clone Course",
                    severity: "error"
                })
            );
        }
    };



    const handleCourseStatusChange = async (id: number) => {
        try {
            const response = await changeStatus({ body: [id] }).unwrap();
            dispatch(
                showToast({
                    message: response?.message || "Course Published Successfully",
                    severity: "success"
                })
            )
        }
        catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to Publish Course",
                    severity: "error"
                })
            )
        }
    }

    const columns = useMemo<ColumnDef<CourseProps>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        color="primary"
                    />
                    <Typography fontWeight={500}>S.No.</Typography>
                </Stack>
            ),
            accessorKey: "sno",
            cell: ({ row }) => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={selectedRows.has(row.original.id || '')}
                        onChange={(e) => handleSelectRow(row.original.id || '', e.target.checked)}
                        color="primary"
                    />
                    <Typography fontWeight={500}>  {(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
                </Stack>
            ),
            size: 80,
        },
        {
            header: "Course Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Tooltip title={row.original.name} arrow>
                    <Typography fontWeight={500} variant="subtitle1" className="line-clamp-1">
                        {row.original.name || "N/A"}
                    </Typography>
                </Tooltip>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => (
                <Tooltip title={`Click to change status to ${row.original.status === "published" ? "Draft" : "Publish"}`}>
                    <Button className="py-0.5! px-2! rounded-xl! capitalize!" sx={{
                        color: (theme) => theme.palette.primary.contrastText,
                        background: (theme) => row.original.status === "published" ? theme.palette.success.main : theme.palette.separator.darker
                    }} onClick={() => handleCourseStatusChange(Number(row.original.id))}>
                        <Typography variant="caption">{row.original.status || "N/A"}</Typography>
                    </Button>
                </Tooltip>
            ),
        },
        {
            header: "Course Type",
            accessorKey: "course_type",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.course_type || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Price",
            accessorKey: "price",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.marked_price || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Subjects",
            accessorKey: "subjects",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.subjects || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Enrolled Student",
            accessorKey: "enrolled_students",
            cell: ({ row }) => (
                <Typography >
                    {row.original.enrolled_students || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Created Date",
            accessorKey: "created_at",
            cell: ({ row }) => {
                return (
                    <Typography fontWeight={500} className="capitalize">
                        {formatDate(row.original?.created_at || "")}
                    </Typography>
                )
            },
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <Actions
                    deleting={deleting}
                    editUrl={PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.ROOT(row.original.id)}
                    viewUrl={PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.ROOT(row.original.id)}
                    onDelete={() => openDeleteConfirmation([row.original.id?.toString() || ""])}
                    onClone={() => {
                        setCourseToClone(Number(row.original.id));
                        setOpenCloneDialog(true);
                    }}
                    onStatus={() => handleCourseStatusChange(Number(row.original.id))}
                    courseStatus={row.original.status || "draft"}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, deleting, navigate, qp])



    return (
        <div className="course__root h-full flex flex-col justify-between">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[
                        {
                            title: t("menus.course_management.courses.root"),
                            icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 4.84969V16.7397C22 17.7097 21.21 18.5997 20.24 18.7197L19.93 18.7597C18.29 18.9797 15.98 19.6597 14.12 20.4397C13.47 20.7097 12.75 20.2197 12.75 19.5097V5.59969C12.75 5.22969 12.96 4.88969 13.29 4.70969C15.12 3.71969 17.89 2.83969 19.77 2.67969H19.83C21.03 2.67969 22 3.64969 22 4.84969Z" fill="#1D82F5" />
                                <path d="M10.7102 4.70969C8.88023 3.71969 6.11023 2.83969 4.23023 2.67969H4.16023C2.96023 2.67969 1.99023 3.64969 1.99023 4.84969V16.7397C1.99023 17.7097 2.78023 18.5997 3.75023 18.7197L4.06023 18.7597C5.70023 18.9797 8.01023 19.6597 9.87023 20.4397C10.5202 20.7097 11.2402 20.2197 11.2402 19.5097V5.59969C11.2402 5.21969 11.0402 4.88969 10.7102 4.70969ZM5.00023 7.73969H7.25023C7.66023 7.73969 8.00023 8.07969 8.00023 8.48969C8.00023 8.90969 7.66023 9.23969 7.25023 9.23969H5.00023C4.59023 9.23969 4.25023 8.90969 4.25023 8.48969C4.25023 8.07969 4.59023 7.73969 5.00023 7.73969ZM8.00023 12.2397H5.00023C4.59023 12.2397 4.25023 11.9097 4.25023 11.4897C4.25023 11.0797 4.59023 10.7397 5.00023 10.7397H8.00023C8.41023 10.7397 8.75023 11.0797 8.75023 11.4897C8.75023 11.9097 8.41023 12.2397 8.00023 12.2397Z" fill="#1D82F5" />
                            </svg>),
                        }
                    ]}
                    cta={{
                        icon: <Add />,
                        url: PATH.COURSE_MANAGEMENT.COURSES.CREATE_COURSE.ROOT,
                        label: t("messages.empty_states.courses.action"),
                    }}
                />
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows}
                    handleRoleDelete={openDeleteConfirmation}
                    layout={layout}
                    setLayout={setLayout}
                    onFilter={() => setFilterDialogOpen(true)}
                />
            </div>

            <ActiveFilterBar pills={appliedPills} onClearAll={resetFilters} />

            <TabController
                options={[
                    { label: "All Course", value: "all" },
                    { label: "Published", value: "published" },
                    { label: "Draft", value: "draft" }
                ]}
                currentActive={activeTab}
                setActiveTab={setActiveTab}
            />
            {
                !isLoading && !courses.length ? <EmptyRoute
                    title="No Course Found"
                    message={`We couldn't find any courses matching "${search}".`}
                /> : (
                    <>
                        <Box className="table__wrapper h-full" sx={{

                            overflow: "auto"
                        }}>
                            {layout === "table" ?
                                <>
                                    <CustomTable
                                        data={courses}
                                        columns={columns}
                                        loading={isLoading || isFetching}
                                    />
                                </> :
                                <AllCourseGrid
                                    data={courses}
                                    onDelete={openDeleteConfirmation}
                                    onClone={handleCourseClone}
                                />}
                        </Box>
                        <TablePagination
                            qp={qp}
                            setQp={setQp}
                            totalPages={data?.data?.pagination?.total_pages || 0}
                        />
                    </>
                )
            }


            <ConfirmationDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                title={"Delete Course"}
                description={"Are you sure you want to delete the selected course(s)? This action cannot be undone."}
                onSave={handleCourseDeletion}
                icon={(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z" fill="#1D82F5" />
                    <path d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14ZM13.6597 17.75H10.3297C9.91975 17.75 9.57975 17.41 9.57975 17C9.57975 16.59 9.91975 16.25 10.3297 16.25H13.6597C14.0697 16.25 14.4097 16.59 14.4097 17C14.4097 17.41 14.0697 17.75 13.6597 17.75ZM14.4997 13.75H9.49975C9.08975 13.75 8.74975 13.41 8.74975 13C8.74975 12.59 9.08975 12.25 9.49975 12.25H14.4997C14.9097 12.25 15.2497 12.59 15.2497 13C15.2497 13.41 14.9097 13.75 14.4997 13.75Z" fill="#1D82F5" />
                </svg>
                )}
            />

            <CourseFilter
                open={filterDialogOpen}
                onClose={() => setFilterDialogOpen(false)}
                megaCategories={megaCategories}
                categories={categories}
                subCategories={subCategories}
                positions={positions}
                teachers={teachers}
                selections={selections}
                onChange={handleCategoryChange}
                loadingMegaCategory={loadingMegaCategory}
                searchTeacher={searchTeacher}
                setSearchTeacher={setSearchTeacher}
                onApplyFilter={handleApplyFilter}
                onResetFilter={resetFilters}
                courseTypes={courseTypes || []}
            />

            <Dialog open={openCloneDialog}>
                <DialogContent className="py-8!  relative rounded-2xl" sx={{
                    boxShadow: "0 4px 20px 0 rgba(0, 8, 251, 0.20)",
                    maxWidth: "409px",
                }}>
                    <IconButton onClick={() => setOpenCloneDialog(false)} className="absolute! right-4 top-4">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.492 1.66675H6.50866C3.47533 1.66675 1.66699 3.47508 1.66699 6.50841V13.4834C1.66699 16.5251 3.47533 18.3334 6.50866 18.3334H13.4837C16.517 18.3334 18.3253 16.5251 18.3253 13.4917V6.50841C18.3337 3.47508 16.5253 1.66675 13.492 1.66675ZM12.8003 11.9167C13.042 12.1584 13.042 12.5584 12.8003 12.8001C12.6753 12.9251 12.517 12.9834 12.3587 12.9834C12.2003 12.9834 12.042 12.9251 11.917 12.8001L10.0003 10.8834L8.08366 12.8001C7.95866 12.9251 7.80033 12.9834 7.64199 12.9834C7.48366 12.9834 7.32533 12.9251 7.20033 12.8001C6.95866 12.5584 6.95866 12.1584 7.20033 11.9167L9.11699 10.0001L7.20033 8.08341C6.95866 7.84175 6.95866 7.44175 7.20033 7.20008C7.44199 6.95842 7.84199 6.95842 8.08366 7.20008L10.0003 9.11675L11.917 7.20008C12.1587 6.95842 12.5587 6.95842 12.8003 7.20008C13.042 7.44175 13.042 7.84175 12.8003 8.08341L10.8837 10.0001L12.8003 11.9167Z" fill="#E21D48" />
                        </svg>
                    </IconButton>
                    <Box sx={{
                        background: (theme) => theme.palette.primary.light
                    }} className="w-12 h-12 aspect-square rounded-full flex justify-center items-center mb-4">
                        <Copy />
                    </Box>
                    <Typography variant="h4" className="mb-1">Clone Course</Typography>
                    <Typography color="text.middle">Course Overview will be automatically cloned. Choose Other Options</Typography>
                    <Box className="mt-6 mb-4" sx={{
                        border: (theme) => `1px solid ${theme.palette.separator.dark}`
                    }} />
                    <List>
                        {cloneOptions.map((item) => (
                            <ListItem key={item.value} className="flex-row! justify-between">
                                {/* <ListItemText primary={item.label} /> */}
                                <FormControlLabel
                                    label={item.label}
                                    control={<Checkbox
                                        checked={selectedCloneProperties.includes(item.value as courseClonePropertyProps)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCloneProperties((prev) => [...prev, item.value as courseClonePropertyProps]);
                                            } else {
                                                setSelectedCloneProperties((prev) =>
                                                    prev.filter((val) => val !== item.value)
                                                );
                                            }
                                        }}
                                        color="primary"
                                    />}
                                />

                            </ListItem>
                        ))}
                    </List>

                    <DialogActions>
                        <Button fullWidth variant="contained" sx={{
                            background: (theme) => theme.palette.separator.dark,
                            color: (theme) => theme.palette.text.middle
                        }}
                            onClick={() => {
                                setOpenCloneDialog(false);
                                setCourseToClone(null);
                                setSelectedCloneProperties([])
                            }
                            }
                        >Cancel</Button>
                        <Button fullWidth variant="contained" color="primary" onClick={() => handleCourseClone()}>{isLoading ? "Saving" : "Yes"}</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </div>
    )
}