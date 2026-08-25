import { Add, DeleteOutline } from "@mui/icons-material";
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Typography,
    useTheme,
    type Theme
} from "@mui/material";
import {
    CHOICE_GROUP_COLORS,
    type OptionProps,
    type QuestionConfigProps
} from "../../../../types/question";
import { gapsIn, stripHtml } from "../../../../utils/questionText";

interface Props {
    question: string;
    options: OptionProps[];
    config: QuestionConfigProps | null | undefined;
    error?: string;
    onOptionsChange: (options: OptionProps[]) => void;
    onConfigChange: (patch: Partial<QuestionConfigProps>) => void;
    /** Seeds text, choices and config together so none reads a stale config. */
    onLoadExample: (
        question: string,
        options: OptionProps[],
        config: Partial<QuestionConfigProps>
    ) => void;
}

const colorForGroup = (group: number) =>
    CHOICE_GROUP_COLORS[(Math.max(1, group) - 1) % CHOICE_GROUP_COLORS.length];

/**
 * Authoring for a drag-and-drop-into-text question.
 *
 * The passage carries numbered gaps written `[[1]]`, and each gap is answered
 * by one of the choices below it. A choice may fill more than one gap, so the
 * answer key is kept per gap rather than as a flag on the option.
 *
 * Choices are addressed by their index in the list while authoring: a brand new
 * choice has no id until the question is saved, and the backend resolves the
 * indexes once it does.
 */
export default function DragIntoTextEditor({
    question,
    options,
    config,
    error,
    onOptionsChange,
    onConfigChange,
    onLoadExample
}: Props) {
    const theme = useTheme();
    const gaps = gapsIn(question);

    /**
     * Gap answers are keyed by gap number, but a question saved before that was
     * enforced comes back as a zero-indexed list — so gap 1 reads as gap 0 and
     * saving reports a gap one higher than the passage has. Re-keyed against
     * the passage's own gaps on the way in, so an existing question repairs
     * itself the moment it is opened.
     */
    const gapAnswers = ((): Record<number, number> => {
        const stored = config?.gap_answers;

        if (!stored) return {};
        if (!Array.isArray(stored)) return stored;

        return Object.fromEntries(
            stored
                .map((choice, index) => [gaps[index] ?? index + 1, choice])
                .filter(([, choice]) => choice !== null && choice !== undefined)
        );
    })();
    const choiceGroups = config?.choice_groups ?? {};
    const unlimited = config?.unlimited_choices ?? [];

    /** A choice is referenced by id once saved, by list index before that. */
    const refFor = (option: OptionProps, index: number) => option.id ?? index;

    const groupOf = (option: OptionProps, index: number) =>
        Math.max(1, Number(choiceGroups[refFor(option, index)] ?? 1));

    const addChoice = () => {
        onOptionsChange([
            ...options,
            { id: null, option: "", is_correct: false, position: options.length, group_key: null }
        ]);
    };

    const removeChoice = (index: number) => {
        const removedRef = refFor(options[index], index);

        onOptionsChange(
            options.filter((_, i) => i !== index).map((option, i) => ({ ...option, position: i }))
        );

        /**
         * Indexes shift when a choice is removed, so any answer or setting
         * addressed by index has to shift with it — otherwise the answer key
         * would silently point at a different choice.
         */
        const remap = (ref: number) => (ref > removedRef ? ref - 1 : ref);
        const isSavedRef = (ref: number) => options.some((o) => o.id === ref);

        const nextAnswers: Record<number, number> = {};
        for (const [gap, ref] of Object.entries(gapAnswers)) {
            const value = Number(ref);
            if (value === removedRef) continue;
            nextAnswers[Number(gap)] = isSavedRef(value) ? value : remap(value);
        }

        const nextGroups: Record<number, number> = {};
        for (const [ref, group] of Object.entries(choiceGroups)) {
            const value = Number(ref);
            if (value === removedRef) continue;
            nextGroups[isSavedRef(value) ? value : remap(value)] = Number(group);
        }

        onConfigChange({
            gap_answers: nextAnswers,
            choice_groups: nextGroups,
            unlimited_choices: unlimited
                .filter((ref) => ref !== removedRef)
                .map((ref) => (isSavedRef(ref) ? ref : remap(ref)))
        });
    };

    const setChoiceText = (index: number, value: string) => {
        onOptionsChange(options.map((o, i) => (i === index ? { ...o, option: value } : o)));
    };

    const setGapAnswer = (gap: number, ref: number | "") => {
        const next = { ...gapAnswers };

        if (ref === "") {
            delete next[gap];
        } else {
            next[gap] = ref;
        }

        onConfigChange({ gap_answers: next });
    };

    const setChoiceGroup = (ref: number, group: number) => {
        onConfigChange({ choice_groups: { ...choiceGroups, [ref]: Math.max(1, group) } });
    };

    const toggleUnlimited = (ref: number) => {
        onConfigChange({
            unlimited_choices: unlimited.includes(ref)
                ? unlimited.filter((existing) => existing !== ref)
                : [...unlimited, ref]
        });
    };

    const loadExample = () => {
        onLoadExample(
            "<p>The [[1]] is the powerhouse of the cell, where [[2]] is produced. Protein synthesis instead happens at the [[3]].</p>",
            ["mitochondrion", "ATP", "ribosome", "nucleus"].map((option, position) => ({
                id: null,
                option,
                is_correct: false,
                position,
                group_key: null
            })),
            {
                gap_answers: { 1: 0, 2: 1, 3: 2 },
                choice_groups: { 0: 1, 1: 2, 2: 1, 3: 1 },
                unlimited_choices: [],
                shuffle_choices: true
            }
        );
    };

    /** Which gaps a given choice has been assigned to, for the summary line. */
    const gapsFilledBy = (ref: number) =>
        Object.entries(gapAnswers)
            .filter(([, value]) => Number(value) === ref)
            .map(([gap]) => Number(gap))
            .sort((a, b) => a - b);

    return (
        <Box className="flex flex-col gap-4">
            <Box className="flex items-start justify-between gap-4">
                <Box>
                    <Typography variant="subtitle1" color="text.primary">
                        Answer Options
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Mark each gap in the question text as [[1]], [[2]] and so on, then choose
                        which option belongs in it. Extra options act as distractors.
                    </Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={loadExample} className="shrink-0">
                    Load example
                </Button>
            </Box>

            {error && (
                <Typography variant="caption" color="error">
                    {error}
                </Typography>
            )}

            {gaps.length === 0 && (
                <Typography variant="caption" color="error">
                    The question text has no gaps yet. Add [[1]] where the first answer belongs.
                </Typography>
            )}

            <Box className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Authoring */}
                <Box className="flex flex-col gap-4">
                    <Box
                        className="flex flex-col gap-3 rounded-lg p-3"
                        sx={{ border: "1px solid", borderColor: theme.palette.separator.dark }}
                    >
                        <Typography variant="subtitle2" color="text.primary">
                            Choices
                        </Typography>

                        {options.map((option, index) => {
                            const ref = refFor(option, index);
                            const group = groupOf(option, index);
                            const filled = gapsFilledBy(ref);

                            return (
                                <Box key={index} className="flex flex-col gap-1">
                                    <Box className="flex items-center gap-2">
                                        <Box
                                            className="h-4 w-4 shrink-0 rounded"
                                            sx={{ backgroundColor: colorForGroup(group) }}
                                            title={`Group ${group}`}
                                        />
                                        <OutlinedInput
                                            size="small"
                                            fullWidth
                                            value={stripHtml(option.option)}
                                            placeholder={`Choice ${index + 1}`}
                                            onChange={(e) => setChoiceText(index, e.target.value)}
                                        />
                                        <Select
                                            size="small"
                                            value={group}
                                            className="w-20 shrink-0"
                                            onChange={(e) => setChoiceGroup(ref, Number(e.target.value))}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map((g) => (
                                                <MenuItem key={g} value={g}>
                                                    G{g}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {options.length > 1 && (
                                            <Button
                                                size="small"
                                                color="error"
                                                className="min-w-0!"
                                                onClick={() => removeChoice(index)}
                                                title="Delete choice"
                                            >
                                                <DeleteOutline fontSize="small" />
                                            </Button>
                                        )}
                                    </Box>
                                    <Box className="flex items-center gap-3 pl-6">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={unlimited.includes(ref)}
                                                    onChange={() => toggleUnlimited(ref)}
                                                />
                                            }
                                            label={
                                                <Typography variant="caption">
                                                    Unlimited (reusable)
                                                </Typography>
                                            }
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {filled.length
                                                ? `Fills gap ${filled.map((g) => `[[${g}]]`).join(", ")}`
                                                : "Distractor"}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}

                        <Box>
                            <Button size="small" startIcon={<Add />} onClick={addChoice}>
                                Add choice
                            </Button>
                        </Box>
                    </Box>

                    <Box
                        className="flex flex-col gap-3 rounded-lg p-3"
                        sx={{ border: "1px solid", borderColor: theme.palette.separator.dark }}
                    >
                        <Typography variant="subtitle2" color="text.primary">
                            Correct answer per gap
                        </Typography>

                        {gaps.map((gap) => {
                            const chosen = gapAnswers[gap];
                            const hasAnswer = chosen !== undefined && chosen !== null;

                            return (
                                <Box key={gap} className="flex items-center gap-2">
                                    <Typography
                                        variant="caption"
                                        color={hasAnswer ? "text.secondary" : "error"}
                                        className="w-14 shrink-0"
                                    >
                                        [[{gap}]]
                                    </Typography>
                                    <Select
                                        size="small"
                                        fullWidth
                                        displayEmpty
                                        value={hasAnswer ? chosen : ""}
                                        onChange={(e) => {
                                            const picked = String(e.target.value);
                                            setGapAnswer(gap, picked === "" ? "" : Number(picked));
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>Choose an option…</em>
                                        </MenuItem>
                                        {options.map((option, index) => (
                                            <MenuItem key={index} value={refFor(option, index)}>
                                                {stripHtml(option.option) || `Choice ${index + 1}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Box>
                            );
                        })}

                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={!!config?.shuffle_choices}
                                    onChange={(e) =>
                                        onConfigChange({ shuffle_choices: e.target.checked })
                                    }
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    Shuffle the choices for each student
                                </Typography>
                            }
                        />
                    </Box>
                </Box>

                {/* Live preview */}
                <Box
                    className="flex flex-col gap-4 rounded-lg p-4 lg:sticky lg:top-0 lg:self-start"
                    sx={{ border: "1px solid", borderColor: theme.palette.separator.dark }}
                >
                    <Typography variant="caption" color="text.secondary">
                        Preview
                    </Typography>

                    <PassagePreview
                        question={question}
                        options={options}
                        gapAnswers={gapAnswers}
                        choiceGroups={choiceGroups}
                        theme={theme}
                    />

                    <Box className="flex flex-wrap gap-2">
                        {options.map((option, index) => {
                            const group = groupOf(option, index);

                            return (
                                <Box
                                    key={index}
                                    className="rounded px-2 py-1"
                                    sx={{
                                        border: "1px solid",
                                        borderColor: theme.palette.separator.dark,
                                        backgroundColor: colorForGroup(group),
                                        color: "#111"
                                    }}
                                >
                                    <Typography variant="caption">
                                        {stripHtml(option.option) || `Choice ${index + 1}`}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                        Colours mark the choice groups — a choice only drops into a gap of its own
                        colour. The student sees the gaps empty.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

/**
 * The passage with its `[[n]]` markers replaced by the choice the author
 * assigned, so the sentence can be read as the student will answer it.
 */
function PassagePreview({
    question,
    options,
    gapAnswers,
    choiceGroups,
    theme
}: {
    question: string;
    options: OptionProps[];
    gapAnswers: Record<number, number>;
    choiceGroups: Record<number, number>;
    theme: Theme;
}) {
    const text = stripHtml(question);

    if (!text) {
        return (
            <Typography variant="body2" color="text.secondary">
                Write the question text above, marking each gap as [[1]].
            </Typography>
        );
    }

    const labelFor = (ref: number) => {
        const byId = options.find((option) => option.id === ref);
        const chosen = byId ?? options[ref];

        return chosen ? stripHtml(chosen.option) : "";
    };

    const parts = text.split(/(\[\[\d+\]\])/g);

    return (
        <Typography variant="body2" color="text.primary" component="p" className="leading-8">
            {parts.map((part, index) => {
                const match = part.match(/^\[\[(\d+)\]\]$/);

                if (!match) return <span key={index}>{part}</span>;

                const gap = Number(match[1]);
                const ref = gapAnswers[gap];
                const label = ref === undefined ? "" : labelFor(Number(ref));
                const group = ref === undefined ? 1 : Math.max(1, Number(choiceGroups[ref] ?? 1));

                return (
                    <Box
                        key={index}
                        component="span"
                        className="mx-1 inline-block rounded px-2 py-1"
                        sx={{
                            border: "1px dashed",
                            borderColor: theme.palette.separator.dark,
                            backgroundColor: label ? colorForGroup(group) : "transparent",
                            color: label ? "#111" : theme.palette.text.secondary
                        }}
                    >
                        {label || `gap ${gap}`}
                    </Box>
                );
            })}
        </Typography>
    );
}
