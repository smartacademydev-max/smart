import { Box, Button, Checkbox, Chip, InputLabel, OutlinedInput, Stack, Typography } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { Add } from "iconsax-reactjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useAddQuestionsToLabelMutation,
    useGetQuestionLabelByIdQuery,
    useGetQuestionsByLabelQuery,
    useRemoveQuestionsFromLabelMutation,
    useUpdateQuestionLabelMutation,
} from "../../../../../services/questionApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import { PATH } from "../../../../../routes/PATH";
import type { QuestionProps, QuestionTypeProps } from "../../../../../types/question";
import { renderHtml } from "../../../../../utils/renderHtml";
import Actions from "../../../../molecules/Action";
import TabController from "../../../../molecules/TabController";
import CustomTable from "../../../../molecules/Table";
import TablePagination from "../../../../molecules/Table/Pagination";
import ConfirmationDialog from "../../../../organism/ConfirmationDialog";
import EmptyRoute from "../../../../organism/EmptyRoute";
import PageHeader from "../../../../organism/PageHeader";
import TableFilter from "../../../../organism/TableFilter";
import AddQuestionsDialog from "./AddQuestionsDialog";

export default function QuestionLabelDetail() {
    const { id } = useParams<{ id: string }>();
    const labelId = Number(id);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [labelName, setLabelName] = useState("");
    const [search, setSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 8 });
    const [activeTab, setActiveTab] = useState<QuestionTypeProps>("mcq");
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [openConfirm, setOpenConfirm] = useState(false);
    const [questionsToRemove, setQuestionsToRemove] = useState<number[]>([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const { data: labelData } = useGetQuestionLabelByIdQuery({ id: labelId });
    const { data, isLoading } = useGetQuestionsByLabelQuery({
        id: labelId,
        ...qp,
        search,
        type: activeTab,
    });
    const [updateLabel, { isLoading: updating }] = useUpdateQuestionLabelMutation();
    const [addQuestions, { isLoading: adding }] = useAddQuestionsToLabelMutation();
    const [removeQuestions, { isLoading: removing }] = useRemoveQuestionsFromLabelMutation();

    const questions = data?.data?.data || [];
    const existingIds = useMemo(() => new Set(questions.map((q) => q.id as number)), [questions]);

    useEffect(() => {
        if (labelData?.data?.name) {
            setLabelName(labelData.data.name);
        }
    }, [labelData]);

    const handleUpdateTitle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!labelName.trim()) return;
        try {
            const res = await updateLabel({ id: labelId, body: { name: labelName } }).unwrap();
            dispatch(showToast({ message: res.message || "Set name updated.", severity: "success" }));
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to update set name.", severity: "error" }));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedRows(checked ? new Set(questions.map((q) => q.id as number)) : new Set());
    };

    const handleSelectRow = (qId: number, checked: boolean) => {
        const next = new Set(selectedRows);
        checked ? next.add(qId) : next.delete(qId);
        setSelectedRows(next);
    };

    const isAllSelected = questions.length > 0 && selectedRows.size === questions.length;
    const isSomeSelected = selectedRows.size > 0 && selectedRows.size < questions.length;

    const openRemoveConfirmation = (ids: number[]) => {
        setQuestionsToRemove(ids);
        setOpenConfirm(true);
    };

    const handleRemove = async () => {
        try {
            const res = await removeQuestions({ id: labelId, question_ids: questionsToRemove }).unwrap();
            dispatch(showToast({ message: res.message || "Questions removed from set.", severity: "success" }));
            setSelectedRows(new Set());
            setOpenConfirm(false);
            setQuestionsToRemove([]);
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to remove questions.", severity: "error" }));
            setOpenConfirm(false);
        }
    };

    const handleAddQuestions = async (questionIds: number[]) => {
        try {
            const res = await addQuestions({ id: labelId, question_ids: questionIds }).unwrap();
            dispatch(showToast({ message: res.message || "Questions added to set.", severity: "success" }));
            setOpenAddDialog(false);
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to add questions.", severity: "error" }));
        }
    };

    const columns = useMemo<ColumnDef<QuestionProps>[]>(() => [
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
            size: 80,
            cell: ({ row }) => (
                <Stack sx={{ gap: "10px" }}>
                    <Checkbox
                        checked={selectedRows.has(row.original.id as number)}
                        onChange={(e) => handleSelectRow(row.original.id as number, e.target.checked)}
                        color="primary"
                    />
                    <Typography fontWeight={500}>
                        {(qp.pageIndex - 1) * qp.pageSize + row.index + 1}
                    </Typography>
                </Stack>
            ),
        },
        {
            header: "Question",
            accessorKey: "question",
            cell: ({ row }) => (
                <Typography fontWeight={500}>
                    {renderHtml(row.original.question) || "N/A"}
                </Typography>
            ),
        },
        {
            header: "Type",
            accessorKey: "question_type",
            cell: ({ row }) => (
                <Chip
                    label={row.original.question_type?.toUpperCase()}
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <Actions
                    deleting={removing}
                    onEdit={() => navigate(PATH.TEST_QUESTION_MANAGEMENT.QUESTIONS.ROOT)}
                    onView={() => navigate(PATH.TEST_QUESTION_MANAGEMENT.QUESTIONS.ROOT)}
                    onDelete={() => openRemoveConfirmation([row.original.id as number])}
                />
            ),
        },
    ], [selectedRows, isAllSelected, isSomeSelected, qp, removing]);

    const handleResetFilter = () => {
        setSearch("");
        setQp((prev) => ({ ...prev, pageIndex: 1 }));
    };

    const originalName = labelData?.data?.name ?? "";

    return (
        <div className="all__question__root h-full flex flex-col justify-between">
            <div className="page__top">
                <PageHeader
                    breadcrumb={[{
                        title: "All Sets",
                        url: "/question-labels",
                        icon: (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 4.85018V16.7402C22 17.7102 21.21 18.6002 20.24 18.7202L19.93 18.7602C18.29 18.9802 15.98 19.6602 14.12 20.4402C13.47 20.7102 12.75 20.2202 12.75 19.5102V5.60018C12.75 5.23018 12.96 4.89018 13.29 4.71018C15.12 3.72018 17.89 2.84018 19.77 2.68018H19.83C21.03 2.68018 22 3.65018 22 4.85018Z" fill="#1D82F5" />
                                <path d="M10.7102 4.71018C8.88023 3.72018 6.11023 2.84018 4.23023 2.68018H4.16023C2.96023 2.68018 1.99023 3.65018 1.99023 4.85018V16.7402C1.99023 17.7102 2.78023 18.6002 3.75023 18.7202L4.06023 18.7602C5.70023 18.9802 8.01023 19.6602 9.87023 20.4397C10.5202 20.7097 11.2402 20.2197 11.2402 19.5097V5.59969C11.2402 5.22969 11.0402 4.88969 10.7102 4.70969Z" fill="#1D82F5" />
                            </svg>
                        ),
                    }, {
                        title: "Set Questions",
                    }]}
                    cta={{ icon: <Add />, url: "", label: "Add Questions" }}
                    handleOpenPopup={() => setOpenAddDialog(true)}
                />

                <Box
                    component="form"
                    onSubmit={handleUpdateTitle}
                    sx={{ display: "flex", gap: 2, alignItems: "flex-end", mb: 2 }}
                >
                    <Box flex={1} maxWidth={480}>
                        <InputLabel sx={{ mb: 0.5 }}>Set Name</InputLabel>
                        <OutlinedInput
                            fullWidth
                            size="small"
                            value={labelName}
                            onChange={(e) => setLabelName(e.target.value)}
                            placeholder="Enter set name"
                        />
                    </Box>
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={!labelName.trim() || labelName === originalName || updating}
                    >
                        {updating ? "Saving..." : "Save"}
                    </Button>
                </Box>

                <TabController
                    options={[{ label: "MCQs", value: "mcq" }, { label: "Subjective", value: "subjective" }]}
                    setActiveTab={setActiveTab}
                    currentActive={activeTab}
                />

                <TableFilter
                    search={search}
                    setSearch={setSearch}
                    selectedRows={selectedRows as Set<number | string>}
                    handleRoleDelete={(ids) => openRemoveConfirmation(ids.map(Number))}
                    handleResetFilter={handleResetFilter}
                />
            </div>

            {!isLoading && !questions.length ? (
                <EmptyRoute
                    title="No Questions in this Set"
                    message="Add questions to this set using the button above."
                    icon={(
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 4.85018V16.7402C22 17.7102 21.21 18.6002 20.24 18.7202L19.93 18.7602C18.29 18.9802 15.98 19.6602 14.12 20.4402C13.47 20.7102 12.75 20.2202 12.75 19.5102V5.60018C12.75 5.23018 12.96 4.89018 13.29 4.71018C15.12 3.72018 17.89 2.84018 19.77 2.68018H19.83C21.03 2.68018 22 3.65018 22 4.85018Z" fill="#1D82F5" />
                            <path d="M10.7102 4.71018C8.88023 3.72018 6.11023 2.84018 4.23023 2.68018H4.16023C2.96023 2.68018 1.99023 3.65018 1.99023 4.85018V16.7402C1.99023 17.7102 2.78023 18.6002 3.75023 18.7202L4.06023 18.7602C5.70023 18.9802 8.01023 19.6602 9.87023 20.4397C10.5202 20.7097 11.2402 20.2197 11.2402 19.5097V5.59969C11.2402 5.22969 11.0402 4.88969 10.7102 4.70969Z" fill="#1D82F5" />
                        </svg>
                    )}
                />
            ) : (
                <>
                    <Box className="table__wrapper h-full" sx={{ overflow: "auto" }}>
                        <CustomTable data={questions} columns={columns} loading={isLoading} />
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
                title="Remove Questions"
                description="Are you sure you want to remove the selected question(s) from this set?"
                onSave={handleRemove}
                icon={(
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z" fill="#1D82F5" />
                        <path d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14Z" fill="#1D82F5" />
                    </svg>
                )}
            />

            <AddQuestionsDialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                onAdd={handleAddQuestions}
                existingIds={existingIds}
                isLoading={adding}
            />
        </div>
    );
}
