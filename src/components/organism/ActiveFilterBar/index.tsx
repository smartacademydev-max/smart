import { Button, Chip } from "@mui/material";
import type { AppliedPill } from "../../../store/useCourseFilter";

interface Props {
    pills: AppliedPill[];
    onClearAll: () => void;
}

export default function ActiveFilterBar({ pills, onClearAll }: Props) {
    if (pills.length === 0) return null;
    return (
        <div className="flex flex-wrap items-center gap-2 px-1 py-2">
            {pills.map(pill => (
                <Chip key={pill.key} label={pill.label} size="small" onDelete={pill.onDelete} />
            ))}
            <Button size="small" color="error" variant="text" onClick={onClearAll} className="font-medium! text-xs!">
                Clear Filter
            </Button>
        </div>
    );
}
