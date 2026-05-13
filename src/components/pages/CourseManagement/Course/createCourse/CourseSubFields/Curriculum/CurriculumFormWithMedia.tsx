import { Box, Button, Dialog, DialogContent, Divider, FormHelperText, IconButton, InputLabel, OutlinedInput, Typography, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import React from 'react';
import { useParams } from 'react-router-dom';
import * as Yup from "yup";
import { useAddCurriculumMutation } from '../../../../../../../services/courseApi';
import { showToast } from '../../../../../../../slice/toastSlice';
import { useAppDispatch } from '../../../../../../../store/hook';
import { initialCurriculumInitialState, type courseTabType, type CurriculumProps, type CurriculumTestProps } from '../../../../../../../types/course';
import TextEditor from '../../../../../../atoms/TextEditor';
import FooterAction from '../../../../../../molecules/FooterAction';
import SelectFromMedia from '../../../../../../molecules/MediaFileDragDrop/SelectFromMedia';
import TestPickerDialog from './TestPickerDialog';

type CurriculumType = "subject" | "chapter" | "unit" | "lesson" | "child_lesson";

interface Props {
    open: boolean;
    setOpen: (newValue: boolean) => void;
    selectedCurriculum?: CurriculumProps | null;
    curriculumType?: CurriculumType;
    parentId?: number | null;
}

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required")
})

/** Render a test duration ({ hours, minutes } | number) as a label. */
function formatTestDuration(d: any): string {
    if (d == null) return "—";
    if (typeof d === "number") return d > 0 ? `${d} min` : "—";
    const hours = Number(d.hours ?? 0);
    const minutes = Number(d.minutes ?? 0);
    if (hours === 0 && minutes === 0) return "—";
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours} hr ${minutes} min`;
}

const getTitleByType = (type?: CurriculumType) => {
    switch (type) {
        case 'subject':
            return 'Create Subject';
        case 'chapter':
            return 'Create Chapter';
        case 'unit':
            return 'Create Unit';
        case 'lesson':
            return 'Create Lesson';
        case 'child_lesson':
            return 'Create Child Lesson';
        default:
            return 'Create Subject';
    }
};

export default function CurriculumFormWithMedia({
    open,
    setOpen,
    selectedCurriculum,
    curriculumType = 'subject',
    parentId = null
}: Props) {
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const theme = useTheme();
    const [mediaDialogOpen, setMediaDialogOpen] = React.useState(false);
    const [currentMediaType, setCurrentMediaType] = React.useState<courseTabType>("notes");
    const [testDialogOpen, setTestDialogOpen] = React.useState(false);
    const [selectedTestInfo, setSelectedTestInfo] = React.useState<CurriculumTestProps | null>(null);
    const showMediaOptions = curriculumType !== 'subject';

    const handleClose = () => {
        setOpen(false);
    }

    const [createCurriculum, { isLoading }] = useAddCurriculumMutation();

    const formik = useFormik({
        initialValues: selectedCurriculum ? {
            ...selectedCurriculum,
            test_id: selectedCurriculum.test_id ?? selectedCurriculum.test?.id ?? null,
        } : {
            ...initialCurriculumInitialState
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const payload = {
                    ...values,
                    type: curriculumType,
                    parent_id: parentId
                };

                const response = await createCurriculum({
                    body: payload,
                    id: Number(id),
                    type: curriculumType
                }).unwrap();

                dispatch(
                    showToast({
                        message: response.message || `${getTitleByType(curriculumType)} Created Successfully`,
                        severity: "success",
                    })
                );
                formik.resetForm();
                setSelectedTestInfo(null);
                handleClose();
            }
            catch (e: any) {
                dispatch(
                    showToast({
                        message: e.data.message || "Something went wrong",
                        severity: "error",
                    })
                );
            }
        }
    })


    const handleOpenMediaDialog = (type: courseTabType) => {
        setCurrentMediaType(type);
        setMediaDialogOpen(true);
    };

    const handleMediaSelect = (selectedIds: number[]) => {
        if (selectedIds.length > 0) {
            if (currentMediaType === "notes") {
                formik.setFieldValue("note_id", selectedIds[0]);
            } else if (currentMediaType === "audios") {
                formik.setFieldValue("audio_id", selectedIds[0]);
            }
        }
        setMediaDialogOpen(false);
    };

    React.useEffect(() => {
        setSelectedTestInfo(selectedCurriculum?.test ?? null);
    }, [selectedCurriculum?.test, selectedCurriculum?.id]);

    const handleTestSelect = (test: CurriculumTestProps) => {
        formik.setFieldValue("test_id", test.id);
        setSelectedTestInfo(test);
    };

    const handleRemoveTest = () => {
        formik.setFieldValue("test_id", null);
        setSelectedTestInfo(null);
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose}
                sx={{
                    "& .MuiPaper-root": {
                        minWidth: {
                            md: "664px",
                        }
                    }
                }}
            >
                <DialogContent className="p-6!  rounded-2xl"
                    sx={{
                        boxShadow: "0 4px 20px 0 rgba(0, 8, 251, 0.20)",
                        background: theme.palette.primary.contrastText
                    }}>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="flex justify-between items-center pb-1">
                            <Typography variant="h5" className="text.dark">
                                {getTitleByType(curriculumType)}
                            </Typography>
                            <IconButton onClick={handleClose} >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.492 1.66675H6.50866C3.47533 1.66675 1.66699 3.47508 1.66699 6.50841V13.4834C1.66699 16.5251 3.47533 18.3334 6.50866 18.3334H13.4837C16.517 18.3334 18.3253 16.5251 18.3253 13.4917V6.50841C18.3337 3.47508 16.5253 1.66675 13.492 1.66675ZM12.8003 11.9167C13.042 12.1584 13.042 12.5584 12.8003 12.8001C12.6753 12.9251 12.517 12.9834 12.3587 12.9834C12.2003 12.9834 12.042 12.9251 11.917 12.8001L10.0003 10.8834L8.08366 12.8001C7.95866 12.9251 7.80033 12.9834 7.64199 12.9834C7.48366 12.9834 7.32533 12.9251 7.20033 12.8001C6.95866 12.5584 6.95866 12.1584 7.20033 11.9167L9.11699 10.0001L7.20033 8.08341C6.95866 7.84175 6.95866 7.44175 7.20033 7.20008C7.44199 6.95842 7.84199 6.95842 8.08366 7.20008L10.0003 9.11675L11.917 7.20008C12.1587 6.95842 12.5587 6.95842 12.8003 7.20008C13.042 7.44175 13.042 7.84175 12.8003 8.08341L10.8837 10.0001L12.8003 11.9167Z" fill="#E21D48" />
                                </svg>
                            </IconButton>
                        </div>
                        <Divider className="mb-6!" />

                        <div className="flex flex-col gap-6 ">
                            <div className="input__field">
                                <InputLabel>Name of the {curriculumType}</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    name="name"
                                    placeholder={`Enter the name of the ${curriculumType}`}
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <FormHelperText error sx={{ mt: 0.5 }}>
                                        {formik.errors.name}
                                    </FormHelperText>
                                )}
                            </div>
                            <div className="input__field">
                                <TextEditor
                                    required
                                    value={formik.values.description}
                                    onChange={(value) => formik.setFieldValue("description", value)}
                                    onBlur={(value) => formik.setFieldValue("description", value)}
                                />
                                {formik.touched.description && formik.errors.description && (
                                    <FormHelperText error sx={{ mt: 0.5 }}>
                                        {formik.errors.description}
                                    </FormHelperText>
                                )}
                            </div>

                            {/* Show media options only for non-subject types */}
                            {showMediaOptions && (
                                <>
                                    <div className="input__field">
                                        <InputLabel>Add Notes</InputLabel>
                                        <Button
                                            variant="outlined"
                                            color='inherit'
                                            className='justify-start!'
                                            fullWidth
                                            onClick={() => handleOpenMediaDialog("notes")}
                                            startIcon={
                                                (<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="32" height="32" rx="16" fill="#D9F0FF" />
                                                    <path d="M18.6667 9.33301H13.3333C11 9.33301 10 10.6663 10 12.6663V19.333C10 21.333 11 22.6663 13.3333 22.6663H18.6667C21 22.6663 22 21.333 22 19.333V12.6663C22 10.6663 21 9.33301 18.6667 9.33301ZM13.3333 16.1663H16C16.2733 16.1663 16.5 16.393 16.5 16.6663C16.5 16.9397 16.2733 17.1663 16 17.1663H13.3333C13.06 17.1663 12.8333 16.9397 12.8333 16.6663C12.8333 16.393 13.06 16.1663 13.3333 16.1663ZM18.6667 19.833H13.3333C13.06 19.833 12.8333 19.6063 12.8333 19.333C12.8333 19.0597 13.06 18.833 13.3333 18.833H18.6667C18.94 18.833 19.1667 19.0597 19.1667 19.333C19.1667 19.6063 18.94 19.833 18.6667 19.833ZM20.3333 14.1663H19C17.9867 14.1663 17.1667 13.3463 17.1667 12.333V10.9997C17.1667 10.7263 17.3933 10.4997 17.6667 10.4997C17.94 10.4997 18.1667 10.7263 18.1667 10.9997V12.333C18.1667 12.793 18.54 13.1663 19 13.1663H20.3333C20.6067 13.1663 20.8333 13.393 20.8333 13.6663C20.8333 13.9397 20.6067 14.1663 20.3333 14.1663Z" fill="#1D82F5" />
                                                </svg>
                                                )
                                            }>Click to upload note</Button>
                                        {formik.values.note_id && (
                                            <Box className="w-12 h-12 rounded-md flex items-center justify-center mt-4 relative" sx={{
                                                background: theme.palette.warning.light
                                            }}>
                                                <IconButton onClick={() => {
                                                    formik.setFieldValue("note_id", null)
                                                }} className='absolute! -top-4 -right-4'>
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M13.492 1.66675H6.50866C3.47533 1.66675 1.66699 3.47508 1.66699 6.50841V13.4834C1.66699 16.5251 3.47533 18.3334 6.50866 18.3334H13.4837C16.517 18.3334 18.3253 16.5251 18.3253 13.4917V6.50841C18.3337 3.47508 16.5253 1.66675 13.492 1.66675ZM12.8003 11.9167C13.042 12.1584 13.042 12.5584 12.8003 12.8001C12.6753 12.9251 12.517 12.9834 12.3587 12.9834C12.2003 12.9834 12.042 12.9251 11.917 12.8001L10.0003 10.8834L8.08366 12.8001C7.95866 12.9251 7.80033 12.9834 7.64199 12.9834C7.48366 12.9834 7.32533 12.9251 7.20033 12.8001C6.95866 12.5584 6.95866 12.1584 7.20033 11.9167L9.11699 10.0001L7.20033 8.08341C6.95866 7.84175 6.95866 7.44175 7.20033 7.20008C7.44199 6.95842 7.84199 6.95842 8.08366 7.20008L10.0003 9.11675L11.917 7.20008C12.1587 6.95842 12.5587 6.95842 12.8003 7.20008C13.042 7.44175 13.042 7.84175 12.8003 8.08341L10.8837 10.0001L12.8003 11.9167Z" fill="#E21D48" />
                                                    </svg>
                                                </IconButton>
                                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21.3333 2.66699H10.6667C6 2.66699 4 5.33366 4 9.33366V22.667C4 26.667 6 29.3337 10.6667 29.3337H21.3333C26 29.3337 28 26.667 28 22.667V9.33366C28 5.33366 26 2.66699 21.3333 2.66699ZM10.6667 16.3337H16C16.5467 16.3337 17 16.787 17 17.3337C17 17.8803 16.5467 18.3337 16 18.3337H10.6667C10.12 18.3337 9.66667 17.8803 9.66667 17.3337C9.66667 16.787 10.12 16.3337 10.6667 16.3337ZM21.3333 23.667H10.6667C10.12 23.667 9.66667 23.2137 9.66667 22.667C9.66667 22.1203 10.12 21.667 10.6667 21.667H21.3333C21.88 21.667 22.3333 22.1203 22.3333 22.667C22.3333 23.2137 21.88 23.667 21.3333 23.667ZM24.6667 12.3337H22C19.9733 12.3337 18.3333 10.6937 18.3333 8.66699V6.00033C18.3333 5.45366 18.7867 5.00033 19.3333 5.00033C19.88 5.00033 20.3333 5.45366 20.3333 6.00033V8.66699C20.3333 9.58699 21.08 10.3337 22 10.3337H24.6667C25.2133 10.3337 25.6667 10.787 25.6667 11.3337C25.6667 11.8803 25.2133 12.3337 24.6667 12.3337Z" fill="#F97415" />
                                                </svg>
                                            </Box>

                                        )}
                                    </div>
                                    <div className="input__field">
                                        <InputLabel>Add Audio</InputLabel>
                                        <Button
                                            variant="outlined"
                                            color='inherit'
                                            className='justify-start!'
                                            fullWidth
                                            onClick={() => handleOpenMediaDialog("audios")}
                                            startIcon={
                                                (<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="32" height="32" rx="16" fill="#EDFDF5" />
                                                    <path d="M14.4467 17.2803C13.9534 17.2803 13.5601 17.6803 13.5601 18.1736C13.5601 18.6669 13.9601 19.0603 14.4467 19.0603C14.9401 19.0603 15.3401 18.6603 15.3401 18.1736C15.3401 17.6803 14.9401 17.2803 14.4467 17.2803Z" fill="#1BB830" />
                                                    <path d="M18.7935 9.33301H13.2068C10.7802 9.33301 9.3335 10.7797 9.3335 13.2063V18.7863C9.3335 21.2197 10.7802 22.6663 13.2068 22.6663H18.7868C21.2135 22.6663 22.6602 21.2197 22.6602 18.793V13.2063C22.6668 10.7797 21.2202 9.33301 18.7935 9.33301ZM19.4135 14.533C19.4135 14.9397 19.2402 15.2997 18.9468 15.513C18.7602 15.6463 18.5335 15.7197 18.2935 15.7197C18.1535 15.7197 18.0135 15.693 17.8668 15.6463L16.3402 15.1397C16.3335 15.1397 16.3202 15.133 16.3135 15.1263V18.1663C16.3135 19.193 15.4735 20.033 14.4468 20.033C13.4202 20.033 12.5802 19.193 12.5802 18.1663C12.5802 17.1397 13.4202 16.2997 14.4468 16.2997C14.7735 16.2997 15.0735 16.393 15.3402 16.533V13.753V13.3463C15.3402 12.9397 15.5135 12.5797 15.8068 12.3663C16.1068 12.153 16.5002 12.0997 16.8868 12.233L18.4135 12.7397C18.9868 12.933 19.4202 13.533 19.4202 14.133V14.533H19.4135Z" fill="#1BB830" />
                                                </svg>
                                                )
                                            }>Click to upload audio file </Button>
                                        {formik.values.audio_id && (
                                            <Box className="w-12 h-12 rounded-md flex items-center justify-center mt-4 relative" sx={{
                                                background: theme.palette.success.light
                                            }}>
                                                <IconButton onClick={() => {
                                                    formik.setFieldValue("audio_id", null)
                                                }} className='absolute! -top-4 -right-4'>
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M13.492 1.66675H6.50866C3.47533 1.66675 1.66699 3.47508 1.66699 6.50841V13.4834C1.66699 16.5251 3.47533 18.3334 6.50866 18.3334H13.4837C16.517 18.3334 18.3253 16.5251 18.3253 13.4917V6.50841C18.3337 3.47508 16.5253 1.66675 13.492 1.66675ZM12.8003 11.9167C13.042 12.1584 13.042 12.5584 12.8003 12.8001C12.6753 12.9251 12.517 12.9834 12.3587 12.9834C12.2003 12.9834 12.042 12.9251 11.917 12.8001L10.0003 10.8834L8.08366 12.8001C7.95866 12.9251 7.80033 12.9834 7.64199 12.9834C7.48366 12.9834 7.32533 12.9251 7.20033 12.8001C6.95866 12.5584 6.95866 12.1584 7.20033 11.9167L9.11699 10.0001L7.20033 8.08341C6.95866 7.84175 6.95866 7.44175 7.20033 7.20008C7.44199 6.95842 7.84199 6.95842 8.08366 7.20008L10.0003 9.11675L11.917 7.20008C12.1587 6.95842 12.5587 6.95842 12.8003 7.20008C13.042 7.44175 13.042 7.84175 12.8003 8.08341L10.8837 10.0001L12.8003 11.9167Z" fill="#E21D48" />
                                                    </svg>
                                                </IconButton>
                                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12.8935 18.5605C11.9068 18.5605 11.1201 19.3605 11.1201 20.3472C11.1201 21.3339 11.9201 22.1205 12.8935 22.1205C13.8801 22.1205 14.6801 21.3205 14.6801 20.3472C14.6801 19.3605 13.8801 18.5605 12.8935 18.5605Z" fill="#1BB830" />
                                                    <path d="M21.5868 2.66602H10.4134C5.56008 2.66602 2.66675 5.55935 2.66675 10.4127V21.5727C2.66675 26.4393 5.56008 29.3327 10.4134 29.3327H21.5734C26.4268 29.3327 29.3201 26.4393 29.3201 21.586V10.4127C29.3334 5.55935 26.4401 2.66602 21.5868 2.66602ZM22.8267 13.066C22.8267 13.8793 22.4801 14.5993 21.8934 15.026C21.5201 15.2927 21.0667 15.4393 20.5867 15.4393C20.3067 15.4393 20.0267 15.386 19.7334 15.2927L16.6801 14.2793C16.6667 14.2793 16.6401 14.266 16.6267 14.2527V20.3327C16.6267 22.386 14.9467 24.066 12.8934 24.066C10.8401 24.066 9.16008 22.386 9.16008 20.3327C9.16008 18.2793 10.8401 16.5993 12.8934 16.5993C13.5467 16.5993 14.1467 16.786 14.6801 17.066V11.506V10.6927C14.6801 9.87935 15.0267 9.15935 15.6134 8.73268C16.2134 8.30602 17.0001 8.19935 17.7734 8.46602L20.8267 9.47935C21.9734 9.86602 22.8401 11.066 22.8401 12.266V13.066H22.8267Z" fill="#1BB830" />
                                                </svg>
                                            </Box>
                                        )}
                                    </div>
                                    <div className="input__field">
                                        <InputLabel>Add Video</InputLabel>
                                        <OutlinedInput
                                            placeholder='Add URL to add videos'
                                            className='justify-start! gap-2! text-[8px]!'
                                            fullWidth
                                            name='video_url'
                                            startAdornment={
                                                (<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="32" height="32" rx="16" fill="#FFF0F1" />
                                                    <path d="M16.0002 9.33301C12.3202 9.33301 9.3335 12.3197 9.3335 15.9997C9.3335 19.6797 12.3202 22.6663 16.0002 22.6663C19.6802 22.6663 22.6668 19.6797 22.6668 15.9997C22.6668 12.3197 19.6802 9.33301 16.0002 9.33301ZM17.7735 17.153L16.9202 17.6463L16.0668 18.1397C14.9668 18.773 14.0668 18.253 14.0668 16.9863V15.9997V15.013C14.0668 13.7397 14.9668 13.2263 16.0668 13.8597L16.9202 14.353L17.7735 14.8463C18.8735 15.4797 18.8735 16.5197 17.7735 17.153Z" fill="#D91111" />
                                                </svg>
                                                )
                                            } value={formik.values.video_url}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.video_url && Boolean(formik.errors.video_url)}
                                        />
                                        {formik.touched.video_url && formik.errors.video_url && (
                                            <FormHelperText error sx={{ mt: 0.5 }}>
                                                {formik.errors.video_url}
                                            </FormHelperText>
                                        )}
                                    </div>
                                    <div className="input__field">
                                        <InputLabel>Add Test</InputLabel>
                                        <Button
                                            variant="outlined"
                                            color="inherit"
                                            className="justify-start!"
                                            fullWidth
                                            onClick={() => setTestDialogOpen(true)}
                                            startIcon={(
                                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="32" height="32" rx="16" fill="#E8E5FF" />
                                                    <path d="M19.3334 9.33301H12.6667C10.6667 9.33301 9.33337 10.333 9.33337 12.6663V19.333C9.33337 21.6663 10.6667 22.6663 12.6667 22.6663H19.3334C21.3334 22.6663 22.6667 21.6663 22.6667 19.333V12.6663C22.6667 10.333 21.3334 9.33301 19.3334 9.33301ZM13.3334 13.6663H17.3334C17.6067 13.6663 17.8334 13.893 17.8334 14.1663C17.8334 14.4397 17.6067 14.6663 17.3334 14.6663H13.3334C13.06 14.6663 12.8334 14.4397 12.8334 14.1663C12.8334 13.893 13.06 13.6663 13.3334 13.6663ZM18.6667 18.333H13.3334C13.06 18.333 12.8334 18.1063 12.8334 17.833C12.8334 17.5597 13.06 17.333 13.3334 17.333H18.6667C18.94 17.333 19.1667 17.5597 19.1667 17.833C19.1667 18.1063 18.94 18.333 18.6667 18.333Z" fill="#6E5BFF" />
                                                </svg>
                                            )}
                                        >
                                            {selectedTestInfo ? "Change Test" : "Click to select a test"}
                                        </Button>
                                        {selectedTestInfo && (
                                            <Box
                                                className="mt-4 p-3 rounded-md flex items-center gap-3 relative"
                                                sx={{
                                                    border: `1px solid ${theme.palette.textField.border}`,
                                                    background: theme.palette.primary.contrastText,
                                                }}
                                            >
                                                <IconButton onClick={handleRemoveTest} className="absolute! -top-4 -right-4">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M13.492 1.66675H6.50866C3.47533 1.66675 1.66699 3.47508 1.66699 6.50841V13.4834C1.66699 16.5251 3.47533 18.3334 6.50866 18.3334H13.4837C16.517 18.3334 18.3253 16.5251 18.3253 13.4917V6.50841C18.3337 3.47508 16.5253 1.66675 13.492 1.66675ZM12.8003 11.9167C13.042 12.1584 13.042 12.5584 12.8003 12.8001C12.6753 12.9251 12.517 12.9834 12.3587 12.9834C12.2003 12.9834 12.042 12.9251 11.917 12.8001L10.0003 10.8834L8.08366 12.8001C7.95866 12.9251 7.80033 12.9834 7.64199 12.9834C7.48366 12.9834 7.32533 12.9251 7.20033 12.8001C6.95866 12.5584 6.95866 12.1584 7.20033 11.9167L9.11699 10.0001L7.20033 8.08341C6.95866 7.84175 6.95866 7.44175 7.20033 7.20008C7.44199 6.95842 7.84199 6.95842 8.08366 7.20008L10.0003 9.11675L11.917 7.20008C12.1587 6.95842 12.5587 6.95842 12.8003 7.20008C13.042 7.44175 13.042 7.84175 12.8003 8.08341L10.8837 10.0001L12.8003 11.9167Z" fill="#E21D48" />
                                                    </svg>
                                                </IconButton>
                                                <Box
                                                    className="min-w-10 h-10 rounded-md flex items-center justify-center"
                                                    sx={{ background: theme.palette.primary.light, color: theme.palette.primary.main }}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M7 11H13" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M7 16H9.62" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </Box>
                                                <div className="content min-w-0 flex-1">
                                                    <Typography variant="subtitle2" fontWeight={500} className="truncate">
                                                        {selectedTestInfo.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.middle" className="capitalize">
                                                        {selectedTestInfo.test_type} · {selectedTestInfo.total_questions} Qs · {formatTestDuration(selectedTestInfo.duration)}
                                                    </Typography>
                                                </div>
                                            </Box>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <FooterAction
                            isLoading={isLoading}
                            isEditMode={!!selectedCurriculum?.id}
                            handleConfirmationChange={handleClose}
                            replaceLabel={isLoading ? "Creating Curriculum..." : "Create Curriculum"}
                        />
                    </form>
                </DialogContent>
            </Dialog>
            <SelectFromMedia
                open={mediaDialogOpen}
                setOpen={setMediaDialogOpen}
                type={currentMediaType}
                onSelect={handleMediaSelect}
                allowMultiple={false}
            />
            <TestPickerDialog
                open={testDialogOpen}
                setOpen={setTestDialogOpen}
                selectedTestId={selectedTestInfo?.id ?? formik.values.test_id ?? null}
                onSelect={handleTestSelect}
            />
        </>
    )
}