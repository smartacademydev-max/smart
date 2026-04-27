import { Box, Button, Checkbox, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { Add } from "iconsax-reactjs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PATH } from "../../../../../routes/PATH";
import { useDeleteLiveClassMutation, useGetAllLiveClassQuery } from "../../../../../services/liveClass";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import { useCourseFilter } from "../../../../../store/useCourseFilter";
import { type LiveClassPayload, type liveClassTabType } from "../../../../../types/liveClass";
import { formatDate } from "../../../../../utils/dateFormat";
import { useGetStatusStyle } from "../../../../../utils/getStyleBasedOnStatus";
import Actions from "../../../../molecules/Action";
import TabController from "../../../../molecules/TabController";
import CustomTable from "../../../../molecules/Table";
import TablePagination from "../../../../molecules/Table/Pagination";
import ConfirmationDialog from "../../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../../organism/EmptyRoute";
import { CourseFilter } from "../../../../organism/Filter/CourseFilter";
import PageHeader from "../../../../organism/PageHeader";
import type { LayoutProps } from "../../../../organism/TableFilter";
import TableFilter from "../../../../organism/TableFilter";
import LiveClassGrid from "./LiveClassGrid";

export default function AllLiveClassList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [selectedRows, setSelectedRows] = useState<Set<number | string>>(new Set());
  const [search, setSearch] = useState<string>("");
  const [qp, setQp] = useState({
    pageIndex: 1,
    pageSize: 8,
  })
  const [openConfirm, setOpenConfirm] = useState(false);
  const [liveClassToDelete, setLiveClassToDelete] = useState<string[]>([]);
  const [layout, setLayout] = useState<LayoutProps>("table");
  const [activeTab, setActiveTab] = useState<liveClassTabType>("ongoing");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [days, setDays] = useState<number | null>(null);

  const getStatusStyle = useGetStatusStyle();

  const {
    selections,
    megaCategories,
    categories,
    subCategories,
    positions,
    loadingMegaCategory,
    handleCategoryChange,
    handleApplyFilter,
    resetFilters,
    getCategoryFilterParams,
    filterDialogOpen,
    setFilterDialogOpen
  } = useCourseFilter();

  const categoryFilter = getCategoryFilterParams();

  const { data, isLoading, isFetching } = useGetAllLiveClassQuery({
    ...qp,
    search: search,
    status: activeTab,
    ...customRange,
    days,
    categoryFilter: { ...categoryFilter },
  });
  const { data: ongoingData } = useGetAllLiveClassQuery({ pageIndex: 1, pageSize: 1, search: "", status: "ongoing" });
  const { data: upcomingData } = useGetAllLiveClassQuery({ pageIndex: 1, pageSize: 1, search: "", status: "upcoming" });
  const { data: endedData } = useGetAllLiveClassQuery({ pageIndex: 1, pageSize: 1, search: "", status: "ended" });
  const [deleteLiveClass, { isLoading: deleting }] = useDeleteLiveClassMutation();

  const liveClasses = data?.data?.data || [];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(liveClasses.map((liveClass) => Number(liveClass.id)));
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

  const isAllSelected = liveClasses.length > 0 && selectedRows.size === liveClasses.length;
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < liveClasses.length;

  const openDeleteConfirmation = (selectedCourseIds: string[]) => {
    setLiveClassToDelete(selectedCourseIds);
    setOpenConfirm(true);
  };

  const handleCourseDeletion = async () => {
    try {
      const response = await deleteLiveClass({
        body: liveClassToDelete,
      }).unwrap();

      dispatch(
        showToast({
          message: response.message || "Live Class deleted successfully",
          severity: "success",
        })
      );
      setSelectedRows(new Set());
      setOpenConfirm(false);
      setLiveClassToDelete([]);
    } catch (e: any) {
      dispatch(
        showToast({
          message: e?.data?.message || "Unable to delete live class.",
          severity: "error",
        })
      );
      setOpenConfirm(false);
    }
  }


  const columns = useMemo<ColumnDef<LiveClassPayload>[]>(() => [
    {
      header: () => (
        <Stack sx={{ gap: "10px" }}>
          <Checkbox
            checked={isAllSelected}
            indeterminate={isSomeSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            color="primary"
          />
          < Typography fontWeight={500} >S.No.</Typography >
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
          < Typography fontWeight={500} >   {(qp.pageIndex - 1) * qp.pageSize + row.index + 1}</Typography >
        </Stack >
      ),
      size: 80,
    },
    {
      header: "Live Class Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <Typography fontWeight={500} className="capitalize">
          {row.original.name || "N/A"}
        </Typography>
      ),
    },
    {
      header: activeTab !== "ended" ? "Enrolled Students" : "Attended By",
      accessorKey: "enrolled_students",
      cell: ({ row }) => (
        <Typography fontWeight={500} className="capitalize">
          {activeTab == "ended" ? row.original.participants_count || 0 : row.original.active_students || 0} Students
        </Typography>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {

        return (
          <Typography fontWeight={500} className="capitalize status" sx={{
            ...getStatusStyle(row.original.status || "ongoing")
          }}>
            {row.original?.status}
          </Typography>
        )
      },
    },
    {
      header: "Start Class",
      accessorKey: "start_url",
      cell: ({ row }) => {

        return (
          <Button
            className="capitalize"
            variant="contained"
            color="primary"
            onClick={() => {
              if (row.original.status !== "ended") {
                window.open(row.original.start_url, "_blank");
              }
            }}
            disabled={row.original.status === "ended"}
          >
            Start Meeting
          </Button>

        )
      },
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
          editUrl={PATH.COURSE_MANAGEMENT.LIVE_CLASSES.EDIT_LIVE_CLASS.ROOT(row.original.id)}
          viewUrl={PATH.COURSE_MANAGEMENT.LIVE_CLASSES.EDIT_LIVE_CLASS.ROOT(row.original.id)}
          onDelete={() => openDeleteConfirmation([row.original.id?.toString() || ""])}
        />
      ),
    },
  ], [selectedRows, isAllSelected, isSomeSelected, qp, activeTab])


  const handleResetFilter = () => {
    resetFilters();
    setCustomRange({ startDate: "", endDate: "" });
    setSearch("");
    setDays(null);
    setQp((prev) => ({ ...prev, pageIndex: 1 }));
  };

  const LiveClassTabs: { label: string; value: liveClassTabType }[] = [
    {
      label: `Live Class (${ongoingData?.data?.pagination?.total || 0})`,
      value: `ongoing`
    },
    {
      label: `Upcoming Classes (${upcomingData?.data?.pagination?.total || 0})`,
      value: `upcoming`
    },
    {
      label: `Past Class (${endedData?.data?.pagination?.total || 0})`,
      value: `ended`
    },
  ]
  return (
    <div className="live__class__root h-full flex flex-col justify-between">
      <div className="page__top">
        <PageHeader
          breadcrumb={[
            {
              title: t("menus.course_management.live_classes.root"),
              icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM14.66 13.73L13.38 14.47L12.1 15.21C10.45 16.16 9.1 15.38 9.1 13.48V12V10.52C9.1 8.61 10.45 7.84 12.1 8.79L13.38 9.53L14.66 10.27C16.31 11.22 16.31 12.78 14.66 13.73Z" fill="#1D82F5" />
              </svg>
              ),
            }
          ]}
          cta={
            {
              icon: <Add />,
              url: PATH.COURSE_MANAGEMENT.LIVE_CLASSES.CREATE_LIVE_CLASS.ROOT,
              label: t("messages.empty_states.live_class.action"),
            }
          }
        />
        <TableFilter
          search={search}
          setSearch={setSearch}
          selectedRows={selectedRows}
          handleRoleDelete={openDeleteConfirmation}
          layout={layout}
          onFilter={() => setFilterDialogOpen(true)}
          setLayout={setLayout}
          customRange={customRange}
          setCustomRange={setCustomRange}
          setDays={setDays}
          handleResetFilter={handleResetFilter}
        />
        <TabController
          options={LiveClassTabs}
          currentActive={activeTab}
          setActiveTab={setActiveTab}

        />
      </div>
      {!isLoading && !liveClasses.length ? (
        <EmptyRoute
          title="No Live Class Found"
          message="Start adding courses to organize your learning content. Use the button below to create your first course."
        />
      ) : (
        <>
          <Box className="table__wrapper h-full" sx={{
            overflow: "auto"
          }}>

            {layout === "table" ? (
              <CustomTable
                data={data?.data?.data || []}
                columns={columns}
                loading={isLoading || isFetching}
              />
            ) : (
              <LiveClassGrid liveClasses={liveClasses} />
            )}
          </Box>

          <TablePagination
            qp={qp}
            setQp={setQp}
            totalPages={data?.data?.pagination?.total_pages || 0}
          />
        </>
      )}


      <ConfirmationDialog
        open={openConfirm}
        setOpen={setOpenConfirm}
        title={"Delete Live Class"}
        description={"Are you sure you want to delete the selected live Class(s)? This action cannot be undone."}
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
        selections={selections}
        onChange={handleCategoryChange}
        loadingMegaCategory={loadingMegaCategory}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
      />
    </div>
  )
}
