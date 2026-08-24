import { Box, Checkbox, Stack, Tooltip, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useGetAllCourseQuery } from "../../../../services/courseApi";
import { useGetAllBundleQuery, useGetAllIndividualTestQuery } from "../../../../services/questionApi";
import { useCourseFilter } from "../../../../store/useCourseFilter";
import type { CourseProps } from "../../../../types/course";
import type { SetProps, TestProps } from "../../../../types/question";
import type { EnrollmentType } from "../../../../types/transaction";
import { formatDate } from "../../../../utils/dateFormat";
import ActionIconVisible from "../../../molecules/Action/ActionIconVisible";
import TabController from "../../../molecules/TabController";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import ActiveFilterBar from "../../../organism/ActiveFilterBar";
import EmptyRoute from "../../../organism/EmptyRoute";
import { CourseFilter } from "../../../organism/Filter/CourseFilter";
import TableFilter from "../../../organism/TableFilter";

export default function AllEntrollments() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<EnrollmentType>("course");
    const [search, setSearch] = useState<string>("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 8 });

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
    } = useCourseFilter({ persistOnMount: true, namespace: "enrollments" });

    const categoryFilter = getCategoryFilterParams();

    const courseTypes = [
        { value: "free", label: "Free" },
        { value: "subscription", label: "Subscription" },
        { value: "expiry", label: "Expiry" }
    ];

    const { data: courseData, isLoading: loadingCourses } = useGetAllCourseQuery(
        { ...qp, search, categoryFilter: { ...categoryFilter }, status: "published" },
    );
    const { data: testData, isLoading: loadingTests } = useGetAllIndividualTestQuery(
        { ...qp, search },
    );
    const { data: bundleData, isLoading: loadingBundles } = useGetAllBundleQuery(
        { ...qp, search },
    );

    useEffect(() => {
        resetFilters();
    }, []);

    const handleTabChange = (tab: EnrollmentType) => {
        setActiveTab(tab);
        setSearch("");
        setQp({ pageIndex: 1, pageSize: 8 });
    };

    // ── Course columns ──────────────────────────────────────────────────────
    const courseColumns = useMemo<ColumnDef<CourseProps>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox color="primary" />
                    <Typography fontWeight={500}>S.No.</Typography>
                </Stack>
            ),
            accessorKey: "sno",
            cell: ({ row }) => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox color="primary" />
                    <Typography fontWeight={500}>{(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
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
                <Typography fontWeight={500}>{row.original.marked_price || "N/A"}</Typography>
            ),
        },
        {
            header: "Subjects",
            accessorKey: "subjects",
            cell: ({ row }) => (
                <Typography fontWeight={500}>{row.original.subjects || "N/A"}</Typography>
            ),
        },
        {
            header: "Enrolled Students",
            accessorKey: "enrolled_students",
            cell: ({ row }) => (
                <Typography>{row.original.enrolled_students || "N/A"}</Typography>
            ),
        },
        {
            header: "Created Date",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography fontWeight={500}>{formatDate(row.original?.created_at || "")}</Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <ActionIconVisible
                    onView={() => navigate(PATH.COURSE_MANAGEMENT.COURSES.ANALYTICS.ROOT(row.original.id))}
                />
            ),
        },
    ], [navigate, qp]);

    // ── Test columns ────────────────────────────────────────────────────────
    const testColumns = useMemo<ColumnDef<TestProps>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox color="primary" />
                    <Typography fontWeight={500}>S.No.</Typography>
                </Stack>
            ),
            accessorKey: "sno",
            cell: ({ row }) => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox color="primary" />
                    <Typography fontWeight={500}>{(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
                </Stack>
            ),
            size: 80,
        },
        {
            header: "Test Name",
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
            header: "Test Type",
            accessorKey: "test_type",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">
                    {row.original.test_type || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Price",
            accessorKey: "price",
            cell: ({ row }) => (
                <Typography fontWeight={500}>{row.original.price || "N/A"}</Typography>
            ),
        },
        {
            header: "Total Questions",
            accessorKey: "total_questions",
            cell: ({ row }) => (
                <Typography fontWeight={500}>{row.original.total_questions ?? "N/A"}</Typography>
            ),
        },
        {
            header: "Enrolled Students",
            accessorKey: "no_of_students",
            cell: ({ row }) => (
                <Typography>{row.original.no_of_students ?? "N/A"}</Typography>
            ),
        },
        {
            header: "Created Date",
            accessorKey: "created_at",
            cell: ({ row }) => (
                <Typography fontWeight={500}>{formatDate(row.original?.created_at || "")}</Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <ActionIconVisible
                    onView={() => navigate(PATH.ENROLLMENT.TEST_ANALYTICS.ROOT(row.original.id))}
                />
            ),
        },
    ], [navigate, qp]);

    // ── Bundle columns ──────────────────────────────────────────────────────
    const bundleColumns = useMemo<ColumnDef<SetProps>[]>(() => [
        {
            header: () => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox color="primary" />
                    <Typography fontWeight={500}>S.No.</Typography>
                </Stack>
            ),
            accessorKey: "sno",
            cell: ({ row }) => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox color="primary" />
                    <Typography fontWeight={500}>{(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography>
                </Stack>
            ),
            size: 80,
        },
        {
            header: "Bundle Name",
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
            header: "Price",
            accessorKey: "price",
            cell: ({ row }) => (
                <Typography fontWeight={500}>{row.original.marked_price || row.original.price || "N/A"}</Typography>
            ),
        },
        {
            header: "Tests Included",
            accessorKey: "set_count",
            cell: ({ row }) => (
                <Typography fontWeight={500}>{row.original.set_count || "N/A"}</Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">{row.original.status || "N/A"}</Typography>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <ActionIconVisible
                    onView={() => navigate(PATH.ENROLLMENT.BUNDLE_ANALYTICS.ROOT(row.original.id))}
                />
            ),
        },
    ], [navigate, qp]);

    const isLoading = activeTab === "course" ? loadingCourses : activeTab === "test" ? loadingTests : loadingBundles;
    const courses = courseData?.data?.data || [];
    const tests = testData?.data?.data || [];
    const bundles = bundleData?.data?.data || [];
    const activeData = activeTab === "course" ? courses : activeTab === "test" ? tests : bundles;
    const totalPages =
        activeTab === "course" ? courseData?.data?.pagination?.total_pages || 0
            : activeTab === "test" ? testData?.data?.pagination?.total_pages || 0
                : bundleData?.data?.pagination?.total_pages || 0;

    const emptyLabel = activeTab === "course" ? "course" : activeTab === "test" ? "test" : "bundle";

    return (
        <div className="all__enrollment__root">
            <div className="page__top">
                <TabController
                    currentActive={activeTab}
                    setActiveTab={handleTabChange}
                    options={[
                        { label: t("messages.course") || "Course", value: "course" },
                        { label: t("messages.test") || "Test", value: "test" },
                        { label: t("messages.bundle") || "Bundle", value: "bundle" },
                    ]}
                />
                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    onFilter={activeTab === "course" ? () => setFilterDialogOpen(true) : undefined}
                />
                <ActiveFilterBar pills={appliedPills} onClearAll={resetFilters} />
            </div>
            {!isLoading && !activeData.length ? (
                <EmptyRoute
                    title={`No ${emptyLabel.charAt(0).toUpperCase() + emptyLabel.slice(1)} Found`}
                    message={`We couldn't find any ${emptyLabel}s matching "${search}".`}
                />
            ) : (
                <>
                    <Box className="table__wrapper h-full" sx={{ overflow: "auto" }}>
                        {activeTab === "course" && (
                            <CustomTable data={courses} columns={courseColumns} loading={loadingCourses} />
                        )}
                        {activeTab === "test" && (
                            <CustomTable data={tests} columns={testColumns} loading={loadingTests} />
                        )}
                        {activeTab === "bundle" && (
                            <CustomTable data={bundles} columns={bundleColumns} loading={loadingBundles} />
                        )}
                    </Box>
                    <TablePagination qp={qp} setQp={setQp} totalPages={totalPages} />
                </>
            )}
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
        </div>
    );
}
