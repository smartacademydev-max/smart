import dayjs from "dayjs";
import * as Yup from "yup";
import type { DiscountTypeProps, SelectionType } from "./course";
import type { Pagination } from "./roleAndPermission";
import type { GlobalResponse, User } from "./user";
export type QuestionTypeProps =
    | "mcq"
    | "sata"
    | "select_n"
    | "matrix"
    | "cloze"
    | "highlight"
    | "drag_drop"
    | "bow_tie"
    | "drag_into_text"
    | "subjective"
    | "omr"

/** How a format stores its answer key. Mirrors the backend QuestionShape enum. */
export type QuestionShapeProps = "flat" | "grouped" | "ordered" | "gaps" | "manual"

export type QuestionDifficultyProps = "easy" | "medium" | "hard"

/** Formats where the student may tick more than one option. */
export const MULTI_SELECT_TYPES: QuestionTypeProps[] = [
    "sata", "select_n", "matrix", "cloze", "highlight", "drag_drop", "bow_tie",
    "drag_into_text"
];

/** Formats whose options belong to a row, blank, or zone declared in config. */
export const GROUPED_TYPES: QuestionTypeProps[] = ["matrix", "cloze", "bow_tie"];

export const QUESTION_TYPE_LABELS: Record<QuestionTypeProps, string> = {
    mcq: "Multiple Choice",
    sata: "Select All That Apply",
    select_n: "Select N",
    matrix: "Matrix / Grid",
    cloze: "Cloze / Drop-down",
    highlight: "Highlight",
    drag_drop: "Ordering",
    bow_tie: "Bow-tie",
    drag_into_text: "Drag and Drop into Text",
    subjective: "Subjective",
    omr: "OMR"
};

/**
 * Every auto-graded format. A test of type "mcq" accepts any of these, so the
 * question picker filters on this list rather than on the test's own type —
 * which names the kind of test, not a question format.
 *
 * Derived from the labels so a newly added format is never silently left out.
 */
export const OBJECTIVE_QUESTION_TYPES: QuestionTypeProps[] = (
    Object.keys(QUESTION_TYPE_LABELS) as QuestionTypeProps[]
).filter((type) => type !== "subjective" && type !== "omr");


export interface QuestionGroupProps {
    /** Stable key an option points at via `group_key`. */
    key: string;
    label?: string | null;
    /**
     * Bow-tie only: how many tiles this response group's drop area holds — the
     * canonical item is two actions, one condition and two parameters. Must
     * match how many of the group's options are ticked correct.
     */
    count?: number;
}

export interface QuestionConfigProps {
    /** Select N: how many options the student must pick. */
    select_n?: number;
    /** Matrix rows / cloze blanks / bow-tie zones. */
    groups?: QuestionGroupProps[];
    /** Matrix only: the shared answer scale reused across every row. */
    columns?: QuestionGroupProps[];
    /** Matrix only: whether a row may have more than one answer. */
    multiple_per_row?: boolean;
    /** Highlight only: the coloured categories to mark the passage with. */
    highlight_types?: HighlightTypeProps[];
    /** Highlight only: the spans the author marked as correct. */
    spans?: HighlightSpanProps[];
    /**
     * Bow-tie only. Scoring belongs to the item rather than the test, so an
     * exact-match bow-tie keeps behaving that way inside a partial-credit
     * paper. Mirrors the options Learnosity exposes on the question.
     */
    scoring_type?: BowTieScoringProps;
    /** Bow-tie: answered but never contributes marks. */
    unscored?: boolean;
    /** Bow-tie: marks awarded merely for attempting the item. */
    min_points_if_attempted?: number;
    /** Bow-tie: offer the student a "Check answer" button. */
    check_answer?: boolean;
    /** Bow-tie: how many times it may be used. 0 means unlimited. */
    check_answer_attempts?: number;
    /** Share of the question's marks lost per wrong selection. */
    penalty_percent?: number;
    /** Ceiling on partial credit, so a near-miss stays below full marks. */
    partial_credit_cap_percent?: number;
    /**
     * What one correct element earns — an option, row, zone or gap. Unset,
     * the question's marks are split evenly across its elements.
     */
    marks_per_element?: number;
    /**
     * Bow-tie: the titles on the diagram itself ("Action to Take",
     * "Condition Most Likely Experiencing"), which read differently from the
     * response group titles below it ("Actions to Take").
     */
    response_area_titles?: string[];
    /**
     * Drag into text: which choice fills each gap, as `gap number => option id`
     * (or, before saving, the choice's index in the payload). One choice may
     * fill several gaps, so this cannot live on the option itself.
     */
    gap_answers?: Record<number, number>;
    /**
     * Drag into text: the colour-coded group each choice belongs to. A choice
     * only drops into a gap of the same group.
     */
    choice_groups?: Record<number, number>;
    /** Drag into text: choices reusable across gaps instead of consumed. */
    unlimited_choices?: number[];
    /** Drag into text: show the choices in a random order. */
    shuffle_choices?: boolean;
}

/** Colours for drag-into-text choice groups, indexed by group number - 1. */
export const CHOICE_GROUP_COLORS: string[] = [
    "#93C5FD", "#86EFAC", "#FDE047", "#FCA5A5", "#D8B4FE", "#7DD3FC"
];

/**
 * Exact Match needs every drop area right for any marks; Partial Match Per
 * Element scores each drop area on its own.
 */
export type BowTieScoringProps = "exact_match" | "partial_match_per_element";

/** The canonical NCLEX bow-tie: two actions, one condition, two parameters. */
export const BOW_TIE_DEFAULT_GROUPS: QuestionGroupProps[] = [
    { key: "actions", label: "Actions to Take", count: 2 },
    { key: "conditions", label: "Potential Conditions", count: 1 },
    { key: "parameters", label: "Parameters to Monitor", count: 2 }
];

export const BOW_TIE_DEFAULT_AREA_TITLES: string[] = [
    "Action to Take",
    "Condition Most Likely Experiencing",
    "Parameter to Monitor"
];

/** Matrix answer key: row key → the correct column key(s). */
export type CorrectCellsProps = Record<string, string[]>;

/** A named, coloured category a highlight question is marked up with. */
export interface HighlightTypeProps {
    key: string;
    label?: string | null;
    color?: string;
}

/** A marked range over the passage, as character offsets. */
export interface HighlightSpanProps {
    type: string;
    start: number;
    end: number;
}

/** Default palette offered when adding a highlight type. */
export const HIGHLIGHT_COLORS = [
    "#22C55E", "#EF4444", "#FDE047", "#38BDF8",
    "#A78BFA", "#FB923C", "#94A3B8", "#F472B6"
];

export interface OptionProps {
    id: number | null,
    option: string,
    is_correct: boolean,
    /** Explicit ordering; the answer itself for drag_drop. */
    position?: number,
    /** Which row / blank / zone this belongs to. Null for flat formats. */
    group_key?: string | null
}

export interface QuestionLabelProps {
    id: number;
    name: string;
    created_by: string;
    number_of_questions: number;
    created_at: string;
}

export interface QuestionLabelList extends GlobalResponse {
    data: {
        data: QuestionLabelProps[];
        pagination: Pagination;
    }
}

export interface QuestionLabelFormProps {
    id?: number;
    name: string;
}

export interface QuestionLabelDetailProps extends QuestionLabelProps {
    questions: QuestionProps[];
}

export interface QuestionLabelDetailResponse extends GlobalResponse {
    data: QuestionLabelDetailProps;
}

export interface QuestionProps {
    id: number | null;
    points: number;
    question: string;
    options: OptionProps[],
    megacategory_id: number | null;
    question_type: QuestionTypeProps
    has_image_in_option: boolean;
    difficulty?: QuestionDifficultyProps;
    config?: QuestionConfigProps | null;
    /** Matrix only. Options are generated from these server-side. */
    correct_cells?: CorrectCellsProps;
    /** Highlight only: the text the student marks up. */
    passage?: string | null;
    your_answer_id?: number;
    /** Multi-select review: the scalar above is only the first selection. */
    your_answer_ids?: number[];
    correct_answer_ids?: number[];
    type?: "correct" | "incorrect" | "skipped",
    media_files?: {
        id: number;
        url: string;
    }[];
    mark_obtained?: string,
    checked_by?: string,
    checked_at?: string,
    submitted_at?: string,
    feedback?: string
}

export const QuestionInitialState: QuestionProps = {
    id: null,
    points: 0,
    question: "",
    options: [{ id: null, option: "", is_correct: false }, { id: null, option: "", is_correct: false }],
    megacategory_id: null,
    question_type: "mcq",
    has_image_in_option: false,
    difficulty: "medium",
    config: null,
};

export interface QuestionList extends GlobalResponse {
    data: {
        data: QuestionProps[];
        pagination: Pagination;
        overview: {
            test_type: TestTypeProps;
        }
    }
}
export type TestTypeProps = "subjective" | "mcq" | "omr"

export interface TestProps {
    test_type: TestTypeProps;
    id?: number;
    name: string;
    duration: {
        hours: number;
        minutes: number;
    };
    full_mark: number;
    pass_mark: number;
    start_datetime: string | null;
    end_datetime: string | null;
    course_ids: number[];
    question_ids: number[];
    set_ids: number[];
    set_question_count?: number;
    category?: string[];
    questions?: number;
    status?: null;
    test_published_status?: "published" | "draft"
    no_of_students?: number;
    is_scheduled: boolean;
    total_questions: number | null;
    marks_per_question: number | null;
    created_at?: string;
    has_published?: boolean;
    price: string;
    rules: string;
    is_individual_test: boolean;
    discount: number | null;
    discount_type: DiscountTypeProps;
    omr_format?: number | null
    /** Auto-graded tests (mcq/omr) only. Off by default — no deduction for wrong answers. */
    negative_marking_enabled?: boolean;
    /** Percent of the question's marks deducted per wrong answer. API returns it as a string ("25.00"), or null while disabled. */
    negative_marking_percentage?: number | string | null;
}

export const TestInitialState: TestProps = {
    test_type: "mcq",
    name: "",
    duration: {
        hours: 0,
        minutes: 0
    },
    full_mark: 0,
    pass_mark: 0,
    start_datetime: null,
    end_datetime: null,
    course_ids: [],
    question_ids: [],
    set_ids: [],
    is_scheduled: true,
    total_questions: null,
    marks_per_question: 1,
    is_individual_test: false,
    price: "",
    rules: "",
    discount: null,
    discount_type: "percentage",
    omr_format: null,
    negative_marking_enabled: false,
    negative_marking_percentage: null,
};

export interface TestList {
    data: {
        data: TestProps[]
        pagination: Pagination
    }
}

export const testValidationSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .required("Name is required"),

    test_type: Yup.string()
        .oneOf(["mcq", "subjective", "omr"], "Invalid test type")
        .required("Test type is required"),

    total_questions: Yup.number()
        .min(1, "Total questions must be at least 1")
        .required("Total questions is required"),

    duration: Yup.object()
        .shape({
            hours: Yup.number().min(0).max(999).nullable(),
            minutes: Yup.number().min(0).max(59).nullable()
        })
        .test(
            "duration-required",
            "Either hours or minutes is required",
            function (value) {
                const hours = value?.hours ?? 0;
                const minutes = value?.minutes ?? 0;
                return hours > 0 || minutes > 0;
            }
        )
        .test(
            "duration-minimum",
            "Duration must be at least 1 minute",
            function (value) {
                const hours = value?.hours ?? 0;
                const minutes = value?.minutes ?? 0;
                return hours * 60 + minutes >= 1;
            }
        ),

    full_mark: Yup.number().when("test_type", {
        is: "subjective",
        then: (schema) => schema
            .min(1, "Full marks must be at least 1")
            .required("Full marks is required"),
        otherwise: (schema) => schema.notRequired()
    }),

    marks_per_question: Yup.number().when("test_type", {
        is: "mcq",
        then: (schema) => schema
            .min(1, "Marks per question must be at least 1")
            .required("Marks per question is required"),
        otherwise: (schema) => schema.notRequired()
    }),
    omr_format: Yup.number().when("test_type", {
        is: "omr",
        then: (schema) => schema
            .required("OMR Format is Required"),
        otherwise: (schema) => schema.notRequired()
    }),

    pass_mark: Yup.number()
        .min(0, "Pass marks must be at least 0")
        .required("Pass marks is required"),

    negative_marking_enabled: Yup.boolean().default(false),

    // Mirrors the backend's `required_if` rule: only demanded when the toggle is on,
    // and only for the two auto-graded test types that can deduct marks.
    negative_marking_percentage: Yup.number()
        .nullable()
        .when(["test_type", "negative_marking_enabled"], {
            is: (testType: string, enabled: boolean) =>
                (testType === "mcq" || testType === "omr") && enabled === true,
            then: (schema) => schema
                .typeError("Negative marking percentage is required")
                .min(0, "Percentage must be at least 0")
                .max(100, "Percentage cannot exceed 100")
                .required("Negative marking percentage is required"),
            otherwise: (schema) => schema.notRequired().nullable(),
        }),
    is_scheduled: Yup.boolean().default(false).required(),
    start_datetime: Yup.string().when("is_scheduled", { is: true, then: (schema) => schema.required("Start date & time is required"), otherwise: (schema) => schema.notRequired() }),
    end_datetime: Yup.string().when("is_scheduled", {
        is: true, then: (schema) => schema.required("End date & time is required").test("end-after-start", "End date must be after start date", function (value) {
            const { start_datetime } = this.parent;
            if (!start_datetime || !value) return true;
            return dayjs(value).isAfter(dayjs(start_datetime));
        }), otherwise: (schema) => schema.notRequired()
    }),
    question_ids: Yup.array()
        .of(Yup.number())
        .required("Question selection is required")
        .test(
            "question-min",
            "At least one question must be selected",
            function (value) {
                const { set_question_count } = this.parent;
                if (set_question_count && set_question_count > 0) return true;
                return value != null && value.length > 0;
            }
        )
        .test(
            "question-count",
            "Number of selected questions must equal total questions",
            function (value) {
                const { total_questions, set_question_count } = this.parent;
                if (!total_questions) return true;
                const setCount = set_question_count || 0;
                const questionCount = value?.length || 0;
                return questionCount + setCount === total_questions;
            }
        ),
    is_individual_test: Yup.boolean().required("Mark as individual test"),
    price: Yup.string().when("is_individual_test", {
        is: true,
        then: (schema) =>
            schema
                .trim()
                .required("Price is required"),
        otherwise: (schema) => schema.notRequired()
    }),

    rules: Yup.string().when("is_individual_test", {
        is: true,
        then: (schema) =>
            schema
                .trim()
                .required("Rules are required"),
        otherwise: (schema) => schema.notRequired()
    }),

});


export interface TestOverviewProps {
    total_students_enrolled: number;
    total_student_submitted: number;
    total_student_passed: number;
    average_score: number;
    high_score: number;
}

export interface TestOverviewResponse extends GlobalResponse {
    data: {
        total_students_enrolled: number;
        total_student_submitted: number;
        total_student_passed: number;
        average_score: number;
        high_score: number;
    }
}

export type ResultProps = "failed" | "passed";
export type TestStatus = "progress" | "completed";


export interface StudentSubmitTestProps {
    id: number,
    student: User,
    total_attempted: number,
    total_questions: number,
    total_correct: number,
    checked_answers: number,
    started_at: string,
    finished_at: string,
    timer: number,
    status: TestStatus,
    result: ResultProps,
    total_marks: number,
    score: number,
    test_type: TestTypeProps
}

export interface StudentSubmitTestList {
    data: {
        data: StudentSubmitTestProps[];
        pagination: Pagination;
    }
}

export interface SetProps {
    id?: number;
    name: string;
    description: string;
    price: string;
    discount_type: DiscountTypeProps;
    discount: string;
    set_count: string;
    test_ids: number[];
    thumbnail: File | null;
    thumbnail_url: string;
    status: "published" | "draft";
    marked_price?: string;
    sale_price?: string;
    selections: SelectionType;
}

export const setInitialValues: SetProps = {
    name: "",
    description: "",
    discount: "",
    discount_type: "percentage",
    price: "",
    set_count: "",
    thumbnail: null,
    test_ids: [],
    status: "draft",
    thumbnail_url: "",
    selections: {
        mega_category: [],
        category: {},
        sub_category: {},
        position_ids: [],
    },
};

export interface SetList extends GlobalResponse {
    data: {
        data: SetProps[];
        pagination: Pagination
    }
}

export interface OMRType {
    id: number;
    title: string;
    value: number
}

export interface OmrSheetProps {
    id?: number;
    sheet: File | null;
    sheet_url: string;
    name: string;
    omr_format: string;
    created_at?: string;
}

export interface OmrList extends GlobalResponse {
    data: {
        data: OmrSheetProps[],
        pagination: Pagination
    }
}

export interface OmrFormatProps {
    id?: number;
    title: string;
    test_instructions: string;
    omr_sheet_instructions: string;
    post_test_instructions: string;
    omr_note: string;
    qr_code: File | null;
    qr_code_url: string;
    wrong_method_image: File | null;
    wrong_method_image_url: string;
    correct_method_image: File | null;
    correct_method_image_url: string;
    created_at?: string;
}

export interface OmrFormatList extends GlobalResponse {
    data: {
        data: OmrFormatProps[];
        pagination: Pagination;
    }
}

export const OmrFormatInitialState: OmrFormatProps = {
    title: "",
    test_instructions: "",
    omr_sheet_instructions: "",
    post_test_instructions: "",
    omr_note: "",
    qr_code: null,
    qr_code_url: "",
    wrong_method_image: null,
    wrong_method_image_url: "",
    correct_method_image: null,
    correct_method_image_url: "",
};

export interface TestCategory {
    id?: number;
    name: string;
    slug: string;
    image: File | null;
    image_url: string | null;
    description?: string;
}

export const TestCategoryInitialState: TestCategory = {
    name: "",
    slug: "",
    image: null,
    image_url: "",
    description: ""
}
export interface TestCategoryListing {
    data: {
        data: TestCategory[];
        pagination: Pagination;
    }
}