import dayjs from "dayjs";
import * as Yup from "yup";
import type { DiscountTypeProps, SelectionType } from "./course";
import type { Pagination } from "./roleAndPermission";
import type { GlobalResponse, User } from "./user";
export type QuestionTypeProps = "mcq" | "subjective" | "omr"
export interface OptionProps {
    id: number | null,
    option: string,
    is_correct: boolean
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
    your_answer_id?: number;
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