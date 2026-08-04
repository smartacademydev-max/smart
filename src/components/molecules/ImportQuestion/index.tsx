import { Box, Dialog, DialogContent, FormControlLabel, FormHelperText, IconButton, InputLabel, LinearProgress, OutlinedInput, Radio, Tooltip, Typography, useTheme } from "@mui/material";
import { useFormik } from "formik";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import * as Yup from "yup";
import { useSaveUploadedQuestionsMutation, useUploadQuestionPaperMutation } from "../../../services/questionApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import type { QuestionProps } from "../../../types/question";
import { renderHtml } from "../../../utils/renderHtml";
import QuestionIssueDot from "../../atoms/QuestionIssueDot";
import QuestionManagementForm from "../../pages/TestAndQuestionManagement/QuestionManagement/QuestionManagementForm";
import FooterAction from "../FooterAction";

interface MediaFileDragDropProps {
    maxSize?: number;
    onClose: () => void;
}

interface QuestionRowProps {
    question: QuestionProps;
    questionIndex: number;
    totalCount: number;
    onCorrectChange: (qi: number, oi: number) => void;
    onEdit: (qi: number) => void;
    onDelete: (qi: number) => void;
}

const QuestionRow = React.memo(function QuestionRow({
    question,
    questionIndex,
    totalCount,
    onCorrectChange,
    onEdit,
    onDelete,
}: QuestionRowProps) {
    const theme = useTheme();

    return (
        <Box
            className="question__box w-full pb-4 mb-4 lg:pb-8 lg:mb-8 border-b last:border-b-0 last:mb-0 last:pb-0"
            sx={{ borderColor: theme.palette.separator.dark }}
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Typography variant="body2">Question {questionIndex + 1} of {totalCount}</Typography>
                    <QuestionIssueDot question={question} reserveSpace={false} />
                </div>
                <div className="flex items-center gap-1">
                    <Tooltip title="Edit Question">
                        <IconButton size="small" color="primary" onClick={() => onEdit(questionIndex)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.26 3.6L5.05 12.29C4.74 12.62 4.44 13.27 4.38 13.72L4.01 16.96C3.88 18.13 4.72 18.93 5.88 18.73L9.1 18.18C9.55 18.1 10.18 17.77 10.49 17.43L18.7 8.74C20.12 7.24 20.76 5.53 18.55 3.44C16.35 1.37 14.68 2.1 13.26 3.6Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.89 5.05005C12.32 7.81005 14.56 9.92005 17.34 10.2" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 22H21" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Question">
                        <IconButton size="small" color="error" onClick={() => onDelete(questionIndex)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 5.98C17.67 5.65 14.32 5.48 10.98 5.48C9 5.48 7.02 5.58 5.04 5.78L3 5.98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18.85 9.14L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <Typography variant="subtitle1" className="mb-2!">{renderHtml(question.question)}</Typography>
            <div className="flex flex-col gap-4 md:grid md:grid-cols-2 w-full">
                {question.options.map((option: any, optionIndex: number) => {
                    const isCorrect = option.is_correct;
                    const bgColor = isCorrect ? theme.palette.success.light : "transparent";
                    const borderColor = isCorrect ? theme.palette.success.main : theme.palette.separator.dark;

                    return (
                        <Box
                            key={option.option + option.id}
                            className="rounded-lg p-3 col-span-1 flex items-center gap-1"
                            sx={{ border: `1px solid ${borderColor}`, backgroundColor: bgColor }}
                        >
                            <FormControlLabel
                                className="items-center!"
                                label={<Typography variant="body2">{renderHtml(option.option)}</Typography>}
                                control={
                                    <Radio
                                        color="success"
                                        checked={option.is_correct}
                                        onChange={() => onCorrectChange(questionIndex, optionIndex)}
                                    />
                                }
                            />
                        </Box>
                    );
                })}
            </div>
        </Box>
    );
});

export default function ImportQuestion({
    maxSize = 2,
    onClose
}: MediaFileDragDropProps) {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [uploadMedia, { isLoading }] = useUploadQuestionPaperMutation();
    const [questions, setQuestions] = useState<QuestionProps[]>([]);
    const [_isDragging, setIsDragging] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const getAcceptTypes = (): Accept => ({
        "application/pdf": [".pdf"]
    });

    const handleFileUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append(`question`, file);

            const response = await uploadMedia({ body: formData }).unwrap();

            if (response.data?.length) {
                setQuestions((prev) => [...prev, ...response.data])
            }

            dispatch(
                showToast({ message: "File uploaded successfully", severity: "success" })
            );

        } catch (e: any) {
            dispatch(
                showToast({ message: e?.data?.message || "Upload Failed", severity: "error" })
            );
        }
    };

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        setIsDragging(false);

        if (rejectedFiles?.length) {
            const rejection = rejectedFiles[0];
            const errorCode = rejection.errors[0]?.code;
            if (errorCode === "file-too-large") {
                dispatch(showToast({ message: `File size must be less than ${maxSize}MB`, severity: "error" }));
            } else if (errorCode === "file-invalid-type") {
                dispatch(showToast({ message: `Invalid file type for PDF`, severity: "error" }));
            }
            return;
        }

        if (acceptedFiles?.length) handleFileUpload(acceptedFiles[0]);
    }, [maxSize, dispatch]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDragEnter: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
        accept: getAcceptTypes(),
        multiple: false,
        maxSize: maxSize * 1024 * 1024,
        disabled: isLoading
    });

    const [saveQuestions, { isLoading: saving }] = useSaveUploadedQuestionsMutation();

    const initialFormValues = useMemo(() => ({
        title: "",
        questions: questions.map(q => ({ ...q, options: q.options.map(opt => ({ ...opt })) })),
    }), [questions]);

    const formik = useFormik<{ title: string; questions: QuestionProps[] }>({
        enableReinitialize: true,
        initialValues: initialFormValues,
        validationSchema: Yup.object().shape({
            title: Yup.string()
                .trim()
                .required("Group title is required")
                .min(3, "Title must be at least 3 characters")
                .max(200, "Title must not exceed 200 characters"),
        }),
        onSubmit: async (values) => {
            try {
                const payload = values.questions.map(q => ({
                    id: q.id,
                    question: q.question,
                    question_type: q.question_type,
                    options: q.options.map(opt => ({
                        id: opt.id,
                        option: opt.option,
                        is_correct: opt.is_correct,
                    })),
                }));
                const response = await saveQuestions({ title: values.title, question: payload }).unwrap();

                dispatch(showToast({
                    message: response?.message || "Questions saved successfully",
                    severity: "success"
                }));

                onClose();
            }
            catch (e: any) {
                dispatch(
                    showToast({
                        message: e?.data?.message || "Error Saving Questions",
                        severity: "error"
                    })
                );
            }
        },
    });

    const formikRef = useRef(formik);
    formikRef.current = formik;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await formikRef.current.submitForm();
        const errors = formikRef.current.errors;
        const firstErrorKey = Object.keys(errors)[0];
        if (!firstErrorKey) return;
        const container = scrollContainerRef.current;
        if (!container) return;
        const target = container.querySelector(`[data-error-anchor="${firstErrorKey}"]`) as HTMLElement | null;
        if (!target) return;
        container.scrollTo({ top: Math.max(0, target.offsetTop - 16), behavior: "smooth" });
    };

    const handleCorrectAnswerChange = useCallback((questionIndex: number, optionIndex: number) => {
        const f = formikRef.current;
        const updatedOptions = f.values.questions[questionIndex].options.map((opt, idx) => ({
            ...opt,
            is_correct: idx === optionIndex
        }));
        f.setFieldValue(`questions.${questionIndex}.options`, updatedOptions);
    }, []);

    const handleDeleteQuestion = useCallback((index: number) => {
        const f = formikRef.current;
        const next = f.values.questions.filter((_, i) => i !== index);
        f.setFieldValue("questions", next);
        setQuestions(next);
    }, []);

    const handleEditQuestion = useCallback((index: number) => {
        setEditingIndex(index);
        setEditDialogOpen(true);
    }, []);

    const handleEditSave = (updated: QuestionProps) => {
        if (editingIndex === null) return;
        const next = formik.values.questions.map((q, i) =>
            i === editingIndex ? { ...updated } : q
        );
        formik.setFieldValue("questions", next);
        setQuestions(next);
        setEditingIndex(null);
        setEditDialogOpen(false);
    };

    const handleEditClose = () => {
        setEditingIndex(null);
        setEditDialogOpen(false);
    };

    if (!questions.length) {
        return (
            <Box
                {...getRootProps()}
                className="py-6 flex justify-center items-center flex-col cursor-pointer transition-all"
                sx={{ opacity: isLoading ? 0.8 : 1, pointerEvents: isLoading ? 'none' : 'auto', '&:hover': { opacity: isLoading ? 0.8 : 0.95 } }}
            >
                <input {...getInputProps()} />
                <Box
                    sx={{ width: "64px", height: "64px", borderRadius: "50%", background: isDragActive ? theme.palette.warning.main : theme.palette.warning.main, transition: 'all 0.3s ease', transform: isDragActive ? 'scale(1.1)' : 'scale(1)' }}
                    className="flex justify-center items-center mb-3"
                >

                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6309 5.76656L16.4038 7.03825M10.6078 9.56336L12.9942 10.1992M10.7265 16.7164L11.6811 16.9708C14.381 17.6901 15.731 18.0498 16.7945 17.4393C17.858 16.8287 18.2198 15.4863 18.9432 12.8016L19.9663 9.00479C20.6898 6.32005 21.0515 4.97768 20.4375 3.92016C19.8235 2.86264 18.4735 2.50295 15.7735 1.78358L14.8189 1.52924C12.119 0.809865 10.769 0.450178 9.70548 1.06074C8.64196 1.6713 8.28023 3.01367 7.55678 5.69841L6.53366 9.49521C5.8102 12.1799 5.44848 13.5223 6.0625 14.5798C6.67652 15.6374 8.02651 15.9971 10.7265 16.7164Z" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M10.75 19.6963L9.79766 19.9556C7.10403 20.6891 5.75722 21.0559 4.69619 20.4333C3.63517 19.8108 3.27429 18.4421 2.55253 15.7047L1.53182 11.8334C0.810063 9.09601 0.449185 7.72731 1.06177 6.64904C1.59167 5.71631 2.75 5.75027 4.25 5.75015" stroke="white" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                </Box>
                <Typography variant="subtitle1" className="mb-1">
                    {isDragActive ? "Drop the file here..." : `Click to upload PDF`}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    Max file size {maxSize}MB
                </Typography>
                {isLoading ?
                    <LinearProgress sx={{ width: "100%", height: 4 }} />
                    :

                    ""}
            </Box>

        );
    }


    return (
        <form onSubmit={handleFormSubmit} className="h-full flex flex-col overflow-hidden">
            <Box className="shrink-0 px-3 pt-3 pb-2">
                <div data-error-anchor="title" className="input__field w-full">
                    <InputLabel className="required">Group Title</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter a title to group these questions (e.g. Chapter 1 – Algebra)"
                        error={formik.touched.title && Boolean(formik.errors.title)}
                    />
                    {formik.touched.title && formik.errors.title && (
                        <FormHelperText error sx={{ mt: 0.5 }}>
                            {formik.errors.title}
                        </FormHelperText>
                    )}
                </div>
            </Box>

            <Box
                ref={scrollContainerRef}
                className="flex-1 min-h-0 flex flex-col justify-start items-start gap-3 px-3 overflow-auto"
            >
                {formik.values.questions.map((question, questionIndex) => (
                    <QuestionRow
                        key={`${question.id}-${questionIndex}`}
                        question={question}
                        questionIndex={questionIndex}
                        totalCount={formik.values.questions.length}
                        onCorrectChange={handleCorrectAnswerChange}
                        onEdit={handleEditQuestion}
                        onDelete={handleDeleteQuestion}
                    />
                ))}
            </Box>
            <FooterAction
                handleConfirmationChange={onClose}
                isLoading={saving}
                replaceLabel="Verify & Submit"
            />

            <Dialog
                open={editDialogOpen}
                onClose={handleEditClose}
                sx={{
                    "& .MuiPaper-root": {
                        minWidth: { md: "664px", xl: "1266px" },
                        height: "90vh",
                        overflow: "hidden"
                    },
                }}
            >
                <DialogContent
                    sx={{ background: theme.palette.primary.contrastText }}
                    className="h-full overflow-hidden"
                >
                    {editingIndex !== null && (
                        <QuestionManagementForm
                            open={editDialogOpen}
                            setOpen={(val) => { if (!val) handleEditClose(); }}
                            editData={formik.values.questions[editingIndex]}
                            onSave={handleEditSave}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </form>
    );
}
