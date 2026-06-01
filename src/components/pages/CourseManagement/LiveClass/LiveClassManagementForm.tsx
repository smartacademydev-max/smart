
import {
    Autocomplete,
    Checkbox,
    Divider,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    OutlinedInput,
    TextField,
    Typography
} from "@mui/material";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PATH } from "../../../../routes/PATH";
import { useGetAllCategoryRelatedToMegaCategoryQuery, useGetAllMegaCategoryQuery, useGetAllSubCategoryRelatedToCategoryQuery } from "../../../../services/categoryApi";
import { useGetAllCourseQuery } from "../../../../services/courseApi";
import { useCreateLiveClassMutation, useEditLiveClassMutation, useGetLiveClassByIdQuery } from "../../../../services/liveClass";
import { useGetAllPositionQuery } from "../../../../services/positionApi";
import { useGetZoomAccountsQuery } from "../../../../services/settingApi";
import { useGetAllUserQuery } from "../../../../services/userApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { CourseProps } from "../../../../types/course";
import { initialLiveClassState, liveClassValidationSchema } from "../../../../types/liveClass";
import { calcHasMore } from "../../../../utils/calculateHasMore";
import MakuraDatePicker from "../../../atoms/MakuraDatePicker";
import TextEditor from "../../../atoms/TextEditor";
import { YesNoSwitch } from "../../../atoms/YesNoSwitch";
import FooterAction from "../../../molecules/FooterAction";
import InfiniteScrolling from "../../../molecules/InfiniteScrolling";
import CategoryFilter from "../../../organism/CategoryFilter";

export default function LiveClassManagementForm() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    // Local state for category filtering (not part of form submission)
    const [categoryFilters, setCategoryFilters] = useState<{
        mega_category: number[];
        category: Record<number, number[]>;
        sub_category: Record<number, number[]>;
        position_ids: number[];
    }>({
        mega_category: [],
        category: {},
        sub_category: {},
        position_ids: []
    });

    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 10
    });
    const [search, setSearch] = useState("");
    const [courseList, setCourseList] = useState<CourseProps[]>([]);
    const formik = useFormik({
        initialValues: initialLiveClassState,
        validationSchema: liveClassValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (id) {
                try {
                    await updateLiveClass({ id: Number(id), body: values }).unwrap();
                    dispatch(showToast({
                        message: "Live Class Updated Successfully",
                        severity: "success"
                    }));
                    formik.resetForm();
                    navigate(PATH.COURSE_MANAGEMENT.LIVE_CLASSES.ROOT);
                } catch (e: any) {
                    dispatch(showToast({
                        message: e?.data?.message || "Unable to update live class. Try again later.",
                        severity: "error"
                    }));
                }
            } else {
                try {
                    await createLiveClass({ body: values }).unwrap();
                    dispatch(showToast({
                        message: "Live Class Created Successfully",
                        severity: "success"
                    }));
                    formik.resetForm();
                    navigate(PATH.COURSE_MANAGEMENT.LIVE_CLASSES.ROOT);
                } catch (e: any) {
                    dispatch(showToast({
                        message: e?.data?.message || "Unable to create live class. Try again later.",
                        severity: "error"
                    }));
                }
            }
        }
    });

    const [createLiveClass, { isLoading }] = useCreateLiveClassMutation();
    const [updateLiveClass, { isLoading: updating }] = useEditLiveClassMutation();
    const { data: liveClassData } = useGetLiveClassByIdQuery({ id: Number(id) }, { skip: !id });

    const { data: zoomAccountsData } = useGetZoomAccountsQuery();
    const activeZoomAccounts = (zoomAccountsData?.data ?? []).filter((a) => a.is_active);

    const { data: teachers } = useGetAllUserQuery({
        pageIndex: 1,
        pageSize: 100,
        role: 4,
    });

    const { data: megaCategories, isLoading: loadingMegaCategory } = useGetAllMegaCategoryQuery();

    const { data: categories } = useGetAllCategoryRelatedToMegaCategoryQuery(
        {
            currentCategory: (categoryFilters?.mega_category || []).join(","),
        },
        {
            skip: !categoryFilters?.mega_category?.length,
        }
    );

    const { data: subCategories } = useGetAllSubCategoryRelatedToCategoryQuery(
        {
            currentCategory: (categoryFilters?.category
                ? Object.values(categoryFilters.category).flat().join(",")
                : ""),
        },
        {
            skip: !categoryFilters?.category || !Object.values(categoryFilters.category).length,
        }
    );

    const courseFilterParams = {
        mega_category: categoryFilters?.mega_category || [],
        category: categoryFilters?.category
            ? Object.values(categoryFilters.category).flat()
            : [],
        sub_category: categoryFilters?.sub_category
            ? Object.values(categoryFilters.sub_category).flat()
            : [],
        positions: categoryFilters?.position_ids
            ? Object.values(categoryFilters.position_ids).flat()
            : [],
    };


    const { data: courses, isLoading: loadingCourses } = useGetAllCourseQuery({
        categoryFilter: courseFilterParams,
        pageIndex: qp.pageIndex,
        pageSize: qp.pageSize,
        search: search
    });
    const { data: positions } = useGetAllPositionQuery({ pageIndex: 1, pageSize: 20, search: "", });
    useEffect(() => {
        if (liveClassData?.data) {
            formik.setValues({
                ...liveClassData.data,
                weekly_days: liveClassData.data.weekly_days || [],
                end_date: liveClassData.data.end_date || null,
            });
        }
    }, [liveClassData]);

    const handleCategoryChange = (
        type: "mega" | "category" | "sub" | "position",
        ids: number[],
        parentId?: number
    ) => {
        switch (type) {
            case "mega":
                setCategoryFilters((prev) => ({
                    ...prev,
                    mega_category: ids,
                    category: [],
                    sub_category: []
                }));
                break;
            case "category":
                setCategoryFilters(prev => ({
                    ...prev,
                    category: { ...prev.category, [parentId!]: ids },
                    sub_category: {}
                }));
                break;
            case "sub":
                setCategoryFilters(prev => ({
                    ...prev,
                    sub_category: { ...prev.sub_category, [parentId!]: ids }
                }));
                break;
            case "position":
                setCategoryFilters(prev => ({
                    ...prev,
                    position_ids: ids
                }));
                break;
        }
    };


    const intervalOptions = [
        { label: "Daily", value: 1 },
        { label: "Weekly", value: 2 },
        { label: "Monthly", value: 3 }
    ];

    // const registrationOptions = [
    //     { label: "None", value: 99 },
    //     { label: "Register Once (Attend All Occurrences)", value: 1 },
    //     { label: "Register for Each Occurrence Separately", value: 2 },
    //     { label: "Register for One Occurrence Only", value: 3 }
    // ];


    const daysOptions = [
        { label: "Sunday", value: 1 },
        { label: "Monday", value: 2 },
        { label: "Tuesday", value: 3 },
        { label: "Wednesday", value: 4 },
        { label: "Thursday", value: 5 },
        { label: "Friday", value: 6 },
        { label: "Saturday", value: 7 }
    ];

    const recordingOptions = [
        { label: "Local", value: "local" },
        { label: "Cloud", value: "cloud" },
        { label: "None", value: "none" }
    ];

    useEffect(() => {
        if (!courses?.data?.data) return;

        setCourseList(prev => {
            if (qp.pageIndex === 1) {
                return courses.data.data;
            }

            const existingIds = new Set(prev.map(course => course.id));
            const newCourses = courses.data.data.filter(
                course => !existingIds.has(course.id)
            );

            return [...prev, ...newCourses];
        });
    }, [courses, qp.pageIndex]);

    const coursePagination = courses?.data?.pagination;
    const hasMoreCourses = calcHasMore(coursePagination);

    const fetchMoreCourses = () => {
        if (hasMoreCourses) {
            setQp(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
        }
    };

    const handleCourseSearch = (searchTerm: string) => {
        setSearch(searchTerm);
    };

    return (
        <div className="live__class__form h-full flex flex-col justify-between overflow-auto">
            <form onSubmit={formik.handleSubmit}>
                <Typography variant="body1" className="mb-4! font-medium!">
                    Basic Information
                </Typography>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
                    {/* CLASS NAME */}
                    <div className="col-span-1">
                        <InputLabel className="required">Name of the class</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="name"
                            placeholder="Enter the name of the class"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <Typography color="error" variant="caption">{formik.errors.name}</Typography>
                        )}
                    </div>

                    {/* ZOOM ACCOUNT */}
                    <div className="col-span-1">
                        <InputLabel className="required">Zoom Account</InputLabel>
                        <Autocomplete
                            options={activeZoomAccounts}
                            getOptionLabel={(option) => option.email || ""}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={activeZoomAccounts.find((a) => a.id === formik.values.account_id) || null}
                            onChange={(_e, v) => formik.setFieldValue("account_id", v?.id || null)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select Zoom Account"
                                />
                            )}
                            disabled={!!id}
                        />

                        {formik.touched.account_id && formik.errors.account_id && (
                            <Typography color="error" variant="caption">{formik.errors.account_id}</Typography>
                        )}
                    </div>

                    {/* AGENDA */}
                    <div className="col-span-1">
                        <TextEditor
                            label="Agenda"
                            value={formik.values.agenda}
                            onChange={(value) => formik.setFieldValue("agenda", value)}
                        // error={formik.touched.agenda && formik.errors.agenda}
                        />
                        {formik.touched.agenda && formik.errors.agenda && (
                            <Typography color="error" variant="caption">{formik.errors.agenda}</Typography>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="col-span-1">
                        <TextEditor
                            label="Description"
                            required={false}
                            value={formik.values.description || ""}
                            onChange={(value) => formik.setFieldValue("description", value)}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <Typography color="error" variant="caption">{formik.errors.description}</Typography>
                        )}
                    </div>
                </div>

                <Divider className="my-6!" />

                {/* SCHEDULE & DURATION */}
                <Typography variant="body1" className="mb-4! font-medium!">
                    Schedule & Duration
                </Typography>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
                    {/* Start Day & Time */}
                    <div className="col-span-1">
                        <InputLabel className="required">Start Day & Time</InputLabel>
                        <MakuraDatePicker
                            value={formik.values.schedule_date ? dayjs(formik.values.schedule_date) : null}
                            onChange={(date: Dayjs | null) => formik.setFieldValue("schedule_date", date ? date.format('YYYY-MM-DDTHH:mm:ss') : "")}
                            includeTime={true}
                        />
                        {formik.touched.schedule_date && formik.errors.schedule_date && (
                            <FormHelperText color="error" >{formik.errors.schedule_date}</FormHelperText>
                        )}
                    </div>

                    {/* Duration */}
                    <div className="col-span-1">
                        <InputLabel className="required">Duration (minutes)</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="duration"
                            type="number"
                            placeholder="Enter duration in minutes"
                            value={formik.values.duration}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.duration && Boolean(formik.errors.duration)}
                        />
                        {formik.touched.duration && formik.errors.duration && (
                            <FormHelperText color="error" >{formik.errors.duration}</FormHelperText>
                        )}
                    </div>

                    {/* RECURRING SWITCH */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-4">
                            <Typography variant="subtitle1" color="textField.name">
                                Do you want to make this live class recurring?
                            </Typography>
                            <YesNoSwitch
                                checked={formik.values.is_recurring}
                                onChange={(e) =>
                                    formik.setFieldValue("is_recurring", e.target.checked)
                                }
                            />
                        </div>
                    </div>

                    {/* Show only if recurring = true */}
                    {formik.values.is_recurring && (
                        <>
                            {/* Time Interval */}
                            <div className="col-span-1">
                                <InputLabel className="required">Time Interval</InputLabel>
                                <Autocomplete
                                    options={intervalOptions}
                                    getOptionLabel={(option) => option.label}
                                    value={intervalOptions.find(opt => opt.value === formik.values.recurring_type) || null}
                                    onChange={(_e, v) => {
                                        formik.setFieldValue("recurring_type", v?.value || 1);
                                        formik.setFieldValue("weekly_days", []);
                                        formik.setFieldValue("monthly_day", null);
                                    }}
                                    renderInput={(p) => (
                                        <TextField
                                            {...p}
                                            placeholder="Select Interval"
                                            error={formik.touched.recurring_type && Boolean(formik.errors.recurring_type)}
                                            helperText={formik.touched.recurring_type && formik.errors.recurring_type}
                                        />
                                    )}
                                />
                            </div>

                            {/* End Date */}
                            <div className="col-span-1">
                                <div className="flex gap-6 items-start">
                                    {formik.values.recurring_type === 3 && (
                                        <div className="input__field w-full">
                                            <InputLabel className="required">Weeks</InputLabel>
                                            <OutlinedInput
                                                fullWidth
                                                name="monthly_day"
                                                type="number"
                                                placeholder="Enter day (1-31)"
                                                value={formik.values.monthly_day || ""}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.monthly_day && Boolean(formik.errors.monthly_day)}
                                            />
                                            {formik.touched.monthly_day && formik.errors.monthly_day && (
                                                <Typography color="error" variant="caption">{formik.errors.monthly_day}</Typography>
                                            )}
                                        </div>
                                    )}
                                    {formik.values.recurring_type === 2 && (
                                        <div className="input__field w-full">
                                            <InputLabel className="required">Select Days</InputLabel>
                                            <Autocomplete
                                                disableClearable

                                                options={daysOptions}
                                                getOptionLabel={(option) => option.label}
                                                value={daysOptions.find(opt => opt.value === formik.values.registration_type) || undefined}
                                                onChange={(_e, v) => formik.setFieldValue("weekly_days", v?.value || 1)}
                                                renderInput={(p) => (
                                                    <TextField
                                                        {...p}
                                                        placeholder="Select Days"
                                                        error={formik.touched.weekly_days && Boolean(formik.errors.weekly_days)}
                                                        helperText={formik.touched.weekly_days && formik.errors.weekly_days}
                                                    />
                                                )}
                                            />
                                        </div>
                                    )}
                                    <div className="input_field w-full">
                                        <InputLabel className="required">End Date</InputLabel>
                                        <MakuraDatePicker
                                            value={formik.values.end_date ? dayjs(formik.values.end_date) : null}
                                            onChange={(date: Dayjs | null) => formik.setFieldValue("end_date", date ? date.format('YYYY-MM-DDTHH:mm:ss') : null)}

                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <Divider className="my-6!" />

                {/* Assignments */}
                <Typography variant="body1" className="mb-4! font-medium!">
                    Assignments
                </Typography>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
                    {/* Teachers */}
                    <div className="col-span-2">
                        <InputLabel className="required">Assign Teachers</InputLabel>
                        <Autocomplete
                            multiple
                            options={teachers?.data?.data || []}
                            getOptionLabel={(option) => option.name || ""}
                            value={(teachers?.data?.data || []).filter(teacher =>
                                formik.values?.teacher_ids.includes(Number(teacher.id))
                            )}
                            onChange={(_e, v) => formik.setFieldValue("teacher_ids", v.map(t => t.id))}
                            renderInput={(p) => (
                                <TextField
                                    {...p}
                                    placeholder="Select Teachers"
                                    error={formik.touched.teacher_ids && Boolean(formik.errors.teacher_ids)}
                                    helperText={formik.touched.teacher_ids && formik.errors.teacher_ids}
                                />
                            )}
                        />
                    </div>

                    {/* Category Filter for Courses */}
                    <div className="col-span-1">
                        <CategoryFilter
                            megaCategories={megaCategories?.data || []}
                            categories={categories?.data || []}
                            subCategories={subCategories?.data || []}
                            positions={positions?.data?.data || []}
                            selections={categoryFilters}
                            onChange={handleCategoryChange}
                            loadingMegaCategory={loadingMegaCategory}
                        />
                    </div>

                    {/* Link Courses */}
                    <div className="col-span-1">
                        <InputLabel className="required">Link Courses</InputLabel>
                        <InfiniteScrolling
                            key="course-list"
                            scrollableId="course-scrollable"
                            data={courseList || []}
                            hasMore={hasMoreCourses}
                            selectedItems={formik.values.courses}
                            onSelectionChange={(selectedIds) => {
                                formik.setFieldValue("courses", selectedIds);
                            }}
                            fetchMore={fetchMoreCourses}
                            onSearch={handleCourseSearch}
                            loading={loadingCourses}
                            maxSelection={200}
                            itemLabelKey="name"
                            itemIdKey="id"
                            placeholder="Search courses..."
                        />
                        {formik.touched.courses && formik.errors.courses && (
                            <FormHelperText error>{formik.errors.courses}</FormHelperText>
                        )}
                        {/* <Autocomplete
                            multiple
                            options={courses?.data?.data || []}
                            getOptionLabel={(option) => option.name || ""}
                            value={(courses?.data?.data || []).filter(course =>
                                formik.values?.courses?.includes(Number(course.id))
                            )}
                            onChange={(_e, v) => formik.setFieldValue("courses", v.map(c => c.id))}
                            renderInput={(p) => (
                                <TextField
                                    {...p}
                                    placeholder="Select Courses"
                                    error={formik.touched.courses && Boolean(formik.errors.courses)}
                                    helperText={formik.touched.courses && formik.errors.courses}
                                />
                            )}
                        /> */}
                    </div>
                </div>

                <Divider className="my-6!" />

                {/* Settings */}
                <Typography variant="body1" className="mb-4! font-medium!">
                    Live Class Setting
                </Typography>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <InputLabel >Max Attendee</InputLabel>
                        <OutlinedInput
                            fullWidth
                            placeholder="Enter the max. attendees"
                            name="attendee"
                            value={formik.values.attendee}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.attendee && Boolean(formik.errors.attendee)}
                        />
                        {formik.touched.attendee && formik.errors.attendee && (
                            <FormHelperText color="error" >{formik.errors.attendee}</FormHelperText>
                        )}
                    </div>
                    {/* Recording Toggle */}
                    <div className="col-span-1">
                        <FormControlLabel
                            label="Enable Auto Recording"
                            control={
                                <Checkbox
                                    value={formik.values.is_enable_recording}
                                    onChange={() =>
                                        formik.setFieldValue(
                                            "is_enable_recording",
                                            !formik.values.is_enable_recording
                                        )
                                    }
                                />
                            } />

                        <Autocomplete
                            disableClearable
                            options={recordingOptions || []}
                            getOptionLabel={(option) => option.label || ""}
                            disabled={formik.values.is_enable_recording}
                            value={recordingOptions?.find(acc => acc.value === formik.values.auto_recording) || undefined}
                            onChange={(_e, v) => formik.setFieldValue("auto_recording", v?.value || null)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select Zoom Account"
                                // error={formik.touched.auto_recording && Boolean(formik.errors.auto_recording)}
                                // helperText={formik.touched.auto_recording && formik.errors.auto_recording}
                                />
                            )}
                        />
                    </div>

                    {/* Interactive Feature */}
                    <div className="col-span-2">
                        <div className="flex justify-start items-center gap-8 lg:gap-12">
                            <FormControlLabel
                                label="Enable QA"
                                control={
                                    <Checkbox />
                                } />
                            <FormControlLabel
                                label="Enable Chat"
                                control={
                                    <Checkbox />
                                } />
                            <FormControlLabel
                                label="Registration Required"
                                control={
                                    <Checkbox />
                                } />
                        </div>
                    </div>

                </div>

                <FooterAction
                    handleConfirmationChange={() => navigate(-1)}
                    replaceLabel={isLoading ? "Creating Live Class..." : "Create Live Class"}
                    isLoading={isLoading}
                    isEditMode={!!id}
                    isUpdating={updating}
                />
            </form>
        </div>
    );
}