import { Box, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetUserPurchasedCourseQuery } from "../../../../../services/transactionApi";
import {
    useGetUserEnrolledBundlesQuery,
    useGetUserEnrolledCourseAnalyticsQuery,
    useGetUserEnrolledTestsQuery,
} from "../../../../../services/userApi";
import type { CourseProps } from "../../../../../types/course";
import type { UserEnrolledBundle, UserEnrolledTest } from "../../../../../types/userProfile";
import { formatDateForDisplay } from "../../../../../utils/dateFormat";
import { getCourseStatus } from "../../../../../utils/statusMap";
import StatusPill from "../../../../atoms/StatusPill";
import CustomTable from "../../../../molecules/Table";
import TablePagination from "../../../../molecules/Table/Pagination";
import DashboardAnalyticsCard from "../../../../organism/Cards/DashboardAnalyticsCard";
import DashboardAnalyticsLoading from "../../../../organism/Cards/DashboardAnalyticsCard/Loading";
import EmptyRoute from "../../../../organism/EmptyRoute";

function ProgressCell({ value }: { value?: number }) {
    const val = Number(value ?? 0);
    return (
        <Box sx={{ minWidth: 110 }}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">{val}%</Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                value={val}
                sx={{ height: 6, borderRadius: 3 }}
                color={val >= 80 ? "success" : val >= 20 ? "info" : "error"}
            />
        </Box>
    );
}

export default function CoursesTab() {
    const { id } = useParams();
    const uid = Number(id);

    const [courseQp, setCourseQp] = useState({ pageIndex: 1, pageSize: 10 });
    const [testQp, setTestQp] = useState({ pageIndex: 1, pageSize: 10 });
    const [bundleQp, setBundleQp] = useState({ pageIndex: 1, pageSize: 10 });

    const { data: analyticsData, isLoading: analyticsLoading } = useGetUserEnrolledCourseAnalyticsQuery({ id: uid }, { skip: !uid });
    const { data: courseData, isLoading: courseLoading } = useGetUserPurchasedCourseQuery({ ...courseQp, id: uid }, { skip: !uid });
    const { data: testData, isLoading: testLoading } = useGetUserEnrolledTestsQuery({ id: uid, ...testQp }, { skip: !uid });
    const { data: bundleData, isLoading: bundleLoading } = useGetUserEnrolledBundlesQuery({ id: uid, ...bundleQp }, { skip: !uid });

    const courses = courseData?.data?.data ?? [];
    const tests = testData?.data?.data ?? [];
    const bundles = bundleData?.data?.data ?? [];

    const courseColumns = useMemo<ColumnDef<CourseProps>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => <Typography variant="subtitle1" fontWeight={500}>{row.index + 1}</Typography>,
        },
        {
            header: "Course Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Tooltip title={row.original.name} arrow>
                    <Typography variant="subtitle1" fontWeight={500} className="line-clamp-1">{row.original.name || "N/A"}</Typography>
                </Tooltip>
            ),
        },
        {
            header: "Price",
            accessorKey: "sale_price",
            cell: ({ row }) => <Typography variant="subtitle1">{row.original.sale_price || "N/A"}</Typography>,
        },
        {
            header: "Enrolled On",
            accessorKey: "started_from",
            cell: ({ row }) => <Typography variant="subtitle1">{formatDateForDisplay(row.original.started_from) || "N/A"}</Typography>,
        },
        {
            header: "Expires On",
            accessorKey: "ends_at",
            cell: ({ row }) => <Typography variant="subtitle1">{formatDateForDisplay(row.original.ends_at) || "N/A"}</Typography>,
        },
        {
            header: "Progress",
            accessorKey: "progress",
            cell: ({ row }) => <ProgressCell value={row.original.progress} />,
        },
        {
            header: "Status",
            accessorKey: "course_completion_status",
            cell: ({ row }) => {
                const progress = Number(row.original.progress ?? 0);
                const label = progress === 0 ? "Not Started" : progress === 100 ? "Completed" : "In Progress";
                return <StatusPill status={label} variant={getCourseStatus(progress)} />;
            },
        },
    ], []);

    const testColumns = useMemo<ColumnDef<UserEnrolledTest>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => <Typography variant="subtitle1" fontWeight={500}>{row.index + 1}</Typography>,
        },
        {
            header: "Test Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Tooltip title={row.original.name} arrow>
                    <Typography variant="subtitle1" fontWeight={500} className="line-clamp-1">{row.original.name || "N/A"}</Typography>
                </Tooltip>
            ),
        },
        {
            header: "Type",
            accessorKey: "test_type",
            cell: ({ row }) => <Typography variant="subtitle1" className="capitalize">{row.original.test_type || "N/A"}</Typography>,
        },
        {
            header: "Full Mark",
            accessorKey: "full_mark",
            cell: ({ row }) => <Typography variant="subtitle1">{row.original.full_mark ?? "N/A"}</Typography>,
        },
        {
            header: "Pass Mark",
            accessorKey: "pass_mark",
            cell: ({ row }) => <Typography variant="subtitle1">{row.original.pass_mark ?? "N/A"}</Typography>,
        },
        {
            header: "Enrolled On",
            accessorKey: "started_from",
            cell: ({ row }) => <Typography variant="subtitle1">{formatDateForDisplay(row.original.started_from) || "N/A"}</Typography>,
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                const progress = Number(row.original.progress ?? 0);
                const label = progress === 0 ? "Not Started" : progress === 100 ? "Completed" : "In Progress";
                return <StatusPill status={label} variant={getCourseStatus(progress)} />;
            },
        },
    ], []);

    const bundleColumns = useMemo<ColumnDef<UserEnrolledBundle>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => <Typography variant="subtitle1" fontWeight={500}>{row.index + 1}</Typography>,
        },
        {
            header: "Bundle Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Tooltip title={row.original.name} arrow>
                    <Typography variant="subtitle1" fontWeight={500} className="line-clamp-1">{row.original.name || "N/A"}</Typography>
                </Tooltip>
            ),
        },
        {
            header: "Enrolled On",
            accessorKey: "started_from",
            cell: ({ row }) => <Typography variant="subtitle1">{formatDateForDisplay(row.original.started_from) || "N/A"}</Typography>,
        },
        {
            header: "Expires On",
            accessorKey: "ends_at",
            cell: ({ row }) => <Typography variant="subtitle1">{formatDateForDisplay(row.original.ends_at) || "N/A"}</Typography>,
        },
        {
            header: "Progress",
            accessorKey: "progress",
            cell: ({ row }) => <ProgressCell value={row.original.progress} />,
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: ({ row }) => {
                const progress = Number(row.original.progress ?? 0);
                const label = progress === 0 ? "Not Started" : progress === 100 ? "Completed" : "In Progress";
                return <StatusPill status={label} variant={getCourseStatus(progress)} />;
            },
        },
    ], []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4, pb: 4 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2, p: 2 }}>
                {analyticsLoading
                    ? Array.from({ length: 3 }).map((_, i) => <DashboardAnalyticsLoading key={i} />)
                    : analyticsData?.data?.map((item) => (
                        <DashboardAnalyticsCard key={item.title} data={{ title: item.title, value: item.value.toLocaleString(), description: "", type: item.type }} />
                    ))
                }
            </Box>

            <Box>
                <Typography variant="h5" fontWeight={600} mb={2}>Enrolled Courses</Typography>
                {!courseLoading && !courses.length
                    ? <EmptyRoute title="No Enrolled Courses" message="This user has not enrolled in any courses yet." />
                    : <>
                        <CustomTable data={courses} columns={courseColumns} loading={courseLoading} />
                        <TablePagination qp={courseQp} setQp={setCourseQp} totalPages={courseData?.data?.pagination?.total_pages ?? 0} />
                    </>
                }
            </Box>

            <Box>
                <Typography variant="h5" fontWeight={600} mb={2}>Enrolled Tests</Typography>
                {!testLoading && !tests.length
                    ? <EmptyRoute title="No Enrolled Tests" message="This user has not enrolled in any tests yet." />
                    : <>
                        <CustomTable data={tests} columns={testColumns} loading={testLoading} />
                        <TablePagination qp={testQp} setQp={setTestQp} totalPages={testData?.data?.pagination?.total_pages ?? 0} />
                    </>
                }
            </Box>

            <Box>
                <Typography variant="h5" fontWeight={600} mb={2}>Enrolled Bundles</Typography>
                {!bundleLoading && !bundles.length
                    ? <EmptyRoute title="No Enrolled Bundles" message="This user has not enrolled in any bundles yet." />
                    : <>
                        <CustomTable data={bundles} columns={bundleColumns} loading={bundleLoading} />
                        <TablePagination qp={bundleQp} setQp={setBundleQp} totalPages={bundleData?.data?.pagination?.total_pages ?? 0} />
                    </>
                }
            </Box>
        </Box>
    );
}
