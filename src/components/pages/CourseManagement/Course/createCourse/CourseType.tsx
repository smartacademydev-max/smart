import { Box, Checkbox, Typography, useTheme } from '@mui/material';
import type { FormikProps } from 'formik';
import React from 'react';
import { useAppSelector } from '../../../../../store/hook';
import type { CourseProps, CourseTypeProps } from '../../../../../types/course';
import SubscriptionManagementForm from '../../../SubscriptionManagement/SubscriptionManagementForm';
import ExpiryCourseType from './CourseTypes/ExpiryCourseType';
import FreeCourseType from './CourseTypes/FreeCourseType';
import OpenAccessCourseType from './CourseTypes/OpenAccessCourseType';
import SubscriptionCourseType from './CourseTypes/SubscriptionCourseType';

interface Props {
    formik: FormikProps<CourseProps>
}

export default function CourseType({ formik }: Props) {
    const theme = useTheme();
    const user = useAppSelector((state) => state.auth.user);
    const userPermissions = (user?.permissions as unknown as string[]) || [];
    const canAddFreeMaterials = userPermissions.includes("add_free_materials");
    // If the course is already open_access but the editor lacks permission,
    // freeze the whole course_type picker so they can't switch it away either.
    const isLocked = formik.values.course_type === "open_access" && !canAddFreeMaterials;

    const allTypes = [
        {
            key: "free" as CourseTypeProps,
            title: "Free",
            description:
                "Offer open access to all learners — no payment or expiry needed. Ideal for demo lessons or free study materials.",
        },
        {
            key: "subscription" as CourseTypeProps,
            title: "Subscriptions",
            description:
                "Create paid or renewable courses with flexible plans. Set pricing, duration, and integrate payment options like Esewa or Khalti.",
        },
        {
            key: "expiry" as CourseTypeProps,
            title: "Expiry",
            description:
                "Set a fixed access period for your course. Define start and end dates, duration, and renewal options.",
        },
        {
            key: "open_access" as CourseTypeProps,
            title: "Free Materials",
            description:
                "Open to all logged-in users without enrollment. Won't appear in user-facing course menus — accessible only via Free Materials.",
        },
    ];

    // When locked (editing an open_access course without permission), show only
    // the open_access card so the user sees the current type but can't change it.
    // Otherwise hide Free Materials for users without permission.
    const displayedTypes = isLocked
        ? allTypes.filter((t) => t.key === "open_access")
        : canAddFreeMaterials
            ? allTypes
            : allTypes.filter((t) => t.key !== "open_access");

    return (
        <div className="course__type__wrapper">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4">
                <div className="col-span-4">
                    <Typography variant="h4" className="mb-1!">
                        Course Type
                    </Typography>
                    {isLocked && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                            Course type is locked. You need the <code>add_free_materials</code> permission to change a Free Materials course.
                        </Typography>
                    )}
                    {displayedTypes.map((item) => (
                        <Box
                            key={item.key}
                            className={`tab__item flex items-start gap-2 py-6 px-4 rounded-md ${formik.values.course_type === item.key ? 'active' : ''} ${isLocked ? '' : 'cursor-pointer'}`}
                            onClick={() => !isLocked && formik.setFieldValue("course_type", item.key)}

                            sx={{
                                background: formik.values.course_type === item.key ? theme.palette.primary.light : "",
                                opacity: isLocked ? 0.85 : 1,
                                pointerEvents: isLocked ? "none" : "auto",
                            }}
                        >
                            <Checkbox
                                color="primary"
                                checked={formik.values.course_type === item.key}
                                onChange={() => !isLocked && formik.setFieldValue("course_type", item.key)}
                                disabled={isLocked}
                            />

                            <div className="tab__label__content">
                                <Typography variant="h6">{item.title}</Typography>
                                <p style={{ color: theme.palette.text.light, }} className='text-[12px] leading-[16.8px]'>
                                    {item.description}
                                </p>
                            </div>
                        </Box>
                    ))}
                </div>

                <div className="col-span-8">
                    <ActivityBlock currentType={formik.values.course_type} formik={formik} />
                </div>
            </div>
        </div>
    );
}

function ActivityBlock({ currentType, formik }: { currentType: CourseTypeProps, formik: FormikProps<CourseProps> }) {
    const theme = useTheme();

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(true);
    }
    return (
        <Box
            className="py-6 px-8 rounded-2xl h-full"
            sx={{
                background: theme.palette.gray.gray1
            }}
        >
            {currentType === "free" &&

                <FreeCourseType
                    value={formik.values.free_type_description}
                    onChange={(value) => formik.setFieldValue("free_type_description", value)}
                    onBlur={(value) => formik.setFieldValue("free_type_description", value)}
                    error={formik.errors.free_type_description}
                />
            }
            {currentType === "subscription" &&
                <>
                    <SubscriptionCourseType
                        formik={formik}
                        handleClick={handleClick}
                    />
                    <SubscriptionManagementForm
                        open={open}
                        setOpen={setOpen}
                    />
                </>
            }
            {currentType === "expiry" &&

                <ExpiryCourseType formik={formik} />

            }
            {currentType === "open_access" &&
                <OpenAccessCourseType
                    value={formik.values.free_type_description}
                    onChange={(value) => formik.setFieldValue("free_type_description", value)}
                    onBlur={(value) => formik.setFieldValue("free_type_description", value)}
                    error={formik.errors.free_type_description}
                />
            }


        </Box>
    );
}
