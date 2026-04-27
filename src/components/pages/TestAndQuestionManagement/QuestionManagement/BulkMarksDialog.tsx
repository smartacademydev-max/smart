import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputLabel,
    OutlinedInput,
    Typography,
} from "@mui/material";
import { useState } from "react";

interface Props {
    open: boolean;
    onClose: () => void;
    onApply: (marks: number) => Promise<void>;
    count: number;
    isLoading: boolean;
}

export default function BulkMarksDialog({ open, onClose, onApply, count, isLoading }: Props) {
    const [marks, setMarks] = useState<string>("");

    const handleApply = async () => {
        const value = Number(marks);
        if (!marks || value < 0) return;
        await onApply(value);
        setMarks("");
    };

    const handleClose = () => {
        setMarks("");
        onClose();
    };

    const isInvalid = !marks || Number(marks) < 0;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>Assign Marks</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Assign the same marks to <strong>{count}</strong> selected question{count !== 1 ? "s" : ""}.
                </Typography>
                <div className="input__field">
                    <InputLabel required>Marks per Question</InputLabel>
                    <OutlinedInput
                        fullWidth
                        type="number"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        placeholder="e.g. 10"
                        inputProps={{ min: 0 }}
                        autoFocus
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleApply}
                    disabled={isInvalid || isLoading}
                >
                    {isLoading ? "Applying..." : "Apply"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
