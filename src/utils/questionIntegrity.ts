import type { OptionProps, QuestionProps } from "../types/question";

/** A complete MCQ carries this many answer options. */
export const MCQ_EXPECTED_OPTIONS = 4;

/** The subset of a question the integrity check actually reads. */
type CheckableQuestion = {
    question_type?: QuestionProps["question_type"];
    options?: OptionProps[] | null;
};

/**
 * Lists everything wrong with an MCQ, in the order an admin would need to fix it.
 *
 * Bulk imports from the early days skipped the checks the create/edit form enforces, so the bank
 * still holds questions with no correct answer marked, a short option set, or no options at all.
 * Returns an empty array for a healthy question and for any non-MCQ type.
 */
export function getQuestionIssues(question: CheckableQuestion | null | undefined): string[] {
    if (!question || question.question_type !== "mcq") return [];

    // A missing `options` key means the payload didn't carry them, which is not the same as a
    // question having none — staying quiet beats flagging every row in the bank.
    const options = question.options;
    if (options == null) return [];
    if (!options.length) return ["No options added"];

    const issues: string[] = [];

    if (options.length < MCQ_EXPECTED_OPTIONS) {
        issues.push(`Only ${options.length} of ${MCQ_EXPECTED_OPTIONS} options`);
    }
    if (!options.some((option) => option.is_correct)) {
        issues.push("No correct answer marked");
    }

    return issues;
}

/** Convenience wrapper for callers that only need to know whether to draw the indicator. */
export function hasQuestionIssues(question: CheckableQuestion | null | undefined): boolean {
    return getQuestionIssues(question).length > 0;
}
