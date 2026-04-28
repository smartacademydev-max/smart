import { Autocomplete, Box, Button, Checkbox, CircularProgress, Dialog, DialogContent, Divider, FormControlLabel, IconButton, InputLabel, OutlinedInput, TextField, Typography, useTheme } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import * as Yup from "yup";
import SearchIcon from "../../../icons/SearchIcon";
import { useBrandSettings } from "../../../hooks/useBrandSettings";
import { useGetAllCourseQuery } from "../../../services/courseApi";
import { useGetAllBundleQuery, useGetAllIndividualTestQuery } from "../../../services/questionApi";
import { useAddTransactionMutation, useGetTransactionByIdQuery, useUpdateTransactionByIdMutation } from "../../../services/transactionApi";
import { useGetAllUserQuery } from "../../../services/userApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { useCourseFilter } from "../../../store/useCourseFilter";
import { paymentOptions } from "../../../types";
import type { CourseProps } from "../../../types/course";
import type { SetProps, TestProps } from "../../../types/question";
import type { EnrollmentType } from "../../../types/transaction";
import { TransactionInitialState } from "../../../types/transaction";
import type { RegisterUserProps } from "../../../types/user";
import { calcHasMore } from "../../../utils/calculateHasMore";
import FileDragDrop from "../../molecules/FileDragDrop";
import TabController from "../../molecules/TabController";
import CustomTable from "../../molecules/Table";
import CategoryFilter from "../../organism/CategoryFilter";

interface Props {
    open: boolean;
    setOpen: (newValue: boolean) => void;
    transactionId?: number | null;
}

const enrollmentConfig = {
    course: {
        label: "Select Course",
        caption: "(Select the course you want to enroll)",
        placeholder: "Search Course",
    },
    test: {
        label: "Select Test",
        caption: "(Select an individual purchasable test)",
        placeholder: "Search Test",
    },
    bundle: {
        label: "Select Bundle",
        caption: "(Select a test bundle)",
        placeholder: "Search Bundle",
    },
};

export default function TransactionManagementForm({ open, setOpen, transactionId }: Props) {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { brandName } = useBrandSettings();

    const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>("course");

    const [search, setSearch] = useState("");
    const [debounceSearch, setDebounceSearch] = useState("");
    const [searchCourse, setSearchCourse] = useState("");
    const [searchTest, setSearchTest] = useState("");
    const [searchBundle, setSearchBundle] = useState("");

    const [qp, _setQp] = useState({ pageIndex: 1, pageSize: 3 });
    const [courseQp, setCourseQp] = useState({ pageIndex: 1, pageSize: 10 });
    const [testQp, setTestQp] = useState({ pageIndex: 1, pageSize: 10 });
    const [bundleQp, setBundleQp] = useState({ pageIndex: 1, pageSize: 10 });

    const [courseList, setCourseList] = useState<CourseProps[]>([]);
    const [testList, setTestList] = useState<TestProps[]>([]);
    const [bundleList, setBundleList] = useState<SetProps[]>([]);

    const { data: transactionData, isLoading: loadingTransaction } = useGetTransactionByIdQuery(
        transactionId as number,
        { skip: !transactionId }
    );

    const transaction = transactionData?.data;

    useEffect(() => {
        if (!transaction) return;
        if (transaction.test_id && transaction.test_id > 0) setEnrollmentType("test");
        else if (transaction.bundle_id && transaction.bundle_id > 0) setEnrollmentType("bundle");
        else setEnrollmentType("course");
    }, [transaction]);

    useEffect(() => {
        const timer = setTimeout(() => setDebounceSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useGetAllUserQuery({ ...qp, search: debounceSearch });

    const paymentStatus = [
        { label: "Success", value: "success" },
        { label: "Installment", value: "installment" }
    ];

    const [addTransaction, { isLoading: creatingTransaction }] = useAddTransactionMutation();
    const [updateTransaction, { isLoading: updatingTransaction }] = useUpdateTransactionByIdMutation();

    const generateInvoiceId = (studentId?: number) => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const timestamp = Date.now();
        const prefix = (brandName || "INVOICE").toUpperCase().replace(/\s+/g, "-");
        return `${prefix}-${year}${month}${day}-${timestamp}${studentId ? `-${studentId}` : ''}`;
    };

    const validationSchema = useMemo(() => Yup.object({
        student_id: Yup.number()
            .min(1, "Please select a student")
            .required("Please select a student"),
        course_id: enrollmentType === "course"
            ? Yup.number().min(1, "Please select a course").required("Please select a course")
            : Yup.number(),
        test_id: enrollmentType === "test"
            ? Yup.number().min(1, "Please select a test").required("Please select a test")
            : Yup.number(),
        bundle_id: enrollmentType === "bundle"
            ? Yup.number().min(1, "Please select a bundle").required("Please select a bundle")
            : Yup.number(),
        invoice_id: Yup.string().required("Invoice ID is required"),
        transaction_id: Yup.string().required("Transaction/Bill No. is required"),
        payment_method: Yup.string()
            .oneOf(["esewa", "khalti", "cash", "fonepay"])
            .required("Payment method is required"),
        status: Yup.string()
            .oneOf(["success", "installment"])
            .required("Payment status is required"),
        image: Yup.mixed().nullable(),
        image_url: Yup.string().nullable()
    }), [enrollmentType]);

    const formik = useFormik({
        initialValues: transaction ? {
            student_id: transaction.student_id || 0,
            course_id: transaction.course_id || 0,
            test_id: transaction.test_id || 0,
            bundle_id: transaction.bundle_id || 0,
            invoice_id: transaction.invoice_id || ``,
            transaction_id: transaction.transaction_id || "",
            payment_method: transaction.payment_method || "",
            status: transaction.status || "",
            image: null,
            image_url: transaction.image_url || null
        } : TransactionInitialState,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const formData = new FormData();

            formData.append("student_id", String(values.student_id));
            formData.append("invoice_id", values.invoice_id);
            formData.append("transaction_id", values.transaction_id);
            formData.append("payment_method", values.payment_method);
            formData.append("status", values.status);

            if (enrollmentType === "course") {
                formData.append("course_id", String(values.course_id));
            } else if (enrollmentType === "test") {
                formData.append("test_id", String(values.test_id));
            } else if (enrollmentType === "bundle") {
                formData.append("bundle_id", String(values.bundle_id));
            }

            if (values.image) {
                formData.append("image", values.image);
            }

            if (values.image_url && !values.image) {
                formData.append("image_url", values.image_url);
            }

            if (transactionId) {
                try {
                    const response = await updateTransaction({ id: transactionId, body: formData }).unwrap();
                    dispatch(showToast({ message: response?.message || "Unable to Update Transaction", severity: "success" }));
                    formik.resetForm();
                    handleClose();
                    resetFilters();
                } catch (e: any) {
                    dispatch(showToast({ message: e?.data?.message || "Unable to Update Transaction", severity: "error" }));
                }
            } else {
                try {
                    const response = await addTransaction({ body: formData }).unwrap();
                    dispatch(showToast({ message: response?.message || "Unable to Create Transaction", severity: "success" }));
                    formik.resetForm();
                    handleClose();
                    resetFilters();
                } catch (e: any) {
                    dispatch(showToast({ message: e?.data?.message || "Unable to Create Transaction", severity: "error" }));
                }
            }
        }
    });

    const handleClose = () => {
        formik.resetForm();
        setEnrollmentType("course");
        setTestList([]);
        setBundleList([]);
        setSearchTest("");
        setSearchBundle("");
        setTestQp({ pageIndex: 1, pageSize: 10 });
        setBundleQp({ pageIndex: 1, pageSize: 10 });
        setOpen(false);
    };

    const handleTabChange = (newType: EnrollmentType) => {
        setEnrollmentType(newType);
        formik.setFieldValue("course_id", 0);
        formik.setFieldValue("test_id", 0);
        formik.setFieldValue("bundle_id", 0);
        // Don't clear lists — existing data stays visible while fresh data loads.
        // pageIndex resets only if user had scrolled, triggering a fresh query with new params.
        setCourseQp(prev => prev.pageIndex !== 1 ? { pageIndex: 1, pageSize: 10 } : prev);
        setTestQp(prev => prev.pageIndex !== 1 ? { pageIndex: 1, pageSize: 10 } : prev);
        setBundleQp(prev => prev.pageIndex !== 1 ? { pageIndex: 1, pageSize: 10 } : prev);
    };

    useEffect(() => {
        if (!transactionId && formik.values.student_id > 0 && !formik.values.invoice_id) {
            const newInvoiceId = generateInvoiceId(formik.values.student_id);
            formik.setFieldValue("invoice_id", newInvoiceId);
        }
    }, [formik.values.student_id, transactionId]);

    const handleSelectRow = (id: number) => {
        formik.setFieldValue("student_id", Number(id));
        if (!transactionId) {
            const newInvoiceId = generateInvoiceId(Number(id));
            formik.setFieldValue("invoice_id", newInvoiceId);
        }
    };

    const columns = useMemo<ColumnDef<RegisterUserProps>[]>(() => [
        {
            header: () => <Typography fontWeight={500}>Select</Typography>,
            accessorKey: "select",
            cell: ({ row }) => (
                <Checkbox
                    checked={formik.values.student_id === Number(row.original.id)}
                    onChange={() => handleSelectRow(Number(row.original.id))}
                    color="primary"
                />
            ),
            size: 80,
        },
        {
            header: "Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <Typography fontWeight={500} className="capitalize">{row.original.name}</Typography>
            ),
        },
        {
            header: "Email",
            accessorKey: "email",
            cell: ({ row }) => <Typography fontWeight={500}>{row.original.email}</Typography>,
        },
        {
            header: "Phone",
            accessorKey: "phone",
            cell: ({ row }) => <Typography fontWeight={500}>{row.original.phone}</Typography>,
        },
    ], [formik.values.student_id]);

    const {
        megaCategories,
        categories,
        subCategories,
        selections,
        getSelectedCategoryFilterParams,
        handleCategoryChange,
        resetFilters
    } = useCourseFilter();

    const categoryFilter = getSelectedCategoryFilterParams();

    const { data: courses, isLoading: loadingCourses } = useGetAllCourseQuery(
        { ...courseQp, search: searchCourse, categoryFilter: { ...categoryFilter } }
    );
    const { data: tests, isLoading: loadingTests } = useGetAllIndividualTestQuery(
        { ...testQp, search: searchTest }
    );
    const { data: bundles, isLoading: loadingBundles } = useGetAllBundleQuery(
        { ...bundleQp, search: searchBundle }
    );

    useEffect(() => {
        if (!courses?.data?.data) return;
        setCourseList(prev => {
            if (courseQp.pageIndex === 1) return courses.data.data;
            const existingIds = new Set(prev.map(c => c.id));
            return [...prev, ...courses.data.data.filter(c => !existingIds.has(c.id))];
        });
    }, [courses, courseQp.pageIndex]);

    useEffect(() => {
        if (!tests?.data?.data) return;
        setTestList(prev => {
            if (testQp.pageIndex === 1) return tests.data.data;
            const existingIds = new Set(prev.map(t => t.id));
            return [...prev, ...tests.data.data.filter(t => !existingIds.has(t.id))];
        });
    }, [tests, testQp.pageIndex]);

    useEffect(() => {
        if (!bundles?.data?.data) return;
        setBundleList(prev => {
            if (bundleQp.pageIndex === 1) return bundles.data.data;
            const existingIds = new Set(prev.map(b => b.id));
            return [...prev, ...bundles.data.data.filter(b => !existingIds.has(b.id))];
        });
    }, [bundles, bundleQp.pageIndex]);

    const hasMoreCourses = calcHasMore(courses?.data?.pagination);
    const hasMoreTests = calcHasMore(tests?.data?.pagination);
    const hasMoreBundles = calcHasMore(bundles?.data?.pagination);

    const fetchMoreCourses = () => { if (hasMoreCourses) setCourseQp(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 })); };
    const fetchMoreTests = () => { if (hasMoreTests) setTestQp(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 })); };
    const fetchMoreBundles = () => { if (hasMoreBundles) setBundleQp(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 })); };

    const currentConfig = enrollmentConfig[enrollmentType];
    const currentSearch = enrollmentType === "course" ? searchCourse : enrollmentType === "test" ? searchTest : searchBundle;
    const handleSearchChange = (value: string) => {
        if (enrollmentType === "course") setSearchCourse(value);
        else if (enrollmentType === "test") setSearchTest(value);
        else setSearchBundle(value);
    };

    const itemListLoading = enrollmentType === "course" ? loadingCourses : enrollmentType === "test" ? loadingTests : loadingBundles;

    const activeFieldError = enrollmentType === "course"
        ? (formik.touched.course_id && formik.errors.course_id)
        : enrollmentType === "test"
            ? (formik.touched.test_id && formik.errors.test_id)
            : (formik.touched.bundle_id && formik.errors.bundle_id);

    return (
        <Dialog open={open} onClose={handleClose}
            sx={{
                "& .MuiPaper-root": {
                    minWidth: { md: "664px", xl: "1041px" }
                }
            }}>
            <DialogContent className="flex flex-col gap-6 pb-0!" sx={{ background: theme.palette.primary.contrastText }}>
                {loadingTransaction ? (
                    <Box className="flex justify-center items-center p-8">
                        <Typography>Loading transaction data...</Typography>
                    </Box>
                ) : (
                    <>
                        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">

                            <div className="header">
                                <div className="flex items-center justify-between">
                                    <Typography variant="h5">{transactionId ? "Edit Transaction" : "Create Transaction"}</Typography>
                                    <IconButton onClick={handleClose}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.492 1.66675H6.50866C3.47533 1.66675 1.66699 3.47508 1.66699 6.50841V13.4834C1.66699 16.5251 3.47533 18.3334 6.50866 18.3334H13.4837C16.517 18.3334 18.3253 16.5251 18.3253 13.4917V6.50841C18.3337 3.47508 16.5253 1.66675 13.492 1.66675ZM12.8003 11.9167C13.042 12.1584 13.042 12.5584 12.8003 12.8001C12.6753 12.9251 12.517 12.9834 12.3587 12.9834C12.2003 12.9834 12.042 12.9251 11.917 12.8001L10.0003 10.8834L8.08366 12.8001C7.95866 12.9251 7.80033 12.9834 7.64199 12.9834C7.48366 12.9834 7.32533 12.9251 7.20033 12.8001C6.95866 12.5584 6.95866 12.1584 7.20033 11.9167L9.11699 10.0001L7.20033 8.08341C6.95866 7.84175 6.95866 7.44175 7.20033 7.20008C7.44199 6.95842 7.84199 6.95842 8.08366 7.20008L10.0003 9.11675L11.917 7.20008C12.1587 6.95842 12.5587 6.95842 12.8003 7.20008C13.042 7.44175 13.042 7.84175 12.8003 8.08341L10.8837 10.0001L12.8003 11.9167Z" fill="#E21D48" />
                                        </svg>
                                    </IconButton>
                                </div>
                                <Divider />
                            </div>

                            {/* Student Search and Selection */}
                            <div>
                                <InputLabel className="required mb-2">Select Student</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    startAdornment={<SearchIcon />}
                                    placeholder="Search student/ email/ phone no."
                                    name="search"
                                    className="gap-1!"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {formik.touched.student_id && formik.errors.student_id && (
                                    <Typography color="error" variant="caption" className="mt-1">
                                        {formik.errors.student_id}
                                    </Typography>
                                )}
                            </div>

                            <CustomTable
                                columns={columns}
                                loading={isLoading}
                                data={data?.data?.data || []}
                            />
                            <Divider />

                            <TabController
                                currentActive={enrollmentType}
                                setActiveTab={handleTabChange}
                                options={[
                                    { label: "Course", value: "course" },
                                    { label: "Test", value: "test" },
                                    { label: "Bundle", value: "bundle" },
                                ]}
                            />

                            {/* Item Selection */}
                            <div className="flex flex-col gap-6 lg:grid grid-cols-12">
                                <div className="col-span-7">
                                    <CategoryFilter
                                        megaCategories={megaCategories}
                                        categories={categories}
                                        subCategories={subCategories}
                                        onChange={handleCategoryChange}
                                        selections={selections}
                                    />
                                </div>
                                <div className="col-span-5">
                                    <InputLabel>
                                        {currentConfig.label}{" "}
                                        <Typography variant="caption" color="text.middle">{currentConfig.caption}</Typography>
                                    </InputLabel>
                                    <OutlinedInput
                                        fullWidth
                                        value={currentSearch}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder={currentConfig.placeholder}
                                        sx={{ py: "4px" }}
                                    />

                                    <Box id="items__listing" className="h-[187px] overflow-y-auto p-2.5 rounded-md flex flex-col mt-4" sx={{ border: `1px solid ${theme.palette.separator.dark}` }}>
                                        {itemListLoading ? (
                                            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                                                <CircularProgress size={24} />
                                            </Box>
                                        ) : (
                                            <>
                                                {/* Course list */}
                                                {enrollmentType === "course" && (
                                                    <InfiniteScroll
                                                        dataLength={courseList.length}
                                                        next={fetchMoreCourses}
                                                        hasMore={hasMoreCourses}
                                                        scrollableTarget="items__listing"
                                                        loader={<Box sx={{ textAlign: "center", p: 2 }}><CircularProgress size={22} /></Box>}
                                                        endMessage={courseList.length > 0 && (
                                                            <Typography variant="caption" sx={{ display: "block", textAlign: "center", p: 2 }}>No more items</Typography>
                                                        )}
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            {courseList.length === 0 ? (
                                                                <Box sx={{ p: 3, textAlign: "center" }}>
                                                                    <Typography variant="body2" color="text.secondary">No items available</Typography>
                                                                </Box>
                                                            ) : courseList.map((course) => (
                                                                <FormControlLabel
                                                                    key={course.id}
                                                                    label={course.name}
                                                                    control={
                                                                        <Checkbox
                                                                            checked={formik.values.course_id === Number(course.id)}
                                                                            onChange={() => formik.setFieldValue("course_id", course.id)}
                                                                            color="primary"
                                                                        />
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                    </InfiniteScroll>
                                                )}

                                                {/* Test list */}
                                                {enrollmentType === "test" && (
                                                    <InfiniteScroll
                                                        dataLength={testList.length}
                                                        next={fetchMoreTests}
                                                        hasMore={hasMoreTests}
                                                        scrollableTarget="items__listing"
                                                        loader={<Box sx={{ textAlign: "center", p: 2 }}><CircularProgress size={22} /></Box>}
                                                        endMessage={testList.length > 0 && (
                                                            <Typography variant="caption" sx={{ display: "block", textAlign: "center", p: 2 }}>No more items</Typography>
                                                        )}
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            {testList.length === 0 ? (
                                                                <Box sx={{ p: 3, textAlign: "center" }}>
                                                                    <Typography variant="body2" color="text.secondary">No items available</Typography>
                                                                </Box>
                                                            ) : testList.map((test) => (
                                                                <FormControlLabel
                                                                    key={test.id ?? test.name}
                                                                    label={test.name}
                                                                    control={
                                                                        <Checkbox
                                                                            checked={formik.values.test_id === Number(test.id ?? 0)}
                                                                            onChange={() => formik.setFieldValue("test_id", test.id)}
                                                                            color="primary"
                                                                        />
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                    </InfiniteScroll>
                                                )}

                                                {/* Bundle list */}
                                                {enrollmentType === "bundle" && (
                                                    <InfiniteScroll
                                                        dataLength={bundleList.length}
                                                        next={fetchMoreBundles}
                                                        hasMore={hasMoreBundles}
                                                        scrollableTarget="items__listing"
                                                        loader={<Box sx={{ textAlign: "center", p: 2 }}><CircularProgress size={22} /></Box>}
                                                        endMessage={bundleList.length > 0 && (
                                                            <Typography variant="caption" sx={{ display: "block", textAlign: "center", p: 2 }}>No more items</Typography>
                                                        )}
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            {bundleList.length === 0 ? (
                                                                <Box sx={{ p: 3, textAlign: "center" }}>
                                                                    <Typography variant="body2" color="text.secondary">No items available</Typography>
                                                                </Box>
                                                            ) : bundleList.map((bundle) => (
                                                                <FormControlLabel
                                                                    key={bundle.id ?? bundle.name}
                                                                    label={bundle.name}
                                                                    control={
                                                                        <Checkbox
                                                                            checked={formik.values.bundle_id === Number(bundle.id ?? 0)}
                                                                            onChange={() => formik.setFieldValue("bundle_id", bundle.id)}
                                                                            color="primary"
                                                                        />
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                    </InfiniteScroll>
                                                )}
                                            </>
                                        )}
                                    </Box>

                                    {activeFieldError && (
                                        <Typography color="error" variant="caption" className="mt-1">
                                            {activeFieldError}
                                        </Typography>
                                    )}
                                </div>
                            </div>

                            <div className="md:grid grid-cols-2 flex flex-col gap-6 mt-6">
                                <div className="col-span-1">
                                    <div className="input_field">
                                        <InputLabel className="required">Invoice ID</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            placeholder="Invoice ID"
                                            name="invoice_id"
                                            value={formik.values.invoice_id}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.invoice_id && Boolean(formik.errors.invoice_id)}
                                        />
                                        {formik.touched.invoice_id && formik.errors.invoice_id && (
                                            <Typography color="error" variant="caption">{formik.errors.invoice_id}</Typography>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <div className="input_field">
                                        <InputLabel className="required">Payment Method</InputLabel>
                                        <Autocomplete
                                            fullWidth
                                            disableClearable
                                            options={paymentOptions}
                                            getOptionLabel={(option) => option.label}
                                            value={paymentOptions.find(opt => opt.value === formik.values.payment_method) || undefined}
                                            onChange={(_e, newValue) => formik.setFieldValue("payment_method", newValue?.value ?? "")}
                                            onBlur={() => formik.setFieldTouched("payment_method", true)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select Payment Method"
                                                    error={formik.touched.payment_method && Boolean(formik.errors.payment_method)}
                                                    helperText={formik.touched.payment_method && formik.errors.payment_method}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <div className="input_field">
                                        <InputLabel className="required">Payment Status</InputLabel>
                                        <Autocomplete
                                            disableClearable
                                            fullWidth
                                            options={paymentStatus}
                                            getOptionLabel={(option) => option.label}
                                            value={paymentStatus.find(opt => opt.value === formik.values.status) || undefined}
                                            onChange={(_e, newValue) => formik.setFieldValue("status", newValue?.value || "")}
                                            onBlur={() => formik.setFieldTouched("status", true)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select Payment Status"
                                                    error={formik.touched.status && Boolean(formik.errors.status)}
                                                    helperText={formik.touched.status && formik.errors.status}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <div className="input_field">
                                        <InputLabel className="required">Transaction/ Bill No.</InputLabel>
                                        <OutlinedInput
                                            fullWidth
                                            placeholder="Transaction/ Bill No."
                                            name="transaction_id"
                                            value={formik.values.transaction_id}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.transaction_id && Boolean(formik.errors.transaction_id)}
                                        />
                                        {formik.touched.transaction_id && formik.errors.transaction_id && (
                                            <Typography color="error" variant="caption">{formik.errors.transaction_id}</Typography>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="input_field">
                                        <FileDragDrop
                                            label="Bill / Screenshot"
                                            initialFile={formik.values.image}
                                            initialPreview={formik.values.image_url || ""}
                                            error={formik.touched.image && Boolean(formik.errors.image)}
                                            onFileChange={(file) => formik.setFieldValue("image", file)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <Box className="flex justify-end gap-4 py-6 sticky bottom-0 left-0 right-0" bgcolor={theme.palette.primary.contrastText}>
                                <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                                <Button variant="contained" type="submit" disabled={creatingTransaction || updatingTransaction}>
                                    {creatingTransaction || updatingTransaction
                                        ? (transactionId ? "Updating" : "Creating")
                                        : (transactionId ? "Update" : "Create")} Transaction
                                </Button>
                            </Box>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
