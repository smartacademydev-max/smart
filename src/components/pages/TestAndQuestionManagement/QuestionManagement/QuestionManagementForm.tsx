import { Add } from "@mui/icons-material";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    InputLabel,
    OutlinedInput,
    Radio,
    TextField,
    Typography
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useGetAllMegaCategoryQuery } from "../../../../services/categoryApi";
import { useEditOrCreateQuestionMutation } from "../../../../services/questionApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import {
    BOW_TIE_DEFAULT_AREA_TITLES,
    BOW_TIE_DEFAULT_GROUPS,
    GROUPED_TYPES,
    QUESTION_TYPE_LABELS,
    QuestionInitialState,
    HIGHLIGHT_COLORS,
    type CorrectCellsProps,
    type HighlightSpanProps,
    type HighlightTypeProps,
    type QuestionDifficultyProps,
    type OptionProps,
    type QuestionConfigProps,
    type QuestionGroupProps,
    type QuestionProps,
    type QuestionTypeProps
} from "../../../../types/question";
import { gapsIn } from "../../../../utils/questionText";
import TextEditor from "../../../atoms/TextEditor";
import { YesNoSwitch } from "../../../atoms/YesNoSwitch";
import FooterAction from "../../../molecules/FooterAction";
import BowTieEditor from "./BowTieEditor";
import DragIntoTextEditor from "./DragIntoTextEditor";
import ScoringPanel from "./ScoringPanel";
import HighlightEditor from "./HighlightEditor";

export interface Props {
    open: boolean;
    setOpen: (newValue: boolean) => void;
    editData?: QuestionProps | null;
    onSave?: (values: QuestionProps) => void;
}

const questionTypes: { label: string; value: QuestionTypeProps }[] = [
    // "Multiple choice" means many options, one correct answer — a standing
    // source of confusion, so the count is spelled out in the label itself.
    { label: `${QUESTION_TYPE_LABELS.mcq} (one correct answer)`, value: "mcq" },
    { label: `${QUESTION_TYPE_LABELS.sata} (many correct)`, value: "sata" },
    { label: QUESTION_TYPE_LABELS.select_n, value: "select_n" },
    { label: QUESTION_TYPE_LABELS.matrix, value: "matrix" },
    { label: QUESTION_TYPE_LABELS.cloze, value: "cloze" },
    { label: QUESTION_TYPE_LABELS.highlight, value: "highlight" },
    { label: QUESTION_TYPE_LABELS.drag_drop, value: "drag_drop" },
    { label: QUESTION_TYPE_LABELS.bow_tie, value: "bow_tie" },
    { label: QUESTION_TYPE_LABELS.drag_into_text, value: "drag_into_text" },
    { label: QUESTION_TYPE_LABELS.subjective, value: "subjective" }
];

const difficulties: { label: string; value: QuestionDifficultyProps }[] = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" }
];

const NONE_OF_THE_ABOVE = "None of the above";

const OBJECTIVE_TYPES: QuestionTypeProps[] = questionTypes
    .map((t) => t.value)
    .filter((v) => v !== "subjective");

const buildQuestionValidationSchema = (isLocalMode: boolean) => Yup.object().shape({
    question_type: Yup.string()
        .oneOf([...OBJECTIVE_TYPES, "subjective"], "Invalid question type")
        .required("Question type is required"),
    config: Yup.object().when("question_type", {
        is: (t: QuestionTypeProps) => t === "select_n",
        then: (schema) =>
            schema.shape({
                select_n: Yup.number()
                    .min(1, "Must ask for at least one option")
                    .required("State how many options to select")
            }),
        otherwise: (schema) =>
            schema.when("question_type", {
                is: (t: QuestionTypeProps) => GROUPED_TYPES.includes(t),
                then: (s) =>
                    s.shape({
                        groups: Yup.array()
                            .of(
                                Yup.object().shape({
                                    key: Yup.string().trim().required("Group key is required")
                                })
                            )
                            .min(1, "Declare at least one row, blank, or zone")
                            .required("Declare at least one row, blank, or zone")
                    }),
                otherwise: (s) => s.nullable().notRequired()
            })
    }),
    megacategory_id: isLocalMode
        ? Yup.number().nullable().notRequired()
        : Yup.number().nullable().required("Mega category is required"),
    points: Yup.number().when("question_type", {
        is: "subjective",
        then: (schema) =>
            schema
                .min(1, "Points must be at least 1")
                .required("Points is required"),
        otherwise: (schema) => schema.notRequired()
    }),
    question: Yup.string()
        .trim()
        .required("Question is required"),
    /**
     * Matrix is authored as rows x columns and its options are generated
     * server-side, so it is validated on the grid rather than on options.
     */
    correct_cells: Yup.mixed().when("question_type", {
        is: (t: QuestionTypeProps) => t === "matrix",
        then: () =>
            Yup.mixed().test(
                "matrix-grid-complete",
                "Every row needs a correct answer",
                function (value) {
                    const config = this.parent.config ?? {};
                    const rows = (config.groups ?? []) as QuestionGroupProps[];
                    const columns = (config.columns ?? []) as QuestionGroupProps[];

                    if (rows.length === 0) {
                        return this.createError({ message: "Add at least one row" });
                    }
                    if (columns.length === 0) {
                        return this.createError({ message: "Add at least one column" });
                    }

                    const cells = (value ?? {}) as CorrectCellsProps;
                    const unanswered = rows.filter((r) => !(cells[r.key]?.length));

                    if (unanswered.length > 0) {
                        const label = unanswered[0].label || unanswered[0].key;
                        return this.createError({ message: `Row "${label}" has no correct answer` });
                    }

                    return true;
                }
            ),
        otherwise: (schema) => schema.notRequired()
    }),
    options: Yup.array().when("question_type", {
        is: (t: QuestionTypeProps) => OBJECTIVE_TYPES.includes(t) && t !== "matrix" && t !== "highlight",
        then: (schema) =>
            schema
                .of(
                    Yup.object().shape({
                        id: Yup.number().nullable(),
                        option: Yup.string()
                            .trim()
                            .required("Option text is required"),
                        is_correct: Yup.boolean().required(),
                        position: Yup.number().notRequired(),
                        group_key: Yup.string().nullable().notRequired()
                    })
                )
                .min(2, "Add at least 2 options")
                /**
                 * Each format has its own idea of a valid answer key. Getting
                 * this wrong produces an item that cannot be graded sensibly,
                 * so it is caught here rather than at grading time.
                 */
                .test(
                    "answer-key-valid",
                    "Check the correct answers for this question type",
                    function (options) {
                        const type = this.parent.question_type as QuestionTypeProps;
                        const opts = options ?? [];

                        // The stored order is the answer; no correct flags needed.
                        if (type === "drag_drop") return true;

                        /**
                         * Drag into text keys its answer on the gaps in the
                         * passage, so the options carry no correct flag at all.
                         */
                        if (type === "drag_into_text") {
                            const gaps = gapsIn(String(this.parent.question ?? ""));
                            if (gaps.length === 0) {
                                return this.createError({
                                    message: "Mark at least one gap in the question text, written as [[1]]"
                                });
                            }
                            const answers = (this.parent.config?.gap_answers ?? {}) as Record<number, number>;
                            for (const gap of gaps) {
                                const chosen = answers[gap];
                                if (chosen === undefined || chosen === null) {
                                    return this.createError({ message: `Gap [[${gap}]] has no correct choice` });
                                }
                            }
                            return true;
                        }

                        if (GROUPED_TYPES.includes(type)) {
                            const groups = (this.parent.config?.groups ?? []) as QuestionGroupProps[];
                            if (groups.length === 0) {
                                return this.createError({ message: "Declare at least one row, blank, or zone" });
                            }
                            for (const group of groups) {
                                const inGroup = opts.filter((o) => o.group_key === group.key);
                                if (inGroup.length === 0) {
                                    return this.createError({ message: `Group "${group.key}" has no options` });
                                }
                                const correctInGroup = inGroup.filter((o) => o.is_correct).length;
                                if (correctInGroup === 0) {
                                    return this.createError({ message: `Group "${group.key}" has no correct option` });
                                }
                                /**
                                 * A bow-tie column feeds a fixed number of drop
                                 * areas, so ticking a different number of
                                 * correct responses makes it unanswerable.
                                 */
                                if (type === "bow_tie") {
                                    const dropAreas = Number(group.count ?? correctInGroup);
                                    if (correctInGroup !== dropAreas) {
                                        return this.createError({
                                            message: `"${group.label || group.key}" has ${dropAreas} drop area(s) but ${correctInGroup} correct response(s)`
                                        });
                                    }
                                }
                            }
                            return true;
                        }

                        const correct = opts.filter((o) => o.is_correct).length;
                        if (correct === 0) {
                            return this.createError({ message: "At least one option must be marked as correct" });
                        }
                        if (type === "mcq" && correct > 1) {
                            return this.createError({
                                message: "Multiple choice allows one correct option. Use Select All That Apply for more."
                            });
                        }
                        if (type === "select_n") {
                            const required = Number(this.parent.config?.select_n ?? 0);
                            if (required !== correct) {
                                return this.createError({
                                    message: `This asks for ${required} option(s) but ${correct} are marked correct`
                                });
                            }
                        }
                        return true;
                    }
                ),
        otherwise: (schema) => schema.notRequired()
    })
});
export default function QuestionManagementForm({ setOpen, editData, onSave }: Props) {
    const dispatch = useAppDispatch();
    const { data } = useGetAllMegaCategoryQuery();
    const megaCategories = data?.data || [];

    const [createOrUpdateQuestion, { isLoading }] = useEditOrCreateQuestionMutation();

    const [activeHighlightType, setActiveHighlightType] = useState("type_1");

    const isEditMode = Boolean(editData?.id);
    const isLocalMode = typeof onSave === "function";


    const formik = useFormik<QuestionProps>({
        initialValues: editData || QuestionInitialState,
        validationSchema: buildQuestionValidationSchema(isLocalMode),
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (isLocalMode) {
                onSave!(values);
                setOpen(false);
                formik.resetForm();
                return;
            }
            try {
                const response = await createOrUpdateQuestion({ body: values }).unwrap();
                dispatch(
                    showToast({
                        message: response.message || `Question ${isEditMode ? 'Updated' : 'Created'} Successfully.`,
                        severity: "success"
                    })
                );
                setOpen(false);
                formik.resetForm();
            } catch (e: any) {
                dispatch(
                    showToast({
                        message: e?.data?.message || "Unable to handle the request.",
                        severity: "error"
                    })
                );
            }
        }
    });

    // Reset form when modal closes or editData changes
    useEffect(() => {
        if (editData) {
            const options = editData.options?.map((opt) => ({ ...opt })) ?? [];

            /**
             * A matrix stores its answer key as one option per cell, but the
             * grid is edited through `correct_cells`. Without rebuilding it
             * here the grid opened blank and saving wiped the answer key.
             */
            let correctCells = editData.correct_cells;

            if (editData.question_type === "matrix" && !correctCells) {
                const columns = editData.config?.columns ?? [];
                const rebuilt: CorrectCellsProps = {};

                for (const option of options) {
                    if (!option.is_correct || !option.group_key) continue;

                    const column = columns.find((c) => (c.label || c.key) === option.option);
                    if (!column) continue;

                    rebuilt[option.group_key] = [...(rebuilt[option.group_key] ?? []), column.key];
                }

                correctCells = rebuilt;
            }

            formik.setValues({ ...editData, options, correct_cells: correctCells });
        } else {
            formik.resetForm();
        }
    }, [editData]);

    const questionType = formik.values.question_type;
    const isObjective = OBJECTIVE_TYPES.includes(questionType);
    const isMatrix = questionType === "matrix";
    const isCloze = questionType === "cloze";
    const isBowTie = questionType === "bow_tie";
    const isDragIntoText = questionType === "drag_into_text";
    /** Every grouped format now authors in an editor built for its own shape. */
    const isGrouped = GROUPED_TYPES.includes(questionType) && !isMatrix && !isCloze && !isBowTie;
    /** Formats that author their answers in a dedicated editor of their own. */
    const isHighlight = questionType === "highlight";
    const hasOwnOptionEditor = isMatrix || isCloze || isHighlight || isBowTie || isDragIntoText;

    const highlightTypes: HighlightTypeProps[] = formik.values.config?.highlight_types ?? [];
    const highlightSpans: HighlightSpanProps[] = formik.values.config?.spans ?? [];
    const isOrdered = questionType === "drag_drop";
    const groups: QuestionGroupProps[] = formik.values.config?.groups ?? [];

    /**
     * Only plain multiple choice is capped at four; SATA and the grouped
     * formats routinely need more.
     */
    const optionCap = questionType === "mcq" ? 4 : 12;

    const addOption = (groupKey?: string) => {
        if (formik.values.options.length < optionCap) {
            formik.setFieldValue("options", [
                ...formik.values.options,
                {
                    id: null,
                    option: "",
                    is_correct: false,
                    position: formik.values.options.length,
                    group_key: groupKey ?? null
                }
            ]);
        }
    };

    const addGroup = () => {
        const key = isCloze ? `blank_${groups.length + 1}` : `group_${groups.length + 1}`;
        const next = [...groups, { key, label: "" }];
        formik.setFieldValue("config", { ...formik.values.config, groups: next });

        // A dropdown with no choices cannot be answered, so a new blank starts
        // with two empty options rather than an empty list.
        if (isCloze) {
            formik.setFieldValue("options", [
                ...formik.values.options,
                { id: null, option: "", is_correct: false, position: formik.values.options.length, group_key: key },
                { id: null, option: "", is_correct: false, position: formik.values.options.length + 1, group_key: key }
            ]);
        }
    };

    /**
     * A one-click "None of the above" choice, as offered by survey tools. It is
     * a normal option, so it can be marked correct like any other.
     */
    const addNoneOfTheAbove = (groupKey?: string) =>
        formik.setFieldValue("options", [
            ...formik.values.options,
            {
                id: null,
                option: NONE_OF_THE_ABOVE,
                is_correct: false,
                position: formik.values.options.length,
                group_key: groupKey ?? null
            }
        ]);

    const updateGroup = (index: number, patch: Partial<QuestionGroupProps>) => {
        const next = groups.map((g, i) => (i === index ? { ...g, ...patch } : g));
        formik.setFieldValue("config", { ...formik.values.config, groups: next });
    };

    const removeGroup = (index: number) => {
        const removed = groups[index];
        formik.setFieldValue("config", {
            ...formik.values.config,
            groups: groups.filter((_, i) => i !== index)
        });
        // Options belonging to a deleted group would be orphaned and rejected
        // by the API, so they go with it.
        formik.setFieldValue(
            "options",
            formik.values.options.filter((o) => o.group_key !== removed.key)
        );
    };

    // ---- Matrix grid: rows x columns, ticking the correct cell ----
    const matrixColumns: QuestionGroupProps[] = formik.values.config?.columns ?? [];
    const correctCells: CorrectCellsProps = formik.values.correct_cells ?? {};
    const multiplePerRow = Boolean(formik.values.config?.multiple_per_row);

    const setConfig = (patch: Partial<QuestionProps["config"]>) =>
        formik.setFieldValue("config", { ...formik.values.config, ...patch });

    const addColumn = () =>
        setConfig({ columns: [...matrixColumns, { key: `col_${matrixColumns.length + 1}`, label: "" }] });

    const updateColumn = (index: number, patch: Partial<QuestionGroupProps>) =>
        setConfig({ columns: matrixColumns.map((c, i) => (i === index ? { ...c, ...patch } : c)) });

    const removeColumn = (index: number) => {
        const removed = matrixColumns[index];
        setConfig({ columns: matrixColumns.filter((_, i) => i !== index) });

        // Drop any ticks pointing at the column that just went away.
        const next: CorrectCellsProps = {};
        for (const [rowKey, cols] of Object.entries(correctCells)) {
            next[rowKey] = cols.filter((c) => c !== removed.key);
        }
        formik.setFieldValue("correct_cells", next);
    };

    /**
     * One tick per row by default — a Likert scale is a single choice. With
     * `multiple_per_row` the row accumulates instead.
     */
    const toggleCell = (rowKey: string, columnKey: string) => {
        const current = correctCells[rowKey] ?? [];
        const next = multiplePerRow
            ? current.includes(columnKey)
                ? current.filter((c) => c !== columnKey)
                : [...current, columnKey]
            : current.includes(columnKey)
                ? []
                : [columnKey];

        formik.setFieldValue("correct_cells", { ...correctCells, [rowKey]: next });
    };

    /** Drag and drop: the option order IS the answer. */
    const moveOption = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= formik.values.options.length) return;

        const next = [...formik.values.options];
        [next[index], next[target]] = [next[target], next[index]];
        formik.setFieldValue(
            "options",
            next.map((opt, i) => ({ ...opt, position: i }))
        );
    };

    const removeOption = (index: number) => {
        const newOptions = formik.values.options.filter((_, i) => i !== index);
        formik.setFieldValue("options", newOptions);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = formik.values.options.map((opt, i) =>
            i === index ? { ...opt, option: value } : opt
        );
        formik.setFieldValue("options", newOptions);
    };

    /**
     * Multiple choice stays single-answer (ticking one clears the rest). Every
     * other format toggles independently — and within a grouped format the
     * exclusivity applies per row/blank/zone, not across the whole question.
     */
    const handleCorrectAnswerChange = (index: number) => {
        const target = formik.values.options[index];

        const newOptions = formik.values.options.map((opt, i) => {
            if (i === index) return { ...opt, is_correct: !opt.is_correct };

            if (questionType === "mcq") return { ...opt, is_correct: false };

            if (isGrouped && opt.group_key === target.group_key) {
                return { ...opt, is_correct: false };
            }

            return opt;
        });

        formik.setFieldValue("options", newOptions);
    };

    const selectedQuestionType = questionTypes.find(
        (qt) => qt.value === formik.values.question_type
    );

    const selectedMegaCategory = megaCategories.find(
        (mc: any) => mc.id === formik.values.megacategory_id
    );

    return (
        <form onSubmit={formik.handleSubmit} className="h-full overflow-hidden">
            <Box
                className="flex flex-col justify-start items-start gap-3 p-3  rounded-lg  overflow-auto"
                sx={{
                    height: "calc(100% - 150px)"
                }}
            >
                <div className="flex flex-col gap-6 md:grid md:grid-cols-2 w-full">
                    <div className="col-span-1">
                        <div className="input__field">
                            <InputLabel>Question Type</InputLabel>
                            <Autocomplete
                                disableClearable
                                options={questionTypes}
                                value={selectedQuestionType || questionTypes[0]}
                                onChange={(_, newValue) => {
                                    const next = newValue.value;
                                    formik.setFieldValue("question_type", next);

                                    if (next === "subjective") {
                                        formik.setFieldValue("options", []);
                                        formik.setFieldValue("config", null);
                                        return;
                                    }

                                    /**
                                     * Answer keys do not survive a format change —
                                     * a SATA key is invalid as MCQ, and group keys
                                     * are meaningless once the format is flat. Clear
                                     * them rather than submitting a broken item.
                                     */
                                    formik.setFieldValue(
                                        "options",
                                        formik.values.options.length === 0
                                            ? [{ id: null, option: "", is_correct: false, position: 0, group_key: null }]
                                            : formik.values.options.map((opt, i) => ({
                                                ...opt,
                                                is_correct: false,
                                                position: i,
                                                group_key: GROUPED_TYPES.includes(next) ? opt.group_key ?? null : null
                                            }))
                                    );

                                    if (next === "matrix") {
                                        // Seed a small grid so there is something to fill in.
                                        formik.setFieldValue("config", {
                                            groups: [
                                                { key: "row_1", label: "" },
                                                { key: "row_2", label: "" }
                                            ],
                                            columns: [
                                                { key: "col_1", label: "" },
                                                { key: "col_2", label: "" }
                                            ],
                                            multiple_per_row: false
                                        });
                                        formik.setFieldValue("correct_cells", {});
                                        formik.setFieldValue("options", []);
                                        return;
                                    }

                                    formik.setFieldValue("correct_cells", undefined);

                                    if (next === "highlight") {
                                        formik.setFieldValue("config", {
                                            highlight_types: [
                                                { key: "type_1", label: "Relevant", color: HIGHLIGHT_COLORS[2] }
                                            ],
                                            spans: []
                                        });
                                        setActiveHighlightType("type_1");
                                        formik.setFieldValue("options", []);
                                        return;
                                    }

                                    if (next === "cloze") {
                                        formik.setFieldValue("config", { groups: [{ key: "blank_1", label: "" }] });
                                        formik.setFieldValue("options", [
                                            { id: null, option: "", is_correct: false, position: 0, group_key: "blank_1" },
                                            { id: null, option: "", is_correct: false, position: 1, group_key: "blank_1" }
                                        ]);
                                        return;
                                    }

                                    if (next === "drag_into_text") {
                                        /**
                                         * Choices start empty: the gaps come
                                         * from the question text, so there is
                                         * nothing sensible to seed until the
                                         * author writes it.
                                         */
                                        formik.setFieldValue("config", {
                                            gap_answers: {},
                                            choice_groups: {},
                                            unlimited_choices: [],
                                            shuffle_choices: false
                                        });
                                        formik.setFieldValue("options", [
                                            { id: null, option: "", is_correct: false, position: 0, group_key: null },
                                            { id: null, option: "", is_correct: false, position: 1, group_key: null }
                                        ]);
                                        return;
                                    }

                                    if (next === "bow_tie") {
                                        /**
                                         * Seeded as the canonical NCLEX shape —
                                         * two actions, one condition, two
                                         * parameters — so the author starts
                                         * from a real bow-tie rather than an
                                         * empty grid.
                                         */
                                        formik.setFieldValue("config", {
                                            groups: BOW_TIE_DEFAULT_GROUPS,
                                            response_area_titles: BOW_TIE_DEFAULT_AREA_TITLES,
                                            scoring_type: "exact_match"
                                        });
                                        formik.setFieldValue(
                                            "options",
                                            BOW_TIE_DEFAULT_GROUPS.flatMap((group, groupIndex) =>
                                                Array.from({ length: 2 }).map((_, i) => ({
                                                    id: null,
                                                    option: "",
                                                    is_correct: false,
                                                    position: groupIndex * 2 + i,
                                                    group_key: group.key
                                                }))
                                            )
                                        );
                                        return;
                                    }

                                    formik.setFieldValue(
                                        "config",
                                        next === "select_n"
                                            ? { select_n: 2 }
                                            : GROUPED_TYPES.includes(next)
                                                ? { groups: formik.values.config?.groups ?? [{ key: "group_1", label: "" }] }
                                                : null
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select Question Type"
                                        error={
                                            formik.touched.question_type &&
                                            Boolean(formik.errors.question_type)
                                        }
                                        helperText={
                                            formik.touched.question_type &&
                                            formik.errors.question_type
                                        }
                                    />
                                )}
                                fullWidth
                            />
                        </div>
                    </div>

                    {formik.values.question_type !== "mcq" ?
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel>
                                    Question Weight{" "}
                                    <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                        className="inline-block"
                                    >
                                        {isObjective
                                            ? "Marks this question is worth. Leave blank to use the test's marks per question."
                                            : "Marks this question holds."}
                                    </Typography>
                                </InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    name="points"
                                    value={formik.values.points}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter Total Marks"
                                    type="number"
                                    error={formik.touched.points && Boolean(formik.errors.points)}
                                />
                                {formik.touched.points && formik.errors.points && (
                                    <Typography variant="caption" color="error">
                                        {formik.errors.points}
                                    </Typography>
                                )}
                            </div>
                        </div> : <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel>Contains Image Options</InputLabel>
                                <YesNoSwitch
                                    checked={formik.values.has_image_in_option}
                                    onChange={(e) => formik.setFieldValue("has_image_in_option", e.target.checked)}
                                />
                            </div>
                        </div>
                    }

                    {isObjective && (
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel>Difficulty</InputLabel>
                                <Autocomplete
                                    disableClearable
                                    options={difficulties}
                                    value={
                                        difficulties.find((d) => d.value === (formik.values.difficulty ?? "medium")) ||
                                        difficulties[1]
                                    }
                                    onChange={(_, newValue) =>
                                        formik.setFieldValue("difficulty", newValue.value)
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder="Select Difficulty" />
                                    )}
                                    fullWidth
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Used to pick the next item in an adaptive exam.
                                </Typography>
                            </div>
                        </div>
                    )}

                    <div className="col-span-2">
                        <div className="input__field">
                            <InputLabel>Mega Category</InputLabel>
                            <Autocomplete
                                options={megaCategories}
                                loading={isLoading}
                                value={selectedMegaCategory || null}
                                onChange={(_, newValue: any) => {
                                    formik.setFieldTouched("megacategory_id", true, false);
                                    formik.setFieldValue("megacategory_id", newValue?.id || null);
                                }}
                                onBlur={() => formik.setFieldTouched("megacategory_id", true)}
                                getOptionLabel={(option: any) => option.name || ""}
                                isOptionEqualToValue={(option: any, value: any) =>
                                    option.id === value.id
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select Mega Category"
                                        error={
                                            formik.touched.megacategory_id &&
                                            Boolean(formik.errors.megacategory_id)
                                        }
                                        helperText={
                                            formik.touched.megacategory_id &&
                                            formik.errors.megacategory_id
                                        }
                                    />
                                )}
                                fullWidth
                            />
                           
                        </div>
                    </div>

                    <div className="col-span-2">
                        <div className="input__field">
                            {/* <InputLabel>Question</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="question"
                            value={formik.values.question}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter Question"
                            multiline
                            rows={3}
                            error={formik.touched.question && Boolean(formik.errors.question)}
                        />
                        {formik.touched.question && formik.errors.question && (
                            <Typography variant="caption" color="error">
                                {formik.errors.question}
                            </Typography>
                        )} */}
                            <TextEditor
                                label={`Question`}
                                value={formik.values.question}
                                onChange={(value) => formik.setFieldValue("question", value)}
                                onBlur={() => formik.setFieldTouched("question")}
                                error={
                                    formik.touched.question &&
                                    (formik.errors.question as any)
                                }
                            />
                        </div>
                    </div>
                </div>

                {isObjective && (
                    <>
                        <div className="mt-6 w-full">
                            {!isBowTie && !isDragIntoText && (
                                <Typography variant="subtitle1" color="text.primary">
                                    Answer Options
                                </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                                {questionType === "mcq" && "Exactly one option is correct — selecting another moves the tick. For more than one correct answer, switch the type to Select All That Apply."}
                                {questionType === "sata" && "Any number of options may be correct. The student is never told how many."}
                                {questionType === "select_n" && "Mark exactly as many correct options as the question asks for."}
                                {isMatrix && "Build the grid below. Every row needs one correct answer ticked."}
                                {isCloze && "Each dropdown below is one blank, with one correct answer."}
                                {isGrouped && "Every zone needs its own options and exactly one correct answer."}
                                {isOrdered && "The order below is the correct answer. Use the arrows to arrange it."}
                                {isHighlight && "Paste the text below, then select the words that are the correct answer."}
                            </Typography>
                        </div>

                        {questionType === "select_n" && (
                            <div className="input__field w-full max-w-xs">
                                <InputLabel>How many options must the student select?</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    value={formik.values.config?.select_n ?? ""}
                                    onChange={(e) =>
                                        formik.setFieldValue("config", {
                                            ...formik.values.config,
                                            select_n: Number(e.target.value)
                                        })
                                    }
                                />
                            </div>
                        )}

                        {isObjective && (
                            <ScoringPanel
                                questionType={questionType}
                                config={formik.values.config}
                                onConfigChange={(patch: Partial<QuestionConfigProps>) =>
                                    formik.setFieldValue("config", {
                                        ...formik.values.config,
                                        ...patch
                                    })
                                }
                                showCheckAnswer={isBowTie}
                            />
                        )}

                        {isDragIntoText && (
                            <DragIntoTextEditor
                                question={formik.values.question}
                                options={formik.values.options}
                                config={formik.values.config}
                                error={
                                    typeof formik.errors.options === "string"
                                        ? formik.errors.options
                                        : undefined
                                }
                                onOptionsChange={(next: OptionProps[]) =>
                                    formik.setFieldValue("options", next)
                                }
                                onConfigChange={(patch: Partial<QuestionConfigProps>) =>
                                    formik.setFieldValue("config", {
                                        ...formik.values.config,
                                        ...patch
                                    })
                                }
                                onLoadExample={(nextQuestion, nextOptions, nextConfig) => {
                                    // Written together: setting them one at a
                                    // time reads a stale config and clobbers it.
                                    formik.setValues({
                                        ...formik.values,
                                        question: nextQuestion,
                                        options: nextOptions,
                                        config: { ...formik.values.config, ...nextConfig }
                                    });
                                }}
                            />
                        )}

                        {isBowTie && (
                            <BowTieEditor
                                groups={groups}
                                options={formik.values.options}
                                config={formik.values.config}
                                question={formik.values.question}
                                error={
                                    typeof formik.errors.options === "string"
                                        ? formik.errors.options
                                        : undefined
                                }
                                onGroupsChange={(next) =>
                                    formik.setFieldValue("config", {
                                        ...formik.values.config,
                                        groups: next
                                    })
                                }
                                onOptionsChange={(next: OptionProps[]) =>
                                    formik.setFieldValue("options", next)
                                }
                                onConfigChange={(patch: Partial<QuestionConfigProps>) =>
                                    formik.setFieldValue("config", {
                                        ...formik.values.config,
                                        ...patch
                                    })
                                }
                                onLoadExample={(nextGroups, nextOptions, nextConfig) => {
                                    // Written together: setting them one at a
                                    // time reads a stale config and clobbers it.
                                    formik.setValues({
                                        ...formik.values,
                                        options: nextOptions,
                                        config: { ...formik.values.config, ...nextConfig, groups: nextGroups }
                                    });
                                }}
                            />
                        )}

                        {isHighlight && (
                            <HighlightEditor
                                passage={formik.values.passage ?? ""}
                                types={highlightTypes}
                                spans={highlightSpans}
                                activeType={activeHighlightType}
                                error={
                                    (formik.touched.passage && (formik.errors.passage as string)) ||
                                    (formik.errors as Record<string, unknown>).config as string | undefined
                                }
                                onPassageChange={(value) => {
                                    formik.setFieldValue("passage", value);
                                    // Offsets are measured against the passage, so
                                    // editing it invalidates every existing mark.
                                    if (highlightSpans.length > 0) {
                                        setConfig({ spans: [] });
                                    }
                                }}
                                onTypesChange={(types) => setConfig({ highlight_types: types })}
                                onSpansChange={(spans) => setConfig({ spans })}
                                onActiveTypeChange={setActiveHighlightType}
                                onLoadExample={(text, types, spans) => {
                                    // One update: passage, types and spans applied
                                    // together so none of them reads a stale config.
                                    formik.setFieldValue("passage", text);
                                    formik.setFieldValue("config", {
                                        ...formik.values.config,
                                        highlight_types: types,
                                        spans
                                    });
                                }}
                            />
                        )}

                        {isMatrix && (
                            <div className="w-full flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <Typography variant="subtitle2">Rows and columns</Typography>
                                    <FormControlLabel
                                        label="Allow more than one answer per row"
                                        control={
                                            <Checkbox
                                                checked={multiplePerRow}
                                                onChange={(e) => setConfig({ multiple_per_row: e.target.checked })}
                                            />
                                        }
                                    />
                                </div>

                                <div className="overflow-x-auto w-full">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="p-2 text-left min-w-[180px]">
                                                    <Typography variant="caption" color="text.secondary">
                                                        Row / Column
                                                    </Typography>
                                                </th>
                                                {matrixColumns.map((column, ci) => (
                                                    <th key={ci} className="p-2 min-w-[150px]">
                                                        <div className="flex flex-col gap-1">
                                                            <OutlinedInput
                                                                size="small"
                                                                placeholder="Column label"
                                                                value={column.label ?? ""}
                                                                onChange={(e) => updateColumn(ci, { label: e.target.value })}
                                                            />
                                                            <Button color="error" size="small" onClick={() => removeColumn(ci)}>
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="p-2">
                                                    <Button size="small" startIcon={<Add />} onClick={addColumn}>
                                                        Add column
                                                    </Button>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groups.map((row, ri) => (
                                                <tr key={ri}>
                                                    <td className="p-2">
                                                        <div className="flex items-center gap-2">
                                                            <OutlinedInput
                                                                size="small"
                                                                fullWidth
                                                                placeholder="Row label"
                                                                value={row.label ?? ""}
                                                                onChange={(e) => updateGroup(ri, { label: e.target.value })}
                                                            />
                                                            <Button color="error" size="small" onClick={() => removeGroup(ri)}>
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    {matrixColumns.map((column, ci) => {
                                                        const ticked = (correctCells[row.key] ?? []).includes(column.key);

                                                        return (
                                                            <td key={ci} className="p-2 text-center">
                                                                {multiplePerRow ? (
                                                                    <Checkbox
                                                                        color="success"
                                                                        checked={ticked}
                                                                        onChange={() => toggleCell(row.key, column.key)}
                                                                    />
                                                                ) : (
                                                                    <Radio
                                                                        color="success"
                                                                        checked={ticked}
                                                                        onChange={() => toggleCell(row.key, column.key)}
                                                                    />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td />
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <Button
                                    variant="text"
                                    startIcon={<Add />}
                                    onClick={addGroup}
                                    className="self-start font-medium!"
                                >
                                    Add row
                                </Button>

                                <Typography variant="caption" color="text.secondary">
                                    Tick the correct answer in every row. The student sees this same grid
                                    without the ticks.
                                </Typography>
                            </div>
                        )}

                        {isCloze && (
                            <div className="w-full flex flex-col gap-5">
                                <Typography variant="caption" color="text.secondary">
                                    Each dropdown below is one blank. To place a dropdown inside the
                                    sentence, type its marker (e.g. <code>{"{{blank_1}}"}</code>) into the
                                    question text — otherwise it appears beneath the question.
                                </Typography>

                                {groups.map((blank, bi) => {
                                    const blankOptions = formik.values.options
                                        .map((option, index) => ({ option, index }))
                                        .filter(({ option }) => option.group_key === blank.key);

                                    return (
                                        <Box
                                            key={bi}
                                            className="rounded-lg p-3 flex flex-col gap-3"
                                            sx={{ border: 1, borderColor: "divider" }}
                                        >
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <Typography variant="subtitle2" className="whitespace-nowrap">
                                                    Dropdown {bi + 1}
                                                </Typography>
                                                <OutlinedInput
                                                    size="small"
                                                    placeholder="marker key"
                                                    value={blank.key}
                                                    onChange={(e) => updateGroup(bi, { key: e.target.value })}
                                                    sx={{ maxWidth: 180 }}
                                                />
                                                <OutlinedInput
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Label (optional)"
                                                    value={blank.label ?? ""}
                                                    onChange={(e) => updateGroup(bi, { label: e.target.value })}
                                                />
                                                {groups.length > 1 && (
                                                    <Button color="error" size="small" onClick={() => removeGroup(bi)}>
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>

                                            {blankOptions.map(({ option, index }) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Radio
                                                        color="success"
                                                        checked={option.is_correct}
                                                        onChange={() => handleCorrectAnswerChange(index)}
                                                    />
                                                    <OutlinedInput
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Type option"
                                                        value={option.option}
                                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                                    />
                                                    <Button
                                                        color="error"
                                                        size="small"
                                                        onClick={() => removeOption(index)}
                                                        disabled={blankOptions.length <= 2}
                                                    >
                                                        ✕
                                                    </Button>
                                                </div>
                                            ))}

                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Button size="small" startIcon={<Add />} onClick={() => addOption(blank.key)}>
                                                    Add option
                                                </Button>
                                                <Button
                                                    size="small"
                                                    onClick={() => addNoneOfTheAbove(blank.key)}
                                                    disabled={blankOptions.some(({ option }) => option.option === NONE_OF_THE_ABOVE)}
                                                >
                                                    Add "{NONE_OF_THE_ABOVE}"
                                                </Button>
                                            </div>

                                            <Typography variant="caption" color="text.secondary">
                                                Select the radio beside the correct option.
                                            </Typography>
                                        </Box>
                                    );
                                })}

                                <Button
                                    variant="text"
                                    startIcon={<Add />}
                                    onClick={addGroup}
                                    className="self-start font-medium!"
                                >
                                    Add dropdown
                                </Button>
                            </div>
                        )}

                        {isGrouped && (
                            <div className="w-full flex flex-col gap-3">
                                <Typography variant="subtitle2">Zones</Typography>
                                {groups.map((group, gi) => (
                                    <div key={gi} className="flex items-center gap-3">
                                        <OutlinedInput
                                            size="small"
                                            placeholder="key (e.g. row_1)"
                                            value={group.key}
                                            onChange={(e) => updateGroup(gi, { key: e.target.value })}
                                        />
                                        <OutlinedInput
                                            size="small"
                                            fullWidth
                                            placeholder="Label shown to the student"
                                            value={group.label ?? ""}
                                            onChange={(e) => updateGroup(gi, { label: e.target.value })}
                                        />
                                        <Button color="error" size="small" onClick={() => removeGroup(gi)}>
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="text"
                                    startIcon={<Add />}
                                    onClick={addGroup}
                                    className="self-start font-medium!"
                                >
                                    Add Zone
                                </Button>
                            </div>
                        )}

                        {/*
                          * Matrix and cloze author their answers in their own
                          * editors above, so the raw option cards are not
                          * rendered for them — a matrix regenerates its options
                          * from the grid on save, making hand-edits here silently
                          * pointless.
                          */}
                        {!hasOwnOptionEditor && (
                        <div className="flex flex-col md:grid grid-cols-2 gap-4">
                            {formik.values.options.map((option, index) => (
                                <div key={index} className="flex flex-col gap-4">
                                    <TextEditor
                                        label={`Option ${index + 1}`}
                                        value={option.option}
                                        onChange={(value) => handleOptionChange(index, value)}
                                        onBlur={() =>
                                            formik.setFieldTouched(`options.${index}.option`, true)
                                        }
                                        error={
                                            formik.touched.options?.[index]?.option &&
                                            (formik.errors.options?.[index] as any)?.option
                                        }
                                    />

                                    <div className="flex items-center gap-4 flex-wrap">
                                        {isGrouped && (
                                            <Autocomplete
                                                size="small"
                                                disableClearable
                                                sx={{ minWidth: 160 }}
                                                options={groups.map((g) => g.key)}
                                                value={option.group_key ?? groups[0]?.key ?? ""}
                                                onChange={(_, key) => {
                                                    const next = formik.values.options.map((o, i) =>
                                                        i === index ? { ...o, group_key: key } : o
                                                    );
                                                    formik.setFieldValue("options", next);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField {...params} placeholder="Group" />
                                                )}
                                            />
                                        )}

                                        {isOrdered ? (
                                            <div className="flex items-center gap-1">
                                                <Typography variant="caption" color="text.secondary">
                                                    Position {index + 1}
                                                </Typography>
                                                <Button size="small" onClick={() => moveOption(index, -1)} disabled={index === 0}>
                                                    ↑
                                                </Button>
                                                <Button
                                                    size="small"
                                                    onClick={() => moveOption(index, 1)}
                                                    disabled={index === formik.values.options.length - 1}
                                                >
                                                    ↓
                                                </Button>
                                            </div>
                                        ) : (
                                            <FormControlLabel
                                                label="Mark Correct Answer"
                                                control={
                                                    /**
                                                     * A radio where only one answer is
                                                     * allowed, a checkbox where several
                                                     * are — so the control itself shows
                                                     * what the format permits, rather
                                                     * than a checkbox that silently
                                                     * unticks the previous choice.
                                                     */
                                                    questionType === "mcq" || isGrouped ? (
                                                        <Radio
                                                            color="success"
                                                            checked={option.is_correct}
                                                            onChange={() => handleCorrectAnswerChange(index)}
                                                        />
                                                    ) : (
                                                        <Checkbox
                                                            color="success"
                                                            checked={option.is_correct}
                                                            onChange={() => handleCorrectAnswerChange(index)}
                                                        />
                                                    )
                                                }
                                                className="items-center!"
                                            />
                                        )}
                                        {formik.values.options.length > 1 && (
                                            <Button
                                                onClick={() => removeOption(index)}
                                                color="error"
                                                size="small"
                                                className="gap-1! items-center!"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M7.08331 4.14175L7.26665 3.05008C7.39998 2.25841 7.49998 1.66675 8.90831 1.66675H11.0916C12.5 1.66675 12.6083 2.29175 12.7333 3.05841L12.9166 4.14175" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M15.7084 7.6167L15.1667 16.0084C15.075 17.3167 15 18.3334 12.675 18.3334H7.32502C5.00002 18.3334 4.92502 17.3167 4.83335 16.0084L4.29169 7.6167" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M8.60834 13.75H11.3833" stroke="#848484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M7.91669 10.4167H12.0834" stroke="#848484" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <Typography variant="subtitle1">Delete</Typography>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        )}

                        {formik.touched.options && typeof formik.errors.options === "string" && (
                            <Typography variant="caption" color="error" className="mt-2 block">
                                {formik.errors.options}
                            </Typography>
                        )}

                        {!hasOwnOptionEditor && formik.values.options.length < optionCap && (
                            <Button
                                variant="text"
                                color="primary"
                                className="font-medium! mt-4"
                                startIcon={<Add />}
                                onClick={() => addOption(isGrouped ? groups[0]?.key : undefined)}
                            >
                                Add Options
                            </Button>
                        )}
                    </>
                )}

            </Box>
            <FooterAction
                handleConfirmationChange={() => setOpen(false)}
                isLoading={isLoading}
                isEditMode={isEditMode}
                isUpdating={isLoading}
                replaceLabel={isEditMode ? isLoading
                    ? "Updating Question..."
                    : "Update Question"
                    : isLoading
                        ? "Creating Question..."
                        : "Create Question"}
            />
        </form>
    );
}