import { Box, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
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

type Qp = { pageIndex: number; pageSize: number };

type PagedResponse<T> = { data?: { data?: T[]; pagination?: { total_pages?: number } } };

type PagedSection<T> = {
    rows: T[];
    totalPages: number;
    loading: boolean;
    isError: boolean;
    isEmpty: boolean;
};

/**
 * Turns a paginated RTK Query result into something a table section can render safely.
 *
 * The section used to swap itself for an empty state whenever the current page came back with
 * zero rows — and the empty state takes the pagination controls down with it, so a page that
 * legitimately holds no records (or a request that failed) left the section permanently blank
 * with no way back to page 1. A list is only "empty" when the server says it has no pages at
 * all; anything else keeps the table and its pagination on screen.
 */
function usePagedSection<T>(
    result: {
        data?: PagedResponse<T>;
        isFetching: boolean;
        isError: boolean;
        isUninitialized: boolean;
    },
    skipped: boolean,
): PagedSection<T> {
    const lastTotalPages = useRef(0);
    const seenResponse = useRef(false);

    const rows = result.data?.data?.data;
    const totalPages = result.data?.data?.pagination?.total_pages;

    if (totalPages !== undefined) lastTotalPages.current = totalPages;
    if (result.data !== undefined || result.isError) seenResponse.current = true;

    // The very first render of a page sits in `uninitialized` for a frame before the request is
    // dispatched — show the skeleton through it rather than flashing an empty table.
    const loading = result.isFetching || (!skipped && !seenResponse.current && result.isUninitialized);
    const resolvedTotalPages = totalPages ?? lastTotalPages.current;

    return {
        rows: rows ?? [],
        totalPages: resolvedTotalPages,
        loading,
        isError: result.isError,
        isEmpty: seenResponse.current && !loading && !result.isError && resolvedTotalPages === 0 && !rows?.length,
    };
}

/** Row number that keeps counting across pages instead of restarting at 1 on every page. */
function serialNo(qp: Qp, index: number) {
    return (qp.pageIndex - 1) * qp.pageSize + index + 1;
}

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

function TableSection<T extends object>({
    title,
    section,
    columns,
    qp,
    setQp,
    emptyTitle,
    emptyMessage,
}: {
    title: string;
    section: PagedSection<T>;
    columns: ColumnDef<T, any>[];
    qp: Qp;
    setQp: (qp: Qp) => void;
    emptyTitle: string;
    emptyMessage: string;
}) {
    return (
        <Box>
            <Typography variant="h5" fontWeight={600} mb={2}>{title}</Typography>
            {section.isEmpty
                ? <EmptyRoute title={emptyTitle} message={emptyMessage} />
                : <>
                    {section.isError && (
                        <Typography variant="body2" color="error" mb={1}>
                            Couldn't load this page. Pick another page or reload.
                        </Typography>
                    )}
                    <CustomTable data={section.rows} columns={columns} loading={section.loading} />
                    <TablePagination qp={qp} setQp={setQp} totalPages={section.totalPages} />
                </>
            }
        </Box>
    );
}

export default function CoursesTab() {
    const { id } = useParams();
    const uid = Number(id);

    const [courseQp, setCourseQp] = useState<Qp>({ pageIndex: 1, pageSize: 10 });
    const [testQp, setTestQp] = useState<Qp>({ pageIndex: 1, pageSize: 10 });
    const [bundleQp, setBundleQp] = useState<Qp>({ pageIndex: 1, pageSize: 10 });

    const { data: analyticsData, isLoading: analyticsLoading } = useGetUserEnrolledCourseAnalyticsQuery({ id: uid }, { skip: !uid });

    const courseSection = usePagedSection<CourseProps>(useGetUserPurchasedCourseQuery({ ...courseQp, id: uid }, { skip: !uid }), !uid);
    const testSection = usePagedSection<UserEnrolledTest>(useGetUserEnrolledTestsQuery({ id: uid, ...testQp }, { skip: !uid }), !uid);
    const bundleSection = usePagedSection<UserEnrolledBundle>(useGetUserEnrolledBundlesQuery({ id: uid, ...bundleQp }, { skip: !uid }), !uid);

    const courseColumns = useMemo<ColumnDef<CourseProps>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => <Typography variant="subtitle1" fontWeight={500}>{serialNo(courseQp, row.index)}</Typography>,
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
    ], [courseQp]);

    const testColumns = useMemo<ColumnDef<UserEnrolledTest>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => <Typography variant="subtitle1" fontWeight={500}>{serialNo(testQp, row.index)}</Typography>,
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
    ], [testQp]);

    const bundleColumns = useMemo<ColumnDef<UserEnrolledBundle>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => <Typography variant="subtitle1" fontWeight={500}>{serialNo(bundleQp, row.index)}</Typography>,
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
    ], [bundleQp]);

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

            <TableSection
                title="Enrolled Courses"
                section={courseSection}
                columns={courseColumns}
                qp={courseQp}
                setQp={setCourseQp}
                emptyTitle="No Enrolled Courses"
                emptyMessage="This user has not enrolled in any courses yet."
            />

            <TableSection
                title="Enrolled Tests"
                section={testSection}
                columns={testColumns}
                qp={testQp}
                setQp={setTestQp}
                emptyTitle="No Enrolled Tests"
                emptyMessage="This user has not enrolled in any tests yet."
            />

            <TableSection
                title="Enrolled Bundles"
                section={bundleSection}
                columns={bundleColumns}
                qp={bundleQp}
                setQp={setBundleQp}
                emptyTitle="No Enrolled Bundles"
                emptyMessage="This user has not enrolled in any bundles yet."
            />
        </Box>
    );
}
