import { Autocomplete, Box, FormHelperText, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useGetAllCourseQuery } from "../../../../services/courseApi";
import { useEditOrCreateTestMutation, useGetAllOmrQuery, useGetAllQuestionQuery, useGetAllQuestionSetsQuery, useGetTestByIdQuery } from "../../../../services/questionApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import { useCourseFilter } from "../../../../store/useCourseFilter";
import type { CourseProps, DiscountTypeProps } from "../../../../types/course";
import { TestInitialState, testValidationSchema, type QuestionLabelProps, type QuestionProps, type TestProps, type TestTypeProps } from "../../../../types/question";
import { calcHasMore } from "../../../../utils/calculateHasMore";
import { formatDateForDisplay } from "../../../../utils/dateFormat";
import MakuraDatePicker from "../../../atoms/MakuraDatePicker";
import QuestionIssueDot from "../../../atoms/QuestionIssueDot";
import TextEditor from "../../../atoms/TextEditor";
import { YesNoSwitch } from "../../../atoms/YesNoSwitch";
import FooterAction from "../../../molecules/FooterAction";
import InfiniteScrolling from "../../../molecules/InfiniteScrolling";
import TabController from "../../../molecules/TabController";
import CategoryFilter from "../../../organism/CategoryFilter";



export default function TestManagementForm() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const testId = Number.isFinite(Number(id)) ? Number(id) : undefined;
    const [courseQp, setCourseQp] = useState({
        pageIndex: 1,
        pageSize: 10,
        search: ""
    });

    const [questionQp, setQuestionQp] = useState({
        pageIndex: 1,
        pageSize: 20,
        search: ""
    });

    const [omrQp, _setOmrQp] = useState({
        pageIndex: 1,
        pageSize: 20,
        search: ""
    })

    const [setQp, setSetQp] = useState({
        pageIndex: 1,
        pageSize: 20,
        search: ""
    })

    const {
        megaCategories,
        categories,
        subCategories,
        handleCategoryChange,
        selections,
        getSelectedCategoryFilterParams,
    } = useCourseFilter();

    const { data: editData } = useGetTestByIdQuery(
        { id: testId as number },
        { skip: !testId }
    );


    function getInitialValues(): TestProps {
        if (id && editData?.data) {
            const test = editData.data;
            return {
                id: test.id,
                name: test.name || "",
                duration: test.duration || { hours: 0, minutes: 0 },
                full_mark: test.full_mark || 0,
                pass_mark: test.pass_mark || 0,
                start_datetime: test.start_datetime || "",
                end_datetime: test.end_datetime || "",
                course_ids: test.course_ids || [],
                question_ids: test.question_ids || [],
                set_ids: test.set_ids || [],
                is_scheduled: test.is_scheduled ?? false,
                test_type: test.test_type || "mcq",
                total_questions: test.total_questions || 0,
                marks_per_question: test.marks_per_question || 0,
                is_individual_test: test.is_individual_test,
                price: test.price,
                rules: test.rules,
                discount: test.discount,
                discount_type: test.discount_type,
                omr_format: test.omr_format,
                negative_marking_enabled: test.negative_marking_enabled ?? false,
                // API sends this back as a string ("25.00") or null
                negative_marking_percentage:
                    test.negative_marking_percentage != null
                        ? Number(test.negative_marking_percentage)
                        : null,
            };
        }
        return TestInitialState;
    }


    const formik = useFormik<TestProps>({
        initialValues: getInitialValues(),
        validationSchema: testValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const { set_question_count: _sqc, ...rest } = values;
                const submitValues: TestProps = {
                    ...rest,
                    // Backend stores null while disabled — never send a stale percentage
                    negative_marking_percentage: rest.negative_marking_enabled
                        ? Number(rest.negative_marking_percentage)
                        : null,
                };
                const response = await createTest({ body: submitValues }).unwrap();
                dispatch(
                    showToast({
                        message: response?.message || "Test Created Successfully.",
                        severity: "success"
                    })
                )
                navigate(PATH.TEST_QUESTION_MANAGEMENT.TEST.ROOT)
                formik.resetForm();
            } catch (e: any) {
                dispatch(
                    showToast({
                        message: e?.data?.message || "Unable to Create Test",
                        severity: "error"
                    })
                )
            }
        }
    });

    console.log(formik.errors)

    const categoryFilter = getSelectedCategoryFilterParams();
    const { data: courses, isLoading: loadingCourses } = useGetAllCourseQuery({ ...courseQp, categoryFilter: { ...categoryFilter } });
    const { data: questions, isLoading: loadingQuestions } = useGetAllQuestionQuery({
        ...questionQp,
        type: formik.values.test_type === "omr" ? "mcq" : formik.values.test_type,
        set_ids: formik.values.set_ids.length ? formik.values.set_ids : undefined,
    });
    const { data: questionSets, isLoading: loadingSets } = useGetAllQuestionSetsQuery({ ...setQp });
    const [createTest, { isLoading: creatingTest }] = useEditOrCreateTestMutation();
    const { data } = useGetAllOmrQuery({
        ...omrQp,
    });
    const [courseList, setCourseList] = useState<CourseProps[]>([]);
    const [questionList, setQuestionList] = useState<QuestionProps[]>([]);
    const [setList, setSetList] = useState<QuestionLabelProps[]>([]);
    const [activeTab, setActiveTab] = useState<TestTypeProps>("mcq");
    useEffect(() => {
        if (!courses?.data?.data) return;

        setCourseList(prev => {
            if (courseQp.pageIndex === 1) {
                return courses.data.data;
            }

            const existingIds = new Set(prev.map(course => course.id));
            const newCourses = courses.data.data.filter(
                course => !existingIds.has(course.id)
            );

            return [...prev, ...newCourses];
        });
    }, [courses, courseQp.pageIndex]);

    useEffect(() => {
        if (!questions?.data?.data) return;

        setQuestionList(prev => {
            if (questionQp.pageIndex === 1) {
                return questions.data.data;
            }

            const existingIds = new Set(prev.map(question => question.id));
            const newQuestions = questions.data.data.filter(
                question => !existingIds.has(question.id)
            );

            return [...prev, ...newQuestions];
        });
    }, [questions, questionQp.pageIndex]);

    useEffect(() => {
        if (!questionSets?.data?.data) return;

        setSetList(prev => {
            if (setQp.pageIndex === 1) {
                return questionSets.data.data;
            }

            const existingIds = new Set(prev.map(s => s.id));
            const newSets = questionSets.data.data.filter(s => !existingIds.has(s.id));

            return [...prev, ...newSets];
        });
    }, [questionSets, setQp.pageIndex]);

    const handleCourseSearch = (searchTerm: string) => {
        setCourseQp(prev => ({
            ...prev,
            search: searchTerm,
            pageIndex: 1
        }));
    };

    const handleQuestionSearch = (searchTerm: string) => {
        setQuestionQp(prev => ({
            ...prev,
            search: searchTerm,
            pageIndex: 1
        }));
    };

    const coursePagination = courses?.data?.pagination;
    const questionPagination = questions?.data?.pagination;

    const hasMoreCourses = calcHasMore(coursePagination);
    const hasMoreQuestions = calcHasMore(questionPagination);

    const fetchMoreCourses = () => {
        if (hasMoreCourses) {
            setCourseQp(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
        }
    };

    const fetchMoreQuestions = () => {
        if (hasMoreQuestions) {
            setQuestionQp(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
        }
    };

    const setPagination = questionSets?.data?.pagination;
    const hasMoreSets = calcHasMore(setPagination);

    const handleSetSearch = (searchTerm: string) => {
        setSetQp(prev => ({ ...prev, search: searchTerm, pageIndex: 1 }));
    };

    const fetchMoreSets = () => {
        if (hasMoreSets) {
            setSetQp(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
        }
    };

    const handleSetSelectionChange = (selectedIds: number[]) => {
        formik.setFieldValue("set_ids", selectedIds);
        formik.setFieldTouched("set_ids", true);
        const count = setList
            .filter(s => selectedIds.includes(s.id))
            .reduce((sum, s) => sum + (s.number_of_questions || 0), 0);
        formik.setFieldValue("set_question_count", count);
        // Reset individual question selection since the available pool changes
        formik.setFieldValue("question_ids", []);
        setQuestionList([]);
        setQuestionQp(prev => ({ ...prev, pageIndex: 1 }));
    };

    const setListForDisplay = setList.map(s => ({
        ...s,
        display_name: `${s.name} (${s.number_of_questions})`,
    }));

    const handleTabChange = (value: "mcq" | "subjective" | "omr") => {
        setActiveTab(value);
        formik.setFieldValue("test_type", value);

        if (value === "subjective") {
            formik.setFieldValue("marks_per_question", 0);
            // Subjective tests aren't auto-graded, so negative marking doesn't apply
            formik.setFieldValue("negative_marking_enabled", false);
            formik.setFieldValue("negative_marking_percentage", null);
        }

        if (value === "mcq") {
            formik.setFieldValue("full_mark", 0);
        }
    };

    return (
        <form onSubmit={formik.handleSubmit} className="flex flex-col h-full justify-between overflow-auto">
            <Box className="flex flex-col gap-6 md:grid md:grid-cols-2 overflow-auto" sx={{
            }}>
                <div className="col-span-2">
                    <TabController
                        currentActive={activeTab}
                        setActiveTab={handleTabChange}
                        options={[
                            { label: "MCQ", value: "mcq" },
                            { label: "Subjective", value: "subjective" },
                            { label: "OMR", value: "omr" }
                        ]}
                    />
                </div>

                <div className="col-span-1">
                    <div className="input__field">
                        <InputLabel className="required">Name</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter Test Name"
                            error={formik.touched.name && Boolean(formik.errors.name)}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <FormHelperText error>{formik.errors.name}</FormHelperText>
                        )}
                    </div>
                </div>

                {formik.values.test_type === "omr" ? (
                    <div className="col-span-1">
                        <InputLabel className="required">OMR Format</InputLabel>

                        <Autocomplete
                            disableClearable
                            options={data?.data?.data || []}
                            getOptionLabel={(option) => option.name}
                            onChange={(_, value) => {
                                formik.setFieldValue("omr_format", value?.omr_format || null);
                                formik.setFieldValue("total_questions", value?.omr_format);
                            }}
                            sx={{
                                "& .MuiAutocomplete-option": {
                                    display: "flex",
                                    alignItems: "flex-start !important",
                                    justifyContent: "flex-start !important",
                                    textAlign: "left",
                                },
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select the OMR format you want for this test"
                                />
                            )}

                            renderOption={(props, option) => (
                                <Box
                                    component="li"
                                    {...props}
                                    sx={{
                                        width: "100%",
                                        p: 2,

                                    }}
                                >
                                    <div className="">
                                        <Typography variant="h5" fontWeight={500} >
                                            {option.name}
                                        </Typography>

                                        <Typography
                                            variant="subtitle2"
                                            color="text.middle"
                                        >
                                            Uploaded {formatDateForDisplay(option.created_at)}
                                        </Typography>
                                    </div>
                                </Box>
                            )}
                        />

                        {formik.touched.total_questions && formik.errors.total_questions && (
                            <FormHelperText error>{formik.errors.total_questions}</FormHelperText>
                        )}
                    </div>
                ) : ""}
                <div className="col-span-1">
                    <div className="input__field">
                        <InputLabel className="required">Total No. of Questions</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="total_questions"
                            type="number"
                            value={formik.values.total_questions}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter Total Questions"
                            error={formik.touched.total_questions && Boolean(formik.errors.total_questions)}
                            inputProps={{ min: 1 }}
                        />
                        {formik.touched.total_questions && formik.errors.total_questions && (
                            <FormHelperText error>{formik.errors.total_questions}</FormHelperText>
                        )}
                    </div>
                </div>

                {formik.values.test_type === "subjective" ? (
                    <div className="col-span-1">
                        <div className="input__field">
                            <InputLabel className="required">Full Marks</InputLabel>
                            <OutlinedInput
                                fullWidth
                                name="full_mark"
                                value={formik.values.full_mark}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter Full Marks"
                                type="number"
                                error={formik.touched.full_mark && Boolean(formik.errors.full_mark)}
                                inputProps={{ min: 1 }}
                            />
                            {formik.touched.full_mark && formik.errors.full_mark && (
                                <FormHelperText error>{formik.errors.full_mark}</FormHelperText>
                            )}
                        </div>
                    </div>
                ) : ""}
                {formik.values.test_type === "mcq" || formik.values.test_type === "omr" ? (
                    <div className="col-span-1">
                        <div className="input__field">
                            <InputLabel className="required">Marks Per Question</InputLabel>
                            <OutlinedInput
                                fullWidth
                                name="marks_per_question"
                                value={formik.values.marks_per_question}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter Marks Per Question"
                                type="number"
                                error={formik.touched.marks_per_question && Boolean(formik.errors.marks_per_question)}
                                inputProps={{ min: 1 }}
                            />
                            {formik.touched.marks_per_question && formik.errors.marks_per_question && (
                                <FormHelperText error>{formik.errors.marks_per_question}</FormHelperText>
                            )}
                        </div>
                    </div>
                ) : ""}

                {formik.values.test_type === "mcq" || formik.values.test_type === "omr" ? (
                    <>
                        <div className="col-span-2 flex items-center gap-2">
                            <Typography variant="subtitle1" color="text.middle">Enable negative marking?</Typography>
                            <YesNoSwitch
                                checked={Boolean(formik.values.negative_marking_enabled)}
                                onChange={(event) => {
                                    formik.setFieldValue("negative_marking_enabled", event.target.checked);
                                    if (!event.target.checked) {
                                        formik.setFieldValue("negative_marking_percentage", null);
                                        formik.setFieldTouched("negative_marking_percentage", false);
                                    }
                                }}
                            />
                        </div>

                        {formik.values.negative_marking_enabled && (
                            <div className="col-span-1">
                                <div className="input__field">
                                    <InputLabel className="required">Negative Marking (%)</InputLabel>
                                    <OutlinedInput
                                        fullWidth
                                        name="negative_marking_percentage"
                                        value={formik.values.negative_marking_percentage ?? ""}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter Percentage (0 - 100)"
                                        type="number"
                                        error={formik.touched.negative_marking_percentage && Boolean(formik.errors.negative_marking_percentage)}
                                        inputProps={{ min: 0, max: 100, step: "any" }}
                                    />
                                    {formik.touched.negative_marking_percentage && formik.errors.negative_marking_percentage ? (
                                        <FormHelperText error>{formik.errors.negative_marking_percentage}</FormHelperText>
                                    ) : (
                                        <FormHelperText>
                                            Deducts this percent of the question&apos;s marks for each wrong answer
                                            {Number(formik.values.marks_per_question) > 0 && Number(formik.values.negative_marking_percentage) > 0
                                                ? ` (−${((Number(formik.values.marks_per_question) * Number(formik.values.negative_marking_percentage)) / 100).toFixed(2)} marks per wrong answer).`
                                                : "."}
                                        </FormHelperText>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : ""}
                <div className="col-span-1">
                    <div className="input__field">
                        <InputLabel className="required">Pass Marks</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="pass_mark"
                            value={formik.values.pass_mark}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter Pass Marks"
                            type="number"
                            error={formik.touched.pass_mark && Boolean(formik.errors.pass_mark)}
                            inputProps={{ min: 0 }}
                        />
                        {formik.touched.pass_mark && formik.errors.pass_mark && (
                            <FormHelperText error>{formik.errors.pass_mark}</FormHelperText>
                        )}
                    </div>
                </div>

                <div className="col-span-1">
                    <div className="input__field">
                        <InputLabel className="required">Duration</InputLabel>
                        <div className="flex items-center gap-5">
                            <div className="hours__wrapper flex items-center gap-2 flex-1">
                                <OutlinedInput
                                    fullWidth
                                    placeholder="0"
                                    type="number"
                                    name="duration.hours"
                                    value={formik.values?.duration?.hours}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.duration?.hours &&
                                        Boolean(formik.errors.duration?.hours)
                                    }
                                    inputProps={{ min: 0, max: 999 }}
                                />
                                <Typography variant="body2" color="text.secondary">Hrs</Typography>
                            </div>
                            <Box color="text.secondary">:</Box>
                            <div className="minutes__wrapper flex items-center gap-2 flex-1">
                                <OutlinedInput
                                    fullWidth
                                    placeholder="0"
                                    type="number"
                                    name="duration.minutes"
                                    value={formik.values?.duration?.minutes}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.duration?.minutes &&
                                        Boolean(formik.errors.duration?.minutes)
                                    }
                                    inputProps={{ min: 0, max: 59 }}
                                />
                                <Typography variant="body2" color="text.secondary">Mins</Typography>
                            </div>
                        </div>
                        {formik.touched.duration && formik.errors.duration && (
                            <FormHelperText error sx={{ mt: 1 }}>
                                {typeof formik.errors.duration === 'string'
                                    ? formik.errors.duration
                                    : formik.errors.duration?.hours || formik.errors.duration?.minutes}
                            </FormHelperText>
                        )}
                    </div>
                </div>

                <div className="col-span-2 flex items-center gap-2">
                    <Typography variant="subtitle1" color="text.middle">Do you want this test to be an individual test?</Typography>
                    <YesNoSwitch
                        checked={formik.values.is_individual_test}
                        onChange={(event) => {
                            formik.setFieldValue("is_individual_test", event.target.checked);
                        }}
                    />
                </div>

                {
                    formik.values.is_individual_test ? <>
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel className="required">Price</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    name="price"
                                    value={formik.values.price}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter Test price"
                                    error={formik.touched.price && Boolean(formik.errors.price)}
                                />
                                {formik.touched.price && formik.errors.price && (
                                    <FormHelperText error>{formik.errors.price}</FormHelperText>
                                )}
                            </div>
                        </div>

                        <div className="col-span-1">
                            <div className="input__field">
                                <TextEditor
                                    label="Description / Rule and Regulations"
                                    required
                                    onChange={(newValue) => formik.setFieldValue("rules", newValue)}
                                    onBlur={(newValue) => formik.setFieldValue("rules", newValue)}
                                    value={formik.values.rules}
                                />
                                {formik.touched.rules && formik.errors.rules && (
                                    <FormHelperText error>{formik.errors.rules}</FormHelperText>
                                )}
                            </div>
                        </div>

                        {/* Discount */}
                        <div className="col-span-1">
                            <div className="input_field">
                                <InputLabel >Discount</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    placeholder='Enter Discount'
                                    name='discount'
                                    type="number"
                                    value={formik.values.discount}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched?.discount && formik.errors?.discount && (
                                    <FormHelperText error sx={{ mt: 0.5 }}>
                                        {formik.errors.discount}
                                    </FormHelperText>
                                )}
                            </div>
                        </div>

                        {/* Discount Type */}
                        <div className="col-span-1">
                            <div className="input_field">
                                <InputLabel >Discount Type</InputLabel>
                                <Autocomplete
                                    options={[
                                        { label: "Percentage", value: "percentage" },
                                        { label: "Amount", value: "amount" },
                                    ]}
                                    value={formik.values.discount_type === 'percentage' ? { label: "Percentage", value: "percentage" } : { label: "Amount", value: "amount" }}
                                    getOptionLabel={(option) => option.label}
                                    onChange={(_e, value) => {
                                        formik.setFieldValue('discount_type', value?.value as DiscountTypeProps || 'percentage');
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select discount type"
                                        />
                                    )}
                                />
                                {formik.touched?.discount_type && formik.errors?.discount_type && (
                                    <FormHelperText error sx={{ mt: 0.5 }}>
                                        {formik.errors.discount_type}
                                    </FormHelperText>
                                )}
                            </div>
                        </div>
                    </> : ""
                }
                <div className="col-span-2 flex items-center gap-2">
                    <Typography variant="subtitle1" color="text.middle">Do you want to schedule this test?</Typography>
                    <YesNoSwitch
                        checked={formik.values.is_scheduled}
                        onChange={(event) => {
                            formik.setFieldValue("is_scheduled", event.target.checked);
                            if (!event.target.checked) {
                                formik.setFieldValue("start_datetime", "");
                                formik.setFieldValue("end_datetime", "");
                            }
                        }}
                    />
                </div>

                {formik.values.is_scheduled && (
                    <>
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel className="required">Start Date & Time</InputLabel>
                                <MakuraDatePicker
                                    value={formik.values.start_datetime ? dayjs(formik.values.start_datetime) : null}
                                    onChange={(date: Dayjs | null) =>
                                        formik.setFieldValue("start_datetime", date ? date.toISOString() : "")
                                    }
                                    includeTime={true}
                                    placeholder="Select start date & time"
                                    error={formik.touched.start_datetime && Boolean(formik.errors.start_datetime)}
                                />
                                {formik.touched.start_datetime && formik.errors.start_datetime && (
                                    <FormHelperText error>{formik.errors.start_datetime}</FormHelperText>
                                )}
                            </div>
                        </div>

                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel className="required">End Date & Time</InputLabel>
                                <MakuraDatePicker
                                    value={formik.values.end_datetime ? dayjs(formik.values.end_datetime) : null}
                                    onChange={(date: Dayjs | null) =>
                                        formik.setFieldValue("end_datetime", date ? date.toISOString() : "")
                                    }
                                    includeTime={true}
                                    minDate={formik.values.start_datetime ? dayjs(formik.values.start_datetime) : dayjs()}
                                    placeholder="Select end date & time"
                                    error={formik.touched.end_datetime && Boolean(formik.errors.end_datetime)}
                                />
                                {formik.touched.end_datetime && formik.errors.end_datetime && (
                                    <FormHelperText error>{formik.errors.end_datetime}</FormHelperText>
                                )}
                            </div>
                        </div>


                    </>
                )}

                <div className="col-span-2">
                    <div className="lg:grid grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <CategoryFilter
                                megaCategories={megaCategories}
                                categories={categories}
                                subCategories={subCategories}
                                onChange={handleCategoryChange}
                                selections={selections}
                            />
                        </div>
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel >Select Courses {formik.values.course_ids.length ? (formik.values.course_ids.length) : ""} <Typography variant="caption" color="text.middle">(Select the course you want to add test)</Typography></InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    placeholder="Search Course"
                                    value={courseQp.search}
                                    onChange={(e) => handleCourseSearch(e.target.value)}
                                    endAdornment={
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.58317 17.5001C13.9554 17.5001 17.4998 13.9557 17.4998 9.58341C17.4998 5.21116 13.9554 1.66675 9.58317 1.66675C5.21092 1.66675 1.6665 5.21116 1.6665 9.58341C1.6665 13.9557 5.21092 17.5001 9.58317 17.5001Z" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M18.3332 18.3334L16.6665 16.6667" stroke="#9CA3B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                    }
                                />
                                <InfiniteScrolling
                                    key="course-list"
                                    scrollableId="course-scrollable"
                                    data={courseList || []}
                                    hasMore={hasMoreCourses}
                                    selectedItems={formik.values.course_ids}
                                    onSelectionChange={(selectedIds) => {
                                        formik.setFieldValue("course_ids", selectedIds);
                                        formik.setFieldTouched("course_ids", true);
                                    }}
                                    fetchMore={fetchMoreCourses}
                                    onSearch={handleCourseSearch}
                                    loading={loadingCourses}
                                    itemLabelKey="name"
                                    itemIdKey="id"
                                    placeholder="Search courses..."
                                />
                                {formik.touched.course_ids && formik.errors.course_ids && (
                                    <FormHelperText error>{formik.errors.course_ids}</FormHelperText>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="input__field">
                        <InputLabel className="required">Select Questions ({formik.values.question_ids.length})</InputLabel>
                        {/* <OutlinedInput
                            placeholder="Search Questions"
                            value={questionQp.search}
                            onChange={(e) => handleQuestionSearch(e.target.value)}
                        /> */}
                        <InfiniteScrolling
                            key="question-list"
                            scrollableId="question-scrollable"
                            data={questionList || []}
                            hasMore={hasMoreQuestions}
                            selectedItems={formik.values.question_ids}
                            onSelectionChange={(selectedIds) => {
                                formik.setFieldValue("question_ids", selectedIds);
                                formik.setFieldTouched("question_ids", true);
                            }}
                            fetchMore={fetchMoreQuestions}
                            onSearch={handleQuestionSearch}
                            loading={loadingQuestions}
                            maxSelection={Math.max(0, (formik.values.total_questions || 0) - (formik.values.set_question_count || 0)) || undefined}
                            itemLabelKey="question"
                            itemIdKey="id"
                            placeholder="Search questions..."
                            groupLabelKey="label.name"
                            renderItemPrefix={(question) => <QuestionIssueDot question={question} reserveSpace={false} />}
                        />
                        {formik.touched.question_ids && formik.errors.question_ids && (
                            <FormHelperText error>{formik.errors.question_ids}</FormHelperText>
                        )}
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="input__field">
                        <InputLabel>
                            Select Set ({formik.values.set_ids.length})
                            {formik.values.set_question_count ? (
                                <Typography variant="caption" color="text.middle" sx={{ ml: 1 }}>
                                    — {formik.values.set_question_count} questions from sets
                                </Typography>
                            ) : null}
                        </InputLabel>
                        <OutlinedInput
                            placeholder="Search Sets"
                            value={setQp.search}
                            onChange={(e) => handleSetSearch(e.target.value)}
                        />
                        <InfiniteScrolling
                            key="set-list"
                            scrollableId="set-scrollable"
                            data={setListForDisplay}
                            hasMore={hasMoreSets}
                            selectedItems={formik.values.set_ids}
                            onSelectionChange={handleSetSelectionChange}
                            fetchMore={fetchMoreSets}
                            onSearch={handleSetSearch}
                            loading={loadingSets}
                            itemLabelKey="display_name"
                            itemIdKey="id"
                            placeholder="Search sets..."
                        />
                    </div>
                </div>
            </Box>

            <FooterAction
                handleConfirmationChange={() => navigate(-1)}
                isLoading={creatingTest}
                isUpdating={creatingTest}
                isEditMode={!id}
                replaceLabel={id ? creatingTest
                    ? "Updating Test..."
                    : "Update Test"
                    : creatingTest
                        ? "Creating Test..."
                        : "Create Test"}

            />
        </form>
    );
}