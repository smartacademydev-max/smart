// import {
//     Autocomplete,
//     Box,
//     Button,
//     Checkbox,
//     Chip,
//     Dialog,
//     DialogContent,
//     Divider,
//     IconButton,
//     InputLabel,
//     OutlinedInput,
//     TextField,
//     Typography,
//     useTheme
// } from "@mui/material";
// import { useFormik } from "formik";
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import * as Yup from "yup";
// import {
//     useAssignTestAndTestCategoryToCourseMutation,
//     useGetSelectedTestBasedOnTestCategoryAndCourseIdQuery
// } from "../../../../../../../services/courseApi";
// import { useGetAllTestCategoryQuery, useGetAllTestQuery } from "../../../../../../../services/questionApi";
// import { showToast } from "../../../../../../../slice/toastSlice";
// import { useAppDispatch } from "../../../../../../../store/hook";
// import type { TestCategory, TestProps } from "../../../../../../../types/question";
// import { getTestTypeVariant } from "../../../../../../../utils/statusMap";
// import EmptyRoute from "../../../../../../organism/EmptyRoute";

// interface Props {
//     open: boolean;
//     setOpen: (newValue: boolean) => void;
//     testCategoryId?: number;
// }

// const validationSchema = Yup.object({
//     test_category_id: Yup.number().required("Test category is required"),
//     test_ids: Yup.array()
//         .of(Yup.number().required())
//         .min(1, "At least one test must be selected")
//         .required("Tests are required"),
//     course_id: Yup.number().required("Course ID is required"),
// });

// export default function AssignTestDialog({ open, setOpen, testCategoryId }: Props) {
//     const theme = useTheme();
//     const dispatch = useAppDispatch();
//     const { id } = useParams();
//     const [search, setSearch] = useState("");
//     const [selectedSearch, setSelectedSearch] = useState("");
//     const [categorySearch, setCategorySearch] = useState("");
//     const [selectedCategory, setSelectedCategory] = useState<TestCategory | null>(null);
//     const [qp] = useState({ pageIndex: 1, pageSize: 20 });
//     const [testCategoryQp] = useState({ pageIndex: 1, pageSize: 20 });

//     const { data, isLoading } = useGetAllTestQuery({ ...qp, search });
//     const { data: testCategory } = useGetAllTestCategoryQuery({
//         pageIndex: testCategoryQp.pageIndex,
//         pageSize: testCategoryQp.pageSize,
//         search: categorySearch,
//     });

//     const { data: selectedTestData } = useGetSelectedTestBasedOnTestCategoryAndCourseIdQuery(
//         {
//             course_id: Number(id),
//             test_category_id: selectedCategory?.id as number,
//             search: selectedSearch,
//         },
//         { skip: !id || !selectedCategory?.id }
//     );

//     const [assignTest, { isLoading: assigningTest }] = useAssignTestAndTestCategoryToCourseMutation();

//     const allTests = data?.data?.data || [];
//     const preAssignedTests: TestProps[] = selectedTestData?.data?.data || [];

//     const formik = useFormik({
//         initialValues: {
//             course_id: Number(id),
//             test_category_id: undefined as number | undefined,
//             test_ids: [] as number[],
//         },
//         validationSchema,
//         enableReinitialize: true,
//         onSubmit: async (values) => {
//             if (!values.test_category_id) {
//                 formik.setFieldTouched("test_category_id", true);
//                 formik.setFieldError("test_category_id", "Test category is required");
//                 return;
//             }
//             try {
//                 const response = await assignTest({
//                     course_id: values.course_id,
//                     test_ids: values.test_ids,
//                     test_category_id: values.test_category_id,
//                 }).unwrap();

//                 dispatch(
//                     showToast({
//                         message: response?.message || "Tests assigned successfully.",
//                         severity: "success",
//                     })
//                 );
//                 handleClose();
//             } catch (e: any) {
//                 dispatch(
//                     showToast({
//                         message: e?.data?.message || "Unable to assign test to course. Try again later.",
//                         severity: "error",
//                     })
//                 );
//             }
//         },
//     });

//     useEffect(() => {
//         if (preAssignedTests.length > 0) {
//             const existingIds = preAssignedTests.map((t) => Number(t.id));
//             const merged = Array.from(new Set([...existingIds, ...formik.values.test_ids]));
//             formik.setFieldValue("test_ids", merged);
//         }

//     }, [preAssignedTests]);

//     const handleClose = () => {
//         setOpen(false);
//         setSelectedCategory(null);
//         setCategorySearch("");
//         setSearch("");
//         formik.resetForm();
//     };

//     const handleToggleTest = (testId: number) => {
//         const current = formik.values.test_ids;
//         const updated = current.includes(testId)
//             ? current.filter((id) => id !== testId)
//             : [...current, testId];
//         formik.setFieldValue("test_ids", updated);
//     };

//     const handleCategoryChange = (value: TestCategory | null) => {
//         setSelectedCategory(value);
//         formik.setFieldValue("test_category_id", value?.id ?? undefined);
//         formik.setFieldValue("test_ids", []);
//     };

//     const selectedTestIds = formik.values.test_ids;

//     useEffect(() => {
//         if (testCategoryId) {
//             const matched = testCategory?.data?.data?.find(
//                 (cat: TestCategory) => Number(cat.id) === Number(testCategoryId)
//             );
//             if (matched) {
//                 setSelectedCategory(matched);
//                 formik.setFieldValue("test_category_id", matched.id);
//             } else {
//                 formik.setFieldValue("test_category_id", testCategoryId);
//             }
//         }
//     }, [testCategoryId, testCategory]);
//     return (
//         <Dialog
//             open={open}
//             onClose={handleClose}
//             sx={{
//                 "& .MuiPaper-root": {
//                     minWidth: { md: "664px", xl: "1041px" },
//                 },
//             }}
//         >
//             <DialogContent
//                 className="p-6! rounded-2xl"
//                 sx={{
//                     boxShadow: "0 4px 20px 0 rgba(0, 8, 251, 0.20)",
//                     background: theme.palette.primary.contrastText,
//                 }}
//             >
//                 <div className="flex justify-between items-center pb-1">
//                     <Typography variant="h5" className="text.dark" fontWeight={500}>
//                         Add Test & Test Category
//                     </Typography>
//                     <IconButton onClick={handleClose}>
//                         <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path
//                                 d="M13.492 1.66675H6.50866C3.47533 1.66675 1.66699 3.47508 1.66699 6.50841V13.4834C1.66699 16.5251 3.47533 18.3334 6.50866 18.3334H13.4837C16.517 18.3334 18.3253 16.5251 18.3253 13.4917V6.50841C18.3337 3.47508 16.5253 1.66675 13.492 1.66675ZM12.8003 11.9167C13.042 12.1584 13.042 12.5584 12.8003 12.8001C12.6753 12.9251 12.517 12.9834 12.3587 12.9834C12.2003 12.9834 12.042 12.9251 11.917 12.8001L10.0003 10.8834L8.08366 12.8001C7.95866 12.9251 7.80033 12.9834 7.64199 12.9834C7.48366 12.9834 7.32533 12.9251 7.20033 12.8001C6.95866 12.5584 6.95866 12.1584 7.20033 11.9167L9.11699 10.0001L7.20033 8.08341L8.08366 7.20008L10.0003 9.11675L11.917 7.20008C12.1587 6.95842 12.5587 6.95842 12.8003 7.20008C13.042 7.44175 13.042 7.84175 12.8003 8.08341L10.8837 10.0001L12.8003 11.9167Z"
//                                 fill="#E21D48"
//                             />
//                         </svg>
//                     </IconButton>
//                 </div>
//                 <Divider className="mb-6!" />

//                 {/* Test Category Selector */}
//                 <div className="input__field mb-4">
//                     <InputLabel className="required">Test Category</InputLabel>
//                     <Autocomplete<TestCategory>
//                         disabled={!!testCategoryId}
//                         options={testCategory?.data?.data ?? []}
//                         value={selectedCategory}
//                         onChange={(_, value) => handleCategoryChange(value)}
//                         onInputChange={(_, value) => setCategorySearch(value)}
//                         getOptionLabel={(option) => option.name}
//                         isOptionEqualToValue={(option, value) => option.id === value.id}
//                         renderInput={(params) => (
//                             <TextField
//                                 {...params}
//                                 placeholder="Search Test Category"
//                                 error={formik.touched.test_category_id && Boolean(formik.errors.test_category_id)}
//                                 helperText={formik.touched.test_category_id && formik.errors.test_category_id}
//                             />
//                         )}
//                     />
//                 </div>

//                 {/* Test Columns */}
//                 <Box className="media__wrapper rounded-2xl">
//                     <div className="test__grid md:grid grid-cols-2 gap-2">
//                         {/* All Tests */}
//                         <div className="col-span-1">
//                             <Typography variant="h5" fontWeight={500}>All Tests</Typography>
//                             <OutlinedInput
//                                 placeholder="Search"
//                                 value={search}
//                                 onChange={(e) => setSearch(e.target.value)}
//                                 sx={{ py: 1, mb: 2 }}
//                             />
//                             <Box
//                                 className="flex flex-col gap-2 p-1 h-[350px] overflow-auto"
//                                 sx={{
//                                     border: (theme) => `1px solid ${theme.palette.textField.border}`,
//                                     borderRadius: "4px",
//                                 }}
//                             >
//                                 {!isLoading && !allTests.length ? (
//                                     <EmptyRoute title="Test Not Found" message="" />
//                                 ) : (
//                                     allTests.map((item: TestProps) => (
//                                         <div className="col-span-1" key={item.id}>
//                                             <div className="flex gap-2 items-center">
//                                                 <Checkbox
//                                                     color="primary"
//                                                     checked={selectedTestIds.includes(Number(item.id))}
//                                                     onChange={() => handleToggleTest(Number(item.id))}
//                                                 />
//                                                 <div
//                                                     onClick={() => handleToggleTest(Number(item.id))}
//                                                     className="cursor-pointer flex-1"
//                                                 >
//                                                     <div className="flex items-end gap-1">
//                                                         <Typography variant="h5" fontWeight={500} className="capitalize">
//                                                             {item?.name}
//                                                         </Typography>
//                                                         <Chip
//                                                             sx={{
//                                                                 fontSize: "10px",
//                                                                 textTransform: "capitalize"
//                                                             }}
//                                                             label={item?.test_type}
//                                                             size="small"
//                                                             color={getTestTypeVariant(item?.test_type) ?? "primary"}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))
//                                 )}
//                             </Box>
//                         </div>

//                         {/* Selected Tests */}
//                         <div className="col-span-1">
//                             <Typography variant="h5" fontWeight={500}>Selected Tests</Typography>
//                             <OutlinedInput
//                                 placeholder="Search"
//                                 value={selectedSearch}
//                                 onChange={(e) => setSelectedSearch(e.target.value)}
//                                 sx={{ py: 1, mb: 2 }}
//                             />
//                             <Box
//                                 className="flex flex-col gap-2 p-1 h-[350px] overflow-auto"
//                                 sx={{
//                                     border: (theme) => `1px solid ${theme.palette.textField.border}`,
//                                     borderRadius: "4px",
//                                 }}
//                             >
//                                 {!selectedCategory ? (
//                                     <EmptyRoute
//                                         title="No Category Selected"
//                                         message="Please select a test category to view assigned tests."
//                                     />
//                                 ) : preAssignedTests.length === 0 ? (
//                                     <EmptyRoute title="No Tests Assigned" message="Select tests from the left to assign them." />
//                                 ) : (
//                                     preAssignedTests.map((item: TestProps) => (
//                                         <div className="col-span-1" key={item.id}>
//                                             <div className="flex gap-2 items-center">
//                                                 <Checkbox
//                                                     color="primary"
//                                                     checked={selectedTestIds.includes(Number(item.id))}
//                                                     onChange={() => handleToggleTest(Number(item.id))}
//                                                 />
//                                                 <div
//                                                     onClick={() => handleToggleTest(Number(item.id))}
//                                                     className="cursor-pointer flex-1"
//                                                 >
//                                                     <div className="flex items-end gap-1">
//                                                         <Typography variant="subtitle2" className="capitalize">
//                                                             {item?.name}
//                                                         </Typography>
//                                                         <Chip
//                                                             label={item?.test_type}
//                                                             size="small"
//                                                             color={getTestTypeVariant(item?.test_type) ?? "primary"}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))
//                                 )}
//                             </Box>
//                         </div>
//                     </div>

//                     {/* Footer */}
//                     <Box
//                         className="footer__action flex justify-end items-center gap-2 pt-6 mt-8 sticky -bottom-5"
//                         sx={{
//                             borderTop: `1px solid ${theme.palette.separator.dark}`,
//                             background: theme.palette.primary.contrastText,
//                         }}
//                     >
//                         <Button
//                             variant="contained"
//                             onClick={handleClose}
//                             sx={{
//                                 background: theme.palette.separator.dark,
//                                 color: theme.palette.text.middle,
//                             }}
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             variant="contained"
//                             color="primary"
//                             onClick={() => formik.handleSubmit()}
//                             disabled={assigningTest || !formik.isValid || !formik.dirty}
//                         >
//                             {assigningTest ? "Assigning..." : "Assign"} Test{" "}
//                             {selectedTestIds.length > 0 && `(${selectedTestIds.length})`}
//                         </Button>
//                     </Box>
//                 </Box>
//             </DialogContent>
//         </Dialog>
//     );
// }

import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogContent,
    Divider,
    IconButton,
    InputLabel,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import {
    useAssignTestAndTestCategoryToCourseMutation,
    useGetSelectedTestBasedOnTestCategoryAndCourseIdQuery
} from "../../../../../../../services/courseApi";
import { useGetAllTestCategoryQuery, useGetAllTestQuery } from "../../../../../../../services/questionApi";
import { showToast } from "../../../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../../../store/hook";
import type { TestCategory, TestProps } from "../../../../../../../types/question";
import InfiniteScrolling from "../../../../../../molecules/InfiniteScrolling";
import EmptyRoute from "../../../../../../organism/EmptyRoute";

interface Props {
    open: boolean;
    setOpen: (newValue: boolean) => void;
    testCategoryId?: number;
}

const PAGE_SIZE = 20;

const validationSchema = Yup.object({
    test_category_id: Yup.number().required("Test category is required"),
    test_ids: Yup.array()
        .of(Yup.number().required())
        .min(1, "At least one test must be selected")
        .required("Tests are required"),
    course_id: Yup.number().required("Course ID is required"),
});

export default function AssignTestDialog({ open, setOpen, testCategoryId }: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { id } = useParams();

    const [categorySearch, setCategorySearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<TestCategory | null>(null);
    const [testCategoryQp] = useState({ pageIndex: 1, pageSize: PAGE_SIZE });

    // --- All Tests: pagination + search + accumulated list ---
    const [testPage, setTestPage] = useState(1);
    const [testSearch, setTestSearch] = useState("");
    const [allTestsList, setAllTestsList] = useState<TestProps[]>([]);

    // --- Selected Tests (pre-assigned for the chosen category): pagination + search + accumulated list ---
    const [selectedTestPage, setSelectedTestPage] = useState(1);
    const [selectedTestSearch, setSelectedTestSearch] = useState("");
    const [preAssignedList, setPreAssignedList] = useState<TestProps[]>([]);

    const { data, isLoading, isFetching } = useGetAllTestQuery({
        pageIndex: testPage,
        pageSize: PAGE_SIZE,
        search: testSearch,
    });

    const { data: testCategory } = useGetAllTestCategoryQuery({
        pageIndex: testCategoryQp.pageIndex,
        pageSize: testCategoryQp.pageSize,
        search: categorySearch,
    });

    const {
        data: selectedTestData,
        isFetching: isFetchingSelectedTests,
    } = useGetSelectedTestBasedOnTestCategoryAndCourseIdQuery(
        {
            course_id: Number(id),
            test_category_id: selectedCategory?.id as number,
            pageIndex: selectedTestPage,
            pageSize: PAGE_SIZE,
            search: selectedTestSearch,
        },
        { skip: !id || !selectedCategory?.id }
    );

    const [assignTest, { isLoading: assigningTest }] = useAssignTestAndTestCategoryToCourseMutation();

    useEffect(() => {
        if (!data?.data?.data) return;
        setAllTestsList((prev) => (testPage === 1 ? data.data.data : [...prev, ...data.data.data]));
    }, [data, testPage, open]);

    useEffect(() => {
        if (!selectedTestData?.data?.data) return;
        setPreAssignedList((prev) =>
            selectedTestPage === 1 ? selectedTestData.data.data : [...prev, ...selectedTestData.data.data]
        );
    }, [selectedTestData, selectedTestPage, open]);

    const testsTotal = data?.data?.pagination?.total ?? allTestsList.length;
    const hasMoreTests = allTestsList.length < testsTotal;

    const selectedTestsTotal = selectedTestData?.data?.pagination?.total ?? preAssignedList.length;
    const hasMoreSelectedTests = preAssignedList.length < selectedTestsTotal;

    const formik = useFormik({
        initialValues: {
            course_id: Number(id),
            test_category_id: undefined as number | undefined,
            test_ids: [] as number[],
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (!values.test_category_id) {
                formik.setFieldTouched("test_category_id", true);
                formik.setFieldError("test_category_id", "Test category is required");
                return;
            }
            try {
                const response = await assignTest({
                    course_id: values.course_id,
                    test_ids: values.test_ids,
                    test_category_id: values.test_category_id,
                }).unwrap();

                dispatch(
                    showToast({
                        message: response?.message || "Tests assigned successfully.",
                        severity: "success",
                    })
                );
                handleClose();
            } catch (e: any) {
                dispatch(
                    showToast({
                        message: e?.data?.message || "Unable to assign test to course. Try again later.",
                        severity: "error",
                    })
                );
            }
        },
    });

    // --- Pre-select tests already assigned to this category, without clobbering
    // user's in-progress selections. Idempotent across paginated loads (Set union). ---
    useEffect(() => {
        if (preAssignedList.length > 0) {
            const existingIds = preAssignedList.map((t) => Number(t.id));
            const merged = Array.from(new Set([...existingIds, ...formik.values.test_ids]));
            formik.setFieldValue("test_ids", merged);
        }
    }, [preAssignedList]);

    // --- Pre-select category when testCategoryId prop is passed in ---
    useEffect(() => {
        if (testCategoryId) {
            const matched = testCategory?.data?.data?.find(
                (cat: TestCategory) => Number(cat.id) === Number(testCategoryId)
            );
            if (matched) {
                setSelectedCategory(matched);
                formik.setFieldValue("test_category_id", matched.id);
            } else {
                formik.setFieldValue("test_category_id", testCategoryId);
            }
        }
    }, [testCategoryId, testCategory, open]);

    const handleClose = () => {
        setOpen(false);
        setSelectedCategory(null);
        setCategorySearch("");
        setTestSearch("");
        setTestPage(1);
        setAllTestsList([]);
        setSelectedTestSearch("");
        setSelectedTestPage(1);
        setPreAssignedList([]);
        formik.resetForm();
    };

    const handleCategoryChange = (value: TestCategory | null) => {
        setSelectedCategory(value);
        formik.setFieldValue("test_category_id", value?.id ?? undefined);
        formik.setFieldValue("test_ids", []);

        // Reset the selected-tests list/pagination since it's scoped to the category
        setSelectedTestPage(1);
        setSelectedTestSearch("");
        setPreAssignedList([]);
    };

    const handleAllTestsSearch = (term: string) => {
        setTestSearch(term);
        setTestPage(1);
        setAllTestsList([]);
    };

    const handleSelectedTestsSearch = (term: string) => {
        setSelectedTestSearch(term);
        setSelectedTestPage(1);
        setPreAssignedList([]);
    };

    const fetchMoreTests = () => {
        if (!isFetching && hasMoreTests) setTestPage((p) => p + 1);
    };

    const fetchMoreSelectedTests = () => {
        if (!isFetchingSelectedTests && hasMoreSelectedTests) setSelectedTestPage((p) => p + 1);
    };

    const selectedTestIds = formik.values.test_ids;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            sx={{
                "& .MuiPaper-root": {
                    minWidth: { md: "664px", xl: "1041px" },
                },
            }}
        >
            <DialogContent
                className="p-6! rounded-2xl"
                sx={{
                    boxShadow: "0 4px 20px 0 rgba(0, 8, 251, 0.20)",
                    background: theme.palette.primary.contrastText,
                }}
            >
                <div className="flex justify-between items-center pb-1">
                    <Typography variant="h5" className="text.dark" fontWeight={500}>
                        Add Test & Test Category
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M13.492 1.66675H6.50866C3.47533 1.66675 1.66699 3.47508 1.66699 6.50841V13.4834C1.66699 16.5251 3.47533 18.3334 6.50866 18.3334H13.4837C16.517 18.3334 18.3253 16.5251 18.3253 13.4917V6.50841C18.3337 3.47508 16.5253 1.66675 13.492 1.66675ZM12.8003 11.9167C13.042 12.1584 13.042 12.5584 12.8003 12.8001C12.6753 12.9251 12.517 12.9834 12.3587 12.9834C12.2003 12.9834 12.042 12.9251 11.917 12.8001L10.0003 10.8834L8.08366 12.8001C7.95866 12.9251 7.80033 12.9834 7.64199 12.9834C7.48366 12.9834 7.32533 12.9251 7.20033 12.8001C6.95866 12.5584 6.95866 12.1584 7.20033 11.9167L9.11699 10.0001L7.20033 8.08341L8.08366 7.20008L10.0003 9.11675L11.917 7.20008C12.1587 6.95842 12.5587 6.95842 12.8003 7.20008C13.042 7.44175 13.042 7.84175 12.8003 8.08341L10.8837 10.0001L12.8003 11.9167Z"
                                fill="#E21D48"
                            />
                        </svg>
                    </IconButton>
                </div>
                <Divider className="mb-6!" />

                {/* Test Category Selector */}
                <div className="input__field mb-4">
                    <InputLabel className="required">Test Category</InputLabel>
                    <Autocomplete<TestCategory>
                        disabled={!!testCategoryId}
                        options={testCategory?.data?.data ?? []}
                        value={selectedCategory}
                        onChange={(_, value) => handleCategoryChange(value)}
                        onInputChange={(_, value) => setCategorySearch(value)}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search Test Category"
                                error={formik.touched.test_category_id && Boolean(formik.errors.test_category_id)}
                                helperText={formik.touched.test_category_id && formik.errors.test_category_id}
                            />
                        )}
                    />
                </div>

                {/* Test Columns */}
                <Box className="media__wrapper rounded-2xl">
                    <div className="test__grid md:grid grid-cols-2 gap-2">
                        {/* All Tests */}
                        <div className="col-span-1">
                            <Typography variant="h5" fontWeight={500}>All Tests</Typography>
                            <InfiniteScrolling
                                data={allTestsList}
                                hasMore={hasMoreTests}
                                selectedItems={selectedTestIds}
                                onSelectionChange={(ids) => formik.setFieldValue("test_ids", ids)}
                                fetchMore={fetchMoreTests}
                                onSearch={handleAllTestsSearch}
                                loading={isLoading || isFetching}
                                itemLabelKey="name"
                                itemIdKey="id"
                                placeholder="Search tests"
                                scrollableId="allTestsScrollDiv"
                            />
                        </div>

                        {/* Selected Tests */}
                        <div className="col-span-1">
                            <Typography variant="h5" fontWeight={500}>Selected Tests</Typography>
                            {!selectedCategory ? (
                                <EmptyRoute
                                    title="No Category Selected"
                                    message="Please select a test category to view assigned tests."
                                />
                            ) : (
                                <InfiniteScrolling
                                    data={preAssignedList}
                                    hasMore={hasMoreSelectedTests}
                                    selectedItems={selectedTestIds}
                                    onSelectionChange={(ids) => formik.setFieldValue("test_ids", ids)}
                                    fetchMore={fetchMoreSelectedTests}
                                    onSearch={handleSelectedTestsSearch}
                                    loading={isFetchingSelectedTests}
                                    itemLabelKey="name"
                                    itemIdKey="id"
                                    placeholder="Search assigned tests"
                                    scrollableId="selectedTestsScrollDiv"
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <Box
                        className="footer__action flex justify-end items-center gap-2 pt-6 mt-8 sticky -bottom-5"
                        sx={{
                            borderTop: `1px solid ${theme.palette.separator.dark}`,
                            background: theme.palette.primary.contrastText,
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            sx={{
                                background: theme.palette.separator.dark,
                                color: theme.palette.text.middle,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => formik.handleSubmit()}
                            disabled={assigningTest || !formik.isValid || !formik.dirty}
                        >
                            {assigningTest ? "Assigning..." : "Assign"} Test{" "}
                            {selectedTestIds.length > 0 && `(${selectedTestIds.length})`}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}