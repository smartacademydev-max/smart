import { Box, Divider, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select, Typography } from "@mui/material";
import { useFormik } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { PATH } from "../../../../routes/PATH";
import { useGetAllCategoryRelatedToMegaCategoryQuery, useGetAllMegaCategoryQuery, useGetAllSubCategoryRelatedToCategoryQuery } from "../../../../services/categoryApi";
import { useCreateCourseMutation, useEditCourseMutation, useGetCourseByIdQuery } from "../../../../services/courseApi";
import { useGetAllPositionQuery } from "../../../../services/positionApi";
import { useGetAllUserQuery } from "../../../../services/userApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import { initialCourseState, PackageTypeValue, type courseTabType } from "../../../../types/course";
import type { RegisterUserProps } from "../../../../types/user";
import { createCourseFormData } from "../../../../utils/courseFormData";
import TextEditor from "../../../atoms/TextEditor";
import { YesNoSwitch } from "../../../atoms/YesNoSwitch";
import FileDragDrop from "../../../molecules/FileDragDrop";
import FooterAction from "../../../molecules/FooterAction";
import TabController from "../../../molecules/TabController";
import CategoryFilter from "../../../organism/CategoryFilter";
import PageHeader from "../../../organism/PageHeader";
import CourseOverviewForm from "./createCourse/CourseSubFields/Overview";
import CourseType from "./createCourse/CourseType";

const validationSchema = (id?: string) => Yup.object().shape({
    name: Yup.string()
        .required("Course name is required")
        .min(3, "Course name must be at least 3 characters")
        .max(200, "Course name must not exceed 200 characters"),
    can_take_free_trial: Yup.bool()
        .required("Field is required"),

    duration: Yup.object().shape({
        hours: Yup.number()
            .required("Hours is required")
            .min(0, "Hours must be at least 0")
            .max(999, "Hours must not exceed 999"),
        minutes: Yup.number()
            .required("Minutes is required")
            .min(0, "Minutes must be at least 0")
            .max(59, "Minutes must be between 0 and 59"),
    }).test(
        "duration-check",
        "Duration must be at least 1 minute",
        function (value) {
            const { hours, minutes } = value;
            return hours > 0 || minutes > 0;
        }
    ),

    description: Yup.string()
        .required("Course description is required")
        .min(10, "Description must be at least 10 characters"),

    thumbnail: id ?
        Yup.mixed().notRequired()
        : Yup.mixed()
            .required("Course thumbnail is required")
            .test(
                "fileSize",
                "File size must be less than 5MB",
                (value) => {
                    if (!value) return false;
                    return (value as File).size <= 5 * 1024 * 1024;
                }
            )
            .test(
                "fileType",
                "Only image files are allowed (jpg, jpeg, png, webp)",
                (value) => {
                    if (!value) return false;
                    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                    return validTypes.includes((value as File).type);
                }
            ),

    selections: Yup.object().shape({
        mega_category: Yup.array()
            .of(Yup.number())
            .min(1, "Please select at least one mega category"),
        category: Yup.object(),
        sub_category: Yup.object(),
        // position_ids: Yup.array()
        //     .of(Yup.number())
        //     .min(1, "Please select at least one position/level"),
    }),

    about_this_course: Yup.string()
        .required("About this course is required")
        .min(10, "About course must be at least 10 characters"),

    teachers: Yup.array()
        .of(Yup.number())
        .min(1, "Please select at least one instructor"),

    course_type: Yup.string()
        .oneOf(["free", "subscription", "expiry"], "Invalid course type")
        .required("Course type is required"),
    package_type: Yup.string()
        .oneOf(PackageTypeValue, "Invalid package type")
        .required("Package type is required"),

    course_expiry: Yup.object().when("course_type", {
        is: "expiry",
        then: (schema) => schema.shape({
            start_date: Yup.string().required("Start date is required"),
            end_date: Yup.string()
                .required("End date is required")
                .test(
                    "end-date-after-start",
                    "End date must be after start date",
                    function (value) {
                        const { start_date } = this.parent;
                        if (!start_date || !value) return true;
                        return new Date(value) > new Date(start_date);
                    }
                ),
            price: Yup.string().required("Price is required for expiry courses"),
            discount: Yup.number()
                .min(0, "Discount must be at least 0"),
            discount_type: Yup.string()
                .oneOf(["percentage", "amount"], "Invalid discount type")
                .required("Discount type is required"),
        }),
        otherwise: (schema) => schema.notRequired(),
    }),
});

export default function CourseManagementForm() {
    const { t } = useTranslation();
    const location = useLocation();
    const pathname = location.pathname;
    console.log(pathname)
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const [selectedTeachers, setSelectedTeachers] = React.useState<RegisterUserProps[]>([]);
    const teachersInitialized = React.useRef(false);

    const { data: megaCategories, isLoading: loadingMegaCategory } = useGetAllMegaCategoryQuery();

    const getInitialTab = (): courseTabType => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const playlistIdx = pathSegments.indexOf('playlist');
        if (playlistIdx > 0) {
            const type = pathSegments[playlistIdx - 1];
            const mediaTypes: courseTabType[] = ["videos", "notes", "audios"];
            if (mediaTypes.includes(type as courseTabType)) return type as courseTabType;
        }
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment === id) return "overview";
        const validTabs: courseTabType[] = ["overview", "curriculum", "videos", "notes", "test", "audios"];
        return validTabs.includes(lastSegment as courseTabType) ? (lastSegment as courseTabType) : "overview";
    };

    const [activeTab, setActiveTab] = React.useState<courseTabType>(getInitialTab());
    const [searchTeacher, setSearchTeacher] = React.useState("")

    // Update activeTab when pathname changes
    React.useEffect(() => {
        setActiveTab(getInitialTab());
    }, [pathname]);

    const { data: positions } = useGetAllPositionQuery({ pageIndex: 1, pageSize: 20, search: "", });
    const { data: teachers } = useGetAllUserQuery({ pageIndex: 1, pageSize: 20, search: searchTeacher, role: 4 });

    const { data } = useGetCourseByIdQuery({ id: id || "" }, { skip: !id });
    const [createCourse, { isLoading }] = useCreateCourseMutation();
    const [updateCourse, { isLoading: updating }] = useEditCourseMutation();

    React.useEffect(() => {
        teachersInitialized.current = false;
        setSelectedTeachers([]);
    }, [id]);

    React.useEffect(() => {
        if (!teachersInitialized.current && data?.data && data?.data?.teachers?.length > 0 && teachers?.data?.data) {
            const selected = data.data.teachers
                .map((teacherId: number) =>
                    teachers.data.data.find((t: RegisterUserProps) => Number(t.id) === Number(teacherId))
                )
                .filter((t): t is RegisterUserProps => !!t);
            if (selected.length > 0) {
                setSelectedTeachers(selected);
                teachersInitialized.current = true;
            }
        }
    }, [data?.data?.teachers, teachers?.data?.data]);

    const handleCategoryChange = (
        type: "mega" | "category" | "sub" | "position",
        ids: number[],
        parentId?: number
    ) => {
        switch (type) {
            case "mega":
                formik.setFieldValue("selections.mega_category", ids);
                // Reset child selection when mega changes:
                formik.setFieldValue("selections.category", {});
                formik.setFieldValue("selections.sub_category", {});
                break;
            case "category":
                formik.setFieldValue(`selections.category.${parentId}`, ids);
                formik.setFieldValue("selections.sub_category", {});
                break;
            case "sub":
                formik.setFieldValue(`selections.sub_category.${parentId}`, ids);
                break;
            case "position":
                formik.setFieldValue("selections.position_ids", ids);
                break;
        }
    };

    const handleTeacherSelection = (newValue: RegisterUserProps) => {
        const updatedTeachers = [...selectedTeachers, newValue];
        setSelectedTeachers(updatedTeachers);
        formik.setFieldValue(
            "teachers",
            updatedTeachers.map(t => parseInt(t.id || "0", 10))
        );
    };

    const handleTeacherRemoval = (teacherId: string) => {
        const filteredTeachers = selectedTeachers.filter((item) => item.id !== teacherId);
        setSelectedTeachers(filteredTeachers);
        formik.setFieldValue(
            "teachers",
            filteredTeachers.map(t => parseInt(t.id || "0", 10))
        );
    };

    const formik = useFormik({
        initialValues: data?.data || initialCourseState,
        validationSchema: validationSchema(id),
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (id) {
                try {
                    const formattedData = createCourseFormData(values);
                    const response = await updateCourse({ body: formattedData, id: Number(id) }).unwrap();

                    dispatch(
                        showToast({
                            message: response?.message || "Course Updated Successfully",
                            severity: "success"
                        })
                    );
                    // setActiveTab("curriculum");
                }
                catch (e: any) {
                    dispatch(
                        showToast({
                            message: e?.data?.message || "Unable to Update Course",
                            severity: "error"
                        })
                    )
                }
            }
            else {
                try {
                    const formattedData = createCourseFormData(values);
                    const response = await createCourse({ body: formattedData }).unwrap();
                    dispatch(
                        showToast({
                            message: response?.message || "Course Created Successfully",
                            severity: "success"
                        })
                    );
                    navigate(response.data && PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.ROOT(response.data.id))
                }
                catch (e: any) {
                    dispatch(
                        showToast({
                            message: e?.data?.message || "Unable to Create Course",
                            severity: "error"
                        })
                    )
                }
            }
        }
    })

    const { data: categories } = useGetAllCategoryRelatedToMegaCategoryQuery(
        {
            currentCategory: (formik?.values?.selections?.mega_category || [])
                .join(","),
        },
        {
            skip: !formik?.values?.selections?.mega_category?.length,
        }
    );
    const { data: subCategories } = useGetAllSubCategoryRelatedToCategoryQuery(
        {
            currentCategory: (formik?.values?.selections?.category
                ? Object.values(formik.values.selections.category)
                    .flat()
                    .join(",")
                : ""),
        },
        {
            skip: !formik?.values?.selections?.category ||
                !Object.values(formik.values.selections.category).length,
        }
    );

    const handleFileChange = (file: File | null) => {
        formik.setFieldValue("thumbnail", file);
        if (!file) {
            formik.setFieldValue("thumbnail_url", "");
        }
    };
    const handleTabChange = (newValue: courseTabType) => {

        if (!id) {
            dispatch(
                showToast({
                    message: "Please create the course first",
                    severity: "error"
                })
            );
            return;
        }
        setActiveTab(newValue);
    };

    const isFormVisible = !id || activeTab === "overview";

    return (
        <form onSubmit={formik.handleSubmit} className="course__management__form__root h-full flex flex-col">
            <PageHeader
                breadcrumb={[
                    {
                        title: t("menus.course_management.courses.root"),
                        icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 4.84969V16.7397C22 17.7097 21.21 18.5997 20.24 18.7197L19.93 18.7597C18.29 18.9797 15.98 19.6597 14.12 20.4397C13.47 20.7097 12.75 20.2197 12.75 19.5097V5.59969C12.75 5.22969 12.96 4.88969 13.29 4.70969C15.12 3.71969 17.89 2.83969 19.77 2.67969H19.83C21.03 2.67969 22 3.64969 22 4.84969Z" fill="#1D82F5" />
                            <path d="M10.7102 4.70969C8.88023 3.71969 6.11023 2.83969 4.23023 2.67969H4.16023C2.96023 2.67969 1.99023 3.64969 1.99023 4.84969V16.7397C1.99023 17.7097 2.78023 18.5997 3.75023 18.7197L4.06023 18.7597C5.70023 18.9797 8.01023 19.6597 9.87023 20.4397C10.5202 20.7097 11.2402 20.2197 11.2402 19.5097V5.59969C11.2402 5.21969 11.0402 4.88969 10.7102 4.70969ZM5.00023 7.73969H7.25023C7.66023 7.73969 8.00023 8.07969 8.00023 8.48969C8.00023 8.90969 7.66023 9.23969 7.25023 9.23969H5.00023C4.59023 9.23969 4.25023 8.90969 4.25023 8.48969C4.25023 8.07969 4.59023 7.73969 5.00023 7.73969ZM8.00023 12.2397H5.00023C4.59023 12.2397 4.25023 11.9097 4.25023 11.4897C4.25023 11.0797 4.59023 10.7397 5.00023 10.7397H8.00023C8.41023 10.7397 8.75023 11.0797 8.75023 11.4897C8.75023 11.9097 8.41023 12.2397 8.00023 12.2397Z" fill="#1D82F5" />
                        </svg>),
                        url: PATH.COURSE_MANAGEMENT.COURSES.ROOT
                    },
                    {
                        title: t("menus.course_management.courses.create_course"),
                    },
                ]}
            />
            <div className="course__content  h-full overflow-auto">
                <div className="flex flex-col 2xl:grid 2xl:grid-cols-2 gap-4 lg:gap-6 mb-6">
                    <FileDragDrop
                        required={true}
                        onFileChange={handleFileChange}
                        initialFile={formik.values.thumbnail}
                        initialPreview={formik.values.thumbnail_url}
                        error={formik.touched.thumbnail && Boolean(formik.errors.thumbnail)}
                        helperText={formik.touched.thumbnail && formik.errors.thumbnail ? String(formik.errors.thumbnail) : ""} label="Image" />
                    <div className="col-span-1">
                        <div className="input__field mb-6">
                            <InputLabel className="required">Course Name</InputLabel>
                            <OutlinedInput
                                fullWidth
                                placeholder="Enter Course Name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <FormHelperText error={true} sx={{ mt: 0.5 }}>
                                    {formik.errors.name}
                                </FormHelperText>
                            )}
                        </div>
                        <div className="input__field">
                            <InputLabel className="required">Package Type</InputLabel>
                            <Select
                                fullWidth
                                name="package_type"
                                value={formik.values.package_type}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.package_type && Boolean(formik.errors.package_type)}
                            >
                                {[
                                    { label: "Course", value: "course" },
                                    { label: "Notes", value: "notes" },
                                    { label: "Video", value: "video" },
                                    { label: "Audio", value: "audio" },
                                    { label: "Test", value: "test" },
                                    { label: "Live Class", value: "live_class" },

                                ].map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formik.touched.package_type && formik.errors.package_type && (
                                <FormHelperText error={true} sx={{ mt: 0.5 }}>
                                    {formik.errors.package_type}
                                </FormHelperText>
                            )}
                        </div>
                        <div className="input__field">
                            <InputLabel className="required">Duration</InputLabel>
                            <div className="flex items-center gap-5">
                                <div className="hours__wrapper flex items-center gap-2 flex-1">
                                    <OutlinedInput
                                        fullWidth
                                        placeholder="0"
                                        type="number"
                                        name="duration.hours"
                                        value={formik.values.duration?.hours}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.duration?.hours &&
                                            Boolean(formik.errors.duration?.hours)
                                        }
                                        inputProps={{ min: 0, max: 999 }}
                                    />
                                    <Typography variant="body2" color="text.middle">Months</Typography>
                                </div>
                                <Box color={"gray.gray3"}>:</Box>
                                <div className="minutes__wrapper flex items-center gap-2 flex-1">
                                    <OutlinedInput
                                        fullWidth
                                        placeholder="0"
                                        type="number"
                                        name="duration.minutes"
                                        value={formik.values.duration?.minutes}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.duration?.minutes &&
                                            Boolean(formik.errors.duration?.minutes)
                                        }
                                        inputProps={{ min: 0, max: 59 }}
                                    />
                                    <Typography variant="body2" color="text.middle">Days</Typography>
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
                </div >
                <div className="flex flex-col 2xl:grid 2xl:grid-cols-2 gap-4 lg:gap-6">
                    <div className="col-span-1">
                        <div className="input__field">
                            <TextEditor
                                required
                                value={formik.values.description}
                                onChange={(value) => formik.setFieldValue("description", value)}
                                onBlur={() => formik.setFieldTouched("description")}
                            />
                            {formik.touched.description && formik.errors.description && (
                                <FormHelperText error={true} sx={{ mt: 0.5 }}>
                                    {formik.errors.description}
                                </FormHelperText>
                            )}
                        </div>
                    </div>
                    <div className="col-span-1">
                        <CategoryFilter
                            megaCategories={megaCategories?.data || []}
                            categories={categories?.data || []}
                            subCategories={subCategories?.data || []}
                            positions={positions?.data?.data || []}
                            selections={formik.values.selections}
                            onChange={handleCategoryChange}
                            loadingMegaCategory={loadingMegaCategory}
                        />
                        {formik.touched.selections?.mega_category && formik.errors.selections?.mega_category && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                                {formik.errors.selections.mega_category}
                            </FormHelperText>
                        )}

                        {/* Flatten category errors */}
                        {formik.touched.selections?.category && Object.keys(formik.errors.selections?.category || {}).length > 0 && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                                Please select at least one category
                            </FormHelperText>
                        )}

                        {/* Flatten sub_category errors */}
                        {formik.touched.selections?.sub_category && Object.keys(formik.errors.selections?.sub_category || {}).length > 0 && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                                Please select at least one sub-category
                            </FormHelperText>
                        )}

                        {/* Position ids error */}
                        {formik.touched.selections?.position_ids && formik.errors.selections?.position_ids && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                                {formik.errors.selections.position_ids}
                            </FormHelperText>
                        )}
                    </div>
                </div>
                <div className="input__field my-6">
                    <div className="flex items-center gap-4">
                        <Typography variant="subtitle1" color="textField.name">
                            Allow User To Take Free Trial
                        </Typography>
                        <YesNoSwitch
                            checked={formik.values.can_take_free_trial}
                            onChange={(e) =>
                                formik.setFieldValue("can_take_free_trial", e.target.checked)
                            }
                        />
                    </div>
                    {formik.touched.can_take_free_trial && formik.errors.can_take_free_trial && (
                        <FormHelperText error={true} sx={{ mt: 0.5 }}>
                            {formik.errors.can_take_free_trial}
                        </FormHelperText>
                    )}
                </div>
                <Divider sx={{ marginTop: "36px", marginBottom: "36px" }} />
                <CourseType
                    formik={formik}
                />
                <Divider sx={{ marginTop: "36px", marginBottom: "36px" }} />
                <TabController
                    setActiveTab={handleTabChange}
                    currentActive={activeTab}
                    options={[
                        {
                            label: "Overview",
                            value: "overview",
                            redirect_url: id && PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.ROOT(Number(id))
                        },
                        {
                            label: "Curriculum",
                            value: "curriculum",
                            redirect_url: id && PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.CURRICULUM.ROOT(Number(id))
                        },
                        {
                            label: "Videos",
                            value: "videos",
                            redirect_url: id && PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.PLAYLIST.ROOT(Number(id), "videos")
                        },
                        {
                            label: "Notes",
                            value: "notes",
                            redirect_url: id && PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.PLAYLIST.ROOT(Number(id), "notes")
                        },
                        {
                            label: "Test",
                            value: "test",
                            redirect_url: id && PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.TEST.ROOT(Number(id))
                        },
                        {
                            label: "Audios",
                            value: "audios",
                            redirect_url: id && PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.PLAYLIST.ROOT(Number(id), "audios")
                        },
                    ]}
                />
                {activeTab === "overview" ? <CourseOverviewForm
                    teachers={teachers?.data?.data || []}
                    selectedTeachers={selectedTeachers}
                    handleTeacherSelection={handleTeacherSelection}
                    search={searchTeacher}
                    setSearch={setSearchTeacher}
                    handleTeacherRemoval={handleTeacherRemoval}
                    formik={formik}
                /> : ""}
                {/* {activeTab === "curriculum" ? <CourseCurriculumForm /> : ""}
                {activeTab === "notes" ? <CourseMedia type="notes" id={id} /> : ""}
                {activeTab === "audios" ? <CourseMedia type="audios" id={id} /> : ""}
                {activeTab === "videos" ? <CourseMedia type="videos" id={id} /> : ""}
                {activeTab === "test" ? <CourseTest id={id} /> : ""} */}
                <Outlet />
            </div>
            {isFormVisible && <FooterAction
                handleConfirmationChange={() => navigate(PATH.COURSE_MANAGEMENT.COURSES.ROOT)}
                isLoading={isLoading}
                isUpdating={updating}
                isEditMode={!!id}
                replaceLabel={id ? isLoading
                    ? "Updating Package..."
                    : "Update Package"
                    : isLoading
                        ? "Creating Package..."
                        : "Create Package"}
            />}
        </form >
    )
}