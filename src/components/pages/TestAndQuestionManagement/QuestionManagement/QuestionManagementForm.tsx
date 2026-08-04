import { Add } from "@mui/icons-material";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect } from "react";
import * as Yup from "yup";
import { useGetAllMegaCategoryQuery } from "../../../../services/categoryApi";
import { useEditOrCreateQuestionMutation } from "../../../../services/questionApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import { QuestionInitialState, type QuestionProps } from "../../../../types/question";
import TextEditor from "../../../atoms/TextEditor";
import { YesNoSwitch } from "../../../atoms/YesNoSwitch";
import FooterAction from "../../../molecules/FooterAction";

export interface Props {
    open: boolean;
    setOpen: (newValue: boolean) => void;
    editData?: QuestionProps | null;
    onSave?: (values: QuestionProps) => void;
}

const questionTypes = [
    { label: "MCQ", value: "mcq" },
    { label: "Subjective", value: "subjective" }
];

const buildQuestionValidationSchema = (isLocalMode: boolean) => Yup.object().shape({
    question_type: Yup.string()
        .oneOf(["mcq", "subjective"], "Invalid question type")
        .required("Question type is required"),
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
    options: Yup.array().when("question_type", {
        is: "mcq",
        then: (schema) =>
            schema
                .of(
                    Yup.object().shape({
                        id: Yup.number().nullable(),
                        option: Yup.string()
                            .trim()
                            .required("Option text is required"),
                        is_correct: Yup.boolean().required()
                    })
                )
                .min(2, "MCQ must have at least 2 options")
                .max(4, "MCQ can have maximum 4 options")
                .test(
                    "has-correct-answer",
                    "At least one option must be marked as correct",
                    (options) => options?.some((opt) => opt.is_correct) ?? false
                ),
        otherwise: (schema) => schema.notRequired()
    })
});
export default function QuestionManagementForm({ setOpen, editData, onSave }: Props) {
    const dispatch = useAppDispatch();
    const { data } = useGetAllMegaCategoryQuery();
    const megaCategories = data?.data || [];

    const [createOrUpdateQuestion, { isLoading }] = useEditOrCreateQuestionMutation();

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
            formik.setValues({
                ...editData,
                options: editData.options?.map((opt) => ({ ...opt })) ?? []
            });
        } else {
            formik.resetForm();
        }
    }, [editData]);

    const addOption = () => {
        if (formik.values.options.length < 4) {
            formik.setFieldValue("options", [
                ...formik.values.options,
                { id: null, option: "", is_correct: false }
            ]);
        }
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

    const handleCorrectAnswerChange = (index: number) => {
        const newOptions = formik.values.options.map((opt, i) => ({
            ...opt,
            is_correct: i === index
        }));
        formik.setFieldValue("options", newOptions);
    };

    const isMCQ = formik.values.question_type === "mcq";

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
                                    formik.setFieldValue("question_type", newValue.value);
                                    if (newValue.value === "subjective") {
                                        formik.setFieldValue("options", []);
                                    } else if (
                                        newValue.value === "mcq" &&
                                        formik.values.options.length === 0
                                    ) {
                                        formik.setFieldValue("options", [
                                            { id: null, option: "", is_correct: false }
                                        ]);
                                    }
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

                    {formik.values.question_type === "subjective" ?
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel>
                                    Question Weight{" "}
                                    <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                        className="inline-block"
                                    >
                                        Marks this question holds.
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

                {isMCQ && (
                    <>
                        <div className="mt-6">
                            <Typography variant="subtitle1" color="text.primary">
                                Answer Options
                            </Typography>
                        </div>

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

                                    <div className="flex items-center gap-4">
                                        <FormControlLabel
                                            label="Mark Correct Answer"
                                            control={
                                                <Checkbox
                                                    color="success"
                                                    checked={option.is_correct}
                                                    onChange={() => handleCorrectAnswerChange(index)}
                                                />
                                            }
                                            className="items-center!"
                                        />
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

                        {formik.touched.options && typeof formik.errors.options === "string" && (
                            <Typography variant="caption" color="error" className="mt-2 block">
                                {formik.errors.options}
                            </Typography>
                        )}

                        {formik.values.options.length < 4 && (
                            <Button
                                variant="text"
                                color="primary"
                                className="font-medium! mt-4"
                                startIcon={<Add />}
                                onClick={addOption}
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