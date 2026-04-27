import { Checkbox, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../../../routes/PATH";
import { useGetListOfStudentSubmittedTestQuery, usePublishTestResultsMutation } from "../../../../../services/questionApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import type { StudentSubmitTestProps } from "../../../../../types/question";
import { msToHMS } from "../../../../../utils/parseDateTime";
import ActionIconVisible from "../../../../molecules/Action/ActionIconVisible";
import CustomTable from "../../../../molecules/Table";
import TablePagination from "../../../../molecules/Table/Pagination";
import ConfirmationDialog from "../../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../../organism/EmptyRoute";
import TableFilter from "../../../../organism/TableFilter";

export default function StudentResult({ id }: { id: string }) {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [qp, setQp] = useState({
		pageIndex: 1,
		pageSize: 10,
	});
	const [search, setSearch] = useState("");
	const [selectedRows, setSelectedRows] = useState<Set<number | string>>(
		new Set(),
	);
	const [openConfirm, setOpenConfirm] = useState(false);
	// const [resultToDelete, setResultToDelete] = useState<string[]>([]);

	const { data, isLoading } = useGetListOfStudentSubmittedTestQuery(
		{ id: Number(id), qp, search },
		{ skip: !id },
	);
	const [publishTestResults] = usePublishTestResultsMutation();

	const results = data?.data?.data || [];
	const pagination = data?.data?.pagination;

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			const allIndices = new Set(results.map((_, index) => index));
			setSelectedRows(allIndices);
		} else {
			setSelectedRows(new Set());
		}
	};

	const handleSelectRow = (index: number | string, checked: boolean) => {
		const newSelected = new Set(selectedRows);
		if (checked) {
			newSelected.add(index);
		} else {
			newSelected.delete(index);
		}
		setSelectedRows(newSelected);
	};

	const isAllSelected =
		results.length > 0 && selectedRows.size === results.length;
	const isSomeSelected =
		selectedRows.size > 0 && selectedRows.size < results.length;

	// const openDeleteConfirmation = (selectedRoleIds: string[]) => {
	// 	setResultToDelete(selectedRoleIds);
	// 	setOpenConfirm(true);
	// };

	const handleRoleDelete = async () => {
		try {

			dispatch(
				showToast({
					message: "Result deleted successfully",
					severity: "success",
				}),
			);

			setSelectedRows(new Set());
			setOpenConfirm(false);
			// setResultToDelete([]);
		} catch (e: any) {
			dispatch(
				showToast({
					message: e?.data?.message || "Unable to delete result",
					severity: "error",
				}),
			);
			setOpenConfirm(false);
		}
	};

	const columns = useMemo<ColumnDef<StudentSubmitTestProps>[]>(
		() => [
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
							checked={selectedRows.has(row.original.id || "")}
							onChange={(e) =>
								handleSelectRow(row.original.id || "", e.target.checked)
							}
							color="primary"
						/>
						<Typography fontWeight={500}> {row.index + 1}</Typography>
					</Stack>
				),
				size: 80,
			},
			{
				header: "Student Name",
				accessorKey: "name",
				cell: ({ row }) => (
					<Typography variant="subtitle1">
						{row.original?.student?.name}
					</Typography>
				),
			},
			{
				header: "Answered",
				accessorKey: "answered",
				cell: ({ row }) => (
					<div className="flex justify-start items-center">
						<Typography variant="subtitle1" color="text.dark">
							{row.original?.total_attempted}
						</Typography>

						<Typography variant="subtitle1" color="text.middle">
							/{row.original?.total_questions}
						</Typography>
					</div>
				),
			},
			{
				header: "Checked",
				accessorKey: "checked_answers",
				cell: ({ row }) => (
					<div className="flex justify-start items-center">
						<Typography variant="subtitle1" color="text.dark">
							{row.original?.checked_answers}
						</Typography>

						<Typography variant="subtitle1" color="text.middle">
							/{row.original?.total_attempted}
						</Typography>
					</div>
				),
			},
			{
				header: "Started At",
				accessorKey: "started_at",
				cell: ({ row }) => (
					<Typography variant="subtitle1">
						{row.original?.started_at}
					</Typography>
				),
			},
			{
				header: "Finished At",
				accessorKey: "finished_at",
				cell: ({ row }) => (
					<Typography variant="subtitle1">
						{row.original?.finished_at}
					</Typography>
				),
			},
			{
				header: "Timer",
				accessorKey: "timer",
				cell: ({ row }) => {
					const { hours, minutes, seconds } = msToHMS(row.original?.timer || 0);
					return (
						<Typography variant="subtitle1">
							{hours | minutes | seconds
								? `${hours} Hrs ${minutes} Min ${seconds} Sec`
								: "N/A"}
						</Typography>
					);
				},
			},
			{
				header: "Status",
				accessorKey: "status",
				cell: ({ row }) => (
					<Typography
						variant="subtitle1"
						className="capitalize"
						color={
							row.original.status === "progress" ? "error.main" : "success.main"
						}>
						{row.original?.status}
					</Typography>
				),
			},
			{
				header: "Result",
				accessorKey: "result",
				cell: ({ row }) => (
					<Typography
						variant="subtitle1"
						className="capitalize flex items-center justify-center rounded-md p-1 gap-2"
						color={
							row.original.result === "failed" ? "error.main" : "success.main"
						}
						bgcolor={
							row.original.result === "failed" ? "error.light" : "success.light"
						}>
						{!(row.original.result === "failed") ? (
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M9.99935 1.66699C5.40768 1.66699 1.66602 5.40866 1.66602 10.0003C1.66602 14.592 5.40768 18.3337 9.99935 18.3337C14.591 18.3337 18.3327 14.592 18.3327 10.0003C18.3327 5.40866 14.591 1.66699 9.99935 1.66699ZM13.9827 8.08366L9.25768 12.8087C9.14102 12.9253 8.98268 12.992 8.81602 12.992C8.64935 12.992 8.49102 12.9253 8.37435 12.8087L6.01602 10.4503C5.77435 10.2087 5.77435 9.80866 6.01602 9.56699C6.25768 9.32533 6.65768 9.32533 6.89935 9.56699L8.81602 11.4837L13.0993 7.20033C13.341 6.95866 13.741 6.95866 13.9827 7.20033C14.2243 7.44199 14.2243 7.83366 13.9827 8.08366Z"
									fill="#059467"
								/>
							</svg>
						) : (
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M9.99935 1.66699C5.40768 1.66699 1.66602 5.40866 1.66602 10.0003C1.66602 14.592 5.40768 18.3337 9.99935 18.3337C14.591 18.3337 18.3327 14.592 18.3327 10.0003C18.3327 5.40866 14.591 1.66699 9.99935 1.66699ZM12.7993 11.917C13.041 12.1587 13.041 12.5587 12.7993 12.8003C12.6743 12.9253 12.516 12.9837 12.3577 12.9837C12.1993 12.9837 12.041 12.9253 11.916 12.8003L9.99935 10.8837L8.08268 12.8003C7.95768 12.9253 7.79935 12.9837 7.64102 12.9837C7.48268 12.9837 7.32435 12.9253 7.19935 12.8003C6.95768 12.5587 6.95768 12.1587 7.19935 11.917L9.11601 10.0003L7.19935 8.08366C6.95768 7.84199 6.95768 7.44199 7.19935 7.20033C7.44102 6.95866 7.84102 6.95866 8.08268 7.20033L9.99935 9.11699L11.916 7.20033C12.1577 6.95866 12.5577 6.95866 12.7993 7.20033C13.041 7.44199 13.041 7.84199 12.7993 8.08366L10.8827 10.0003L12.7993 11.917Z"
									fill="#E21D48"
								/>
							</svg>
						)}

						{row.original?.result}
					</Typography>
				),
			},
			{
				header: "Total Marks",
				accessorKey: "marks",
				cell: ({ row }) => (
					<Typography variant="subtitle1">
						{row.original?.total_marks}%
					</Typography>
				),
			},
			{
				header: "Score",
				accessorKey: "score",
				cell: ({ row }) => (
					<Typography variant="subtitle1">{row.original?.score}</Typography>
				),
			},
			{
				header: "Action",
				accessorKey: "action",
				cell: ({ row }) => (
					<ActionIconVisible
						onView={() =>
							navigate(
								PATH.TEST_QUESTION_MANAGEMENT.TEST.CHECK_PAPER.ROOT(
									Number(id),
									row.original.id,
								),
							)
						}
					/>
				),
			},
		],
		[selectedRows, isAllSelected, isSomeSelected],
	);

	const handleTestResultPublish = async () => {
		try {
			const response = await publishTestResults({ id: Number(id) }).unwrap();
			dispatch(
				showToast({
					message: response?.message || "Test results published successfully",
					severity: "success",
				}),
			);
		}
		catch (e: any) {
			dispatch(
				showToast({
					message: e?.data?.message || "Unable to publish test result",
					severity: "error",
				}),
			);
		}
	}

	return (
		<div className="students__attended__test mt-8">
			<TableFilter
				search={search}
				setSearch={setSearch}
				selectedRows={new Set<number | string>([])}
				handleRoleDelete={() => { }}
				onFilter={() => { }}
				onPublish={handleTestResultPublish}
			/>
			{!isLoading && !results.length ? (
				<EmptyRoute title="No Results Found" />
			) : (
				<CustomTable loading={isLoading} data={results} columns={columns} />
			)}

			<TablePagination
				qp={qp}
				setQp={setQp}
				totalPages={pagination?.total_pages || 0}
			/>

			<ConfirmationDialog
				open={openConfirm}
				setOpen={setOpenConfirm}
				title="Delete Role"
				description="Are you sure you want to delete the selected role(s)? This action cannot be undone."
				onSave={handleRoleDelete}
				icon={
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z"
							fill="#1D82F5"
						/>
						<path
							d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14ZM13.6597 17.75H10.3297C9.91975 17.75 9.57975 17.41 9.57975 17C9.57975 16.59 9.91975 16.25 10.3297 16.25H13.6597C14.0697 16.25 14.4097 16.59 14.4097 17C14.4097 17.41 14.0697 17.75 13.6597 17.75ZM14.4997 13.75H9.49975C9.08975 13.75 8.74975 13.41 8.74975 13C8.74975 12.59 9.08975 12.25 9.49975 12.25H14.4997C14.9097 12.25 15.2497 12.59 15.2497 13C15.2497 13.41 14.9097 13.75 14.4997 13.75Z"
							fill="#1D82F5"
						/>
					</svg>
				}
			/>
		</div>
	);
}
