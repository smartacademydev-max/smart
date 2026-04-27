import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    OutlinedInput,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useState } from "react";
import { useGetAllQuestionQuery } from "../../../../../services/questionApi";
import { renderHtml } from "../../../../../utils/renderHtml";
import type { QuestionTypeProps } from "../../../../../types/question";

interface Props {
    open: boolean;
    onClose: () => void;
    onAdd: (questionIds: number[]) => void;
    existingIds: Set<number>;
    isLoading?: boolean;
}

export default function AddQuestionsDialog({ open, onClose, onAdd, existingIds, isLoading }: Props) {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<QuestionTypeProps>("mcq");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 20 });
    const [selected, setSelected] = useState<Set<number>>(new Set());

    const { data, isLoading: fetching } = useGetAllQuestionQuery({
        ...qp,
        search,
        type: tab,
    });

    const questions = data?.data?.data || [];

    const handleToggle = (id: number) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const handleAdd = () => {
        onAdd(Array.from(selected));
        setSelected(new Set());
    };

    const handleClose = () => {
        setSelected(new Set());
        setSearch("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Add Questions to Set</DialogTitle>
            <DialogContent dividers>
                <Stack gap={2}>
                    <OutlinedInput
                        fullWidth
                        size="small"
                        placeholder="Search questions..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setQp((prev) => ({ ...prev, pageIndex: 1 }));
                        }}
                        startAdornment={
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        }
                    />
                    <Tabs value={tab} onChange={(_, v) => { setTab(v); setQp((p) => ({ ...p, pageIndex: 1 })); }}>
                        <Tab label="MCQ" value="mcq" />
                        <Tab label="Subjective" value="subjective" />
                    </Tabs>

                    {fetching ? (
                        <Typography color="text.secondary">Loading questions...</Typography>
                    ) : !questions.length ? (
                        <Typography color="text.secondary">No questions found.</Typography>
                    ) : (
                        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                            {questions.map((q) => {
                                const alreadyAdded = existingIds.has(q.id as number);
                                const isChecked = selected.has(q.id as number) || alreadyAdded;
                                return (
                                    <Stack
                                        key={q.id}
                                        direction="row"
                                        alignItems="flex-start"
                                        gap={1}
                                        sx={{
                                            p: 1,
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                            opacity: alreadyAdded ? 0.5 : 1,
                                        }}
                                    >
                                        <Checkbox
                                            checked={isChecked}
                                            disabled={alreadyAdded}
                                            onChange={() => !alreadyAdded && handleToggle(q.id as number)}
                                            size="small"
                                        />
                                        <Box flex={1}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {renderHtml(q.question) || "N/A"}
                                            </Typography>
                                            {alreadyAdded && (
                                                <Typography variant="caption" color="text.secondary">Already in set</Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                );
                            })}
                        </Box>
                    )}

                    {(data?.data?.pagination?.total_pages ?? 0) > 1 && (
                        <Stack direction="row" justifyContent="center" gap={1}>
                            <Button
                                size="small"
                                disabled={qp.pageIndex === 1}
                                onClick={() => setQp((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                            >
                                Prev
                            </Button>
                            <Typography alignSelf="center" variant="body2">
                                {qp.pageIndex} / {data?.data?.pagination?.total_pages}
                            </Typography>
                            <Button
                                size="small"
                                disabled={qp.pageIndex >= (data?.data?.pagination?.total_pages ?? 1)}
                                onClick={() => setQp((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                            >
                                Next
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    variant="contained"
                    disabled={selected.size === 0 || isLoading}
                    onClick={handleAdd}
                >
                    {isLoading ? "Adding..." : `Add ${selected.size > 0 ? `(${selected.size})` : ""}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
