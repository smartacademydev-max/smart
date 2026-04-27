import { Tooltip, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useGetUserPurchasedCourseQuery } from "../../../../services/transactionApi";
import type { CourseProps } from "../../../../types/course";
import { getCourseStatus } from "../../../../utils/statusMap";
import StatusPill from "../../../atoms/StatusPill";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";
import EmptyRoute from "../../../organism/EmptyRoute";

export default function UserEnrolledCourses() {
    const { id } = useParams();
    const { t } = useTranslation();
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 10,
    });
    const { data, isLoading } = useGetUserPurchasedCourseQuery({ ...qp, id: Number(id) });

    const courses = data?.data?.data || [];


    const columns = useMemo<ColumnDef<CourseProps>[]>(() => [
        {
            header: "S.No",
            accessorKey: "index",
            cell: ({ row }) => (
                <Typography fontWeight={500} variant="subtitle1">
                    {row.index + 1 || "N/A"}
                </Typography>
            ),
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
            header: "Price",
            accessorKey: "price",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {row.original.sale_price || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Purchased Date",
            accessorKey: "purchased_date",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {row.original.started_from || "N/A"}
                </Typography>
            ),
        },
        {
            header: "End Date",
            accessorKey: "end_date",
            cell: ({ row }) => (
                <Typography variant="subtitle1" className="capitalize">
                    {row.original?.ends_at || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Status",
            accessorKey: "course_completion_status",
            cell: ({ row }) => {
                const progress = Number(row.original?.progress ?? 0);

                const getLabel = () => {
                    if (progress === 0) return "Not Started";
                    if (progress === 100) return "Completed";
                    return "In Progress";
                };

                return (
                    <StatusPill
                        status={getLabel()}
                        variant={getCourseStatus(progress)}
                    />
                );
            },
        },


    ], [qp])


    return (
        <div className="user__enrolled__course__root">
            <Typography variant="h5" className="mb-4!" fontWeight={600}>{t("messages.enrolled_courses")}</Typography>
            {!isLoading && !courses.length ? <EmptyRoute
                title="No Enrolled Courses"
                message="This user has not enrolled in any courses yet."
            /> : <>
                <CustomTable
                    data={courses}
                    columns={columns}
                    loading={isLoading} />
                <TablePagination
                    qp={qp}
                    setQp={setQp}
                    totalPages={data?.data?.pagination?.total_pages || 0}
                />
            </>}
        </div>
    )
}
