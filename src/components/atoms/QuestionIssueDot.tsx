import { Box, Tooltip, Typography } from "@mui/material";
import { getQuestionIssues } from "../../utils/questionIntegrity";
import type { OptionProps, QuestionProps } from "../../types/question";

interface Props {
    question: {
        question_type?: QuestionProps["question_type"];
        options?: OptionProps[] | null;
    } | null | undefined;
    /**
     * Keeps the dot's width reserved even when a question is fine, so the text beside it stays on
     * one line down the column. Turn off where the indicator sits on its own.
     */
    reserveSpace?: boolean;
}

const DOT_SIZE = 8;

/**
 * Marks an MCQ that an admin still needs to go back and fix — no correct answer, or an
 * incomplete option set. Renders nothing for a healthy question.
 */
export default function QuestionIssueDot({ question, reserveSpace = true }: Props) {
    const issues = getQuestionIssues(question);

    if (!issues.length) {
        return reserveSpace ? <Box component="span" sx={{ width: DOT_SIZE, flexShrink: 0 }} /> : null;
    }

    return (
        <Tooltip
            arrow
            title={
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {issues.map((issue) => (
                        <li key={issue}>
                            <Typography variant="caption">{issue}</Typography>
                        </li>
                    ))}
                </Box>
            }
        >
            <Box
                component="span"
                role="img"
                aria-label={`Needs fixing: ${issues.join(", ")}`}
                sx={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "inline-block",
                    bgcolor: (theme) => theme.palette.error.main,
                }}
            />
        </Tooltip>
    );
}
