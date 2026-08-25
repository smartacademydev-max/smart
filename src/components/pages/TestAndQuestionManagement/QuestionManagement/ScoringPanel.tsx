import {
    Autocomplete,
    Box,
    Checkbox,
    FormControlLabel,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import type { BowTieScoringProps, QuestionConfigProps, QuestionTypeProps } from "../../../../types/question";

interface Props {
    questionType: QuestionTypeProps;
    config: QuestionConfigProps | null | undefined;
    onConfigChange: (patch: Partial<QuestionConfigProps>) => void;
    /** Bow-tie also offers a "Check answer" button; other formats do not. */
    showCheckAnswer?: boolean;
}

const SCORING_OPTIONS: { value: BowTieScoringProps; label: string }[] = [
    { value: "exact_match", label: "Exact Match — all or nothing" },
    { value: "partial_match_per_element", label: "Partial Match Per Element" }
];

/**
 * What one element means for each format, so the partial-credit help text
 * describes the question the author is actually writing.
 */
const ELEMENT_LABELS: Partial<Record<QuestionTypeProps, string>> = {
    sata: "each correct option",
    select_n: "each correct option",
    matrix: "each correct row",
    cloze: "each correct blank",
    bow_tie: "each correct drop area",
    drag_into_text: "each correct gap",
    highlight: "each correct highlight",
    drag_drop: "each item in place"
};

/**
 * The scoring rules a question carries for itself.
 *
 * These live on the question rather than the test because the formats differ:
 * a five-zone bow-tie and a two-option MCQ cannot sensibly share one marks
 * value or one partial-credit rule. A blank field means "inherit the test's
 * setting", so nothing already authored changes.
 */
export default function ScoringPanel({
    questionType,
    config,
    onConfigChange,
    showCheckAnswer = false
}: Props) {
    const theme = useTheme();
    const element = ELEMENT_LABELS[questionType] ?? "each correct element";

    /**
     * A floor and a ceiling only mean something when partial credit can be
     * earned at all. Under Exact Match the score is either full marks or
     * nothing, so either one would quietly turn it into a partial-credit item.
     */
    const awardsPartialCredit = config?.scoring_type === "partial_match_per_element";

    /**
     * Only the flat formats deduct per wrong tick — picking three wrong options
     * should cost more than picking one. A bow-tie or matrix is judged by zone
     * or row, so it is deducted once for the answer as a whole.
     */
    const deductsPerSelection = ["mcq", "sata", "select_n"].includes(questionType);

    /** A blank field means inherit, so empty string is preserved as undefined. */
    const numberOrUndefined = (value: string) =>
        value === "" ? undefined : Math.max(0, Number(value) || 0);

    return (
        <Box
            className="flex flex-col gap-3 rounded-lg p-4"
            sx={{ border: "1px solid", borderColor: theme.palette.separator.dark }}
        >
            <Box>
                <Typography variant="subtitle2" color="text.primary">
                    Scoring
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Leave a field blank to use the test's own setting.
                </Typography>
            </Box>

            <Autocomplete
                size="small"
                options={SCORING_OPTIONS}
                getOptionLabel={(scoring) => scoring.label}
                isOptionEqualToValue={(a, b) => a.value === b.value}
                value={SCORING_OPTIONS.find((s) => s.value === config?.scoring_type) ?? null}
                onChange={(_, next) => {
                    /**
                     * Exact Match is all or nothing, so a floor or a cap left
                     * behind from partial credit would keep awarding marks the
                     * author can no longer see. They are cleared with the
                     * fields rather than lingering in config.
                     */
                    const goingExact = next?.value !== "partial_match_per_element";

                    onConfigChange({
                        scoring_type: next?.value ?? undefined,
                        ...(goingExact
                            ? {
                                marks_per_element: undefined,
                                partial_credit_cap_percent: undefined
                            }
                            : {})
                    });
                }}
                renderInput={(params) => (
                    <TextField {...params} label="Scoring type (blank = use the test's)" />
                )}
            />
            <Typography variant="caption" color="text.secondary">
                Exact Match needs the whole question right. Partial Match Per Element awards a share
                for {element}.
            </Typography>

            <Box className="flex flex-col gap-3 sm:flex-row">
                <Box className="flex flex-1 flex-col gap-1">
                    <InputLabel>Negative marking (%)</InputLabel>
                    <OutlinedInput
                        size="small"
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 5 }}
                        placeholder="Use the test's"
                        value={config?.penalty_percent ?? ""}
                        onChange={(e) =>
                            onConfigChange({ penalty_percent: numberOrUndefined(e.target.value) })
                        }
                    />
                    <Typography variant="caption" color="text.secondary">
                        {deductsPerSelection
                            ? "Share of this question's marks lost for each wrong selection."
                            : "Share of this question's marks lost for an incorrect answer."}{" "}
                        A question never scores below zero.
                    </Typography>
                </Box>

                {awardsPartialCredit && (
                    <Box className="flex flex-1 flex-col gap-1">
                        <InputLabel>Max partial credit (%)</InputLabel>
                        <OutlinedInput
                            size="small"
                            type="number"
                            inputProps={{ min: 0, max: 100, step: 5 }}
                            placeholder="No cap"
                            value={config?.partial_credit_cap_percent ?? ""}
                            onChange={(e) =>
                                onConfigChange({
                                    partial_credit_cap_percent: numberOrUndefined(e.target.value)
                                })
                            }
                        />
                        <Typography variant="caption" color="text.secondary">
                            Keeps a nearly-right answer below a fully correct one.
                        </Typography>
                    </Box>
                )}
            </Box>

            {awardsPartialCredit && (
                <Box className="flex flex-col gap-1 sm:w-1/2">
                    <InputLabel>Marks for {element}</InputLabel>
                    <OutlinedInput
                        size="small"
                        type="number"
                        inputProps={{ min: 0, step: 0.25 }}
                        placeholder="Share the question's marks equally"
                        value={config?.marks_per_element ?? ""}
                        onChange={(e) =>
                            onConfigChange({ marks_per_element: numberOrUndefined(e.target.value) })
                        }
                    />
                    <Typography variant="caption" color="text.secondary">
                        What one right answer earns when the student does not get them all. Leave
                        blank to split the question's marks evenly.
                    </Typography>
                </Box>
            )}

            <FormControlLabel
                control={
                    <Checkbox
                        size="small"
                        checked={!!config?.unscored}
                        onChange={(e) => onConfigChange({ unscored: e.target.checked })}
                    />
                }
                label={
                    <Typography variant="body2">
                        Unscored / practice — answered but worth no marks
                    </Typography>
                }
            />

            {showCheckAnswer && (
                <>
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={!!config?.check_answer}
                                onChange={(e) => onConfigChange({ check_answer: e.target.checked })}
                            />
                        }
                        label={<Typography variant="body2">Show a Check answer button</Typography>}
                    />

                    {config?.check_answer && (
                        <Box className="flex flex-col gap-1 sm:w-64">
                            <InputLabel>Check answer attempts (0 = unlimited)</InputLabel>
                            <OutlinedInput
                                size="small"
                                type="number"
                                inputProps={{ min: 0 }}
                                value={config?.check_answer_attempts ?? 0}
                                onChange={(e) =>
                                    onConfigChange({
                                        check_answer_attempts: Math.max(0, Number(e.target.value) || 0)
                                    })
                                }
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
