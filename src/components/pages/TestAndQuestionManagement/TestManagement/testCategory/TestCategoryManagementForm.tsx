import { Box, Button, FormHelperText, InputLabel, OutlinedInput, TextField, Typography, useTheme } from "@mui/material";
import { useFormik } from "formik";
import React from "react";
import * as Yup from "yup";
import { useCreateTestCategoryMutation, useUpdateTestCategoryMutation } from "../../../../../services/questionApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import { TestCategoryInitialState, type TestCategory } from "../../../../../types/question";
import { generateSlug } from "../../../../../utils/generateSlug";
import FileDragDrop from "../../../../molecules/FileDragDrop";
import ConfirmationDialog from "../../../../organism/ConfirmationDialog";



const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    slug: Yup.string().required("Slug is required"),
});

export default function TestCategoryManagementForm({ position, setPosition }: { position: TestCategory, setPosition: React.Dispatch<React.SetStateAction<TestCategory>> }) {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const [openConfirm, setOpenConfirm] = React.useState<boolean>(false);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState<boolean>(false);
    const isEditMode = Boolean(position.id);

    const [createTestCategory, { isLoading }] = useCreateTestCategoryMutation();
    const [updateTestCategory, { isLoading: isUpdating }] = useUpdateTestCategoryMutation();

    const formik = useFormik({
        initialValues: position,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const formData = new FormData();

            formData.append("name", values.name);
            formData.append("slug", values.slug);
            formData.append("description", values.description || "");

            if (values.image instanceof File) {
                formData.append("image", values.image);
            }

            if (values.image_url) {
                formData.append("image_url", values.image_url);
            }

            try {
                if (isEditMode) {
                    const response = await updateTestCategory({
                        id: position.id?.toString() || "",
                        body: formData,
                    }).unwrap();

                    dispatch(
                        showToast({
                            message: response?.message || "Category updated successfully",
                            severity: "success",
                        })
                    );
                } else {
                    const response = await createTestCategory(formData).unwrap();

                    dispatch(
                        showToast({
                            message: response?.message || "Category created successfully",
                            severity: "success",
                        })
                    );
                }

                setPosition(TestCategoryInitialState);
            } catch (e: any) {
                dispatch(
                    showToast({
                        message:
                            e?.data?.message ||
                            (isEditMode
                                ? "Unable to update category"
                                : "Unable to create category"),
                        severity: "error",
                    })
                );
            }
        },
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        formik.setFieldValue("name", newName);

        if (!isSlugManuallyEdited) {
            formik.setFieldValue("slug", generateSlug(newName));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSlugManuallyEdited(true);
        formik.handleChange(e);
    };

    const handleConfirmationChange = () => {
        if (formik.dirty) {
            setOpenConfirm((prev) => !prev)
        }
    }

    const handleFileChange = (file: File | null) => {
        formik.setFieldValue("image", file);
        if (!file) {
            formik.setFieldValue("image_url", "");
        }
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
                <div className="input__field">
                    <InputLabel htmlFor="name" className="required">
                        Name
                    </InputLabel>
                    <OutlinedInput
                        fullWidth
                        id="name"
                        name="name"
                        placeholder="Enter the name of the category"
                        value={formik.values.name}
                        onChange={handleNameChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                    />
                    {formik.touched.name && formik.errors.name && (
                        <FormHelperText error sx={{ mt: 0.5 }}>
                            {formik.errors.name}
                        </FormHelperText>
                    )}
                </div>



                {/* Slug Field */}
                <div className="input__field">
                    <InputLabel htmlFor="slug" className="required">
                        Slug
                    </InputLabel>
                    <OutlinedInput
                        fullWidth
                        id="slug"
                        name="slug"
                        placeholder="Enter the slug of the category"
                        value={formik.values.slug}
                        onChange={handleSlugChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.slug && Boolean(formik.errors.slug)}
                    />
                    {formik.touched.slug && formik.errors.slug && (
                        <FormHelperText error sx={{ mt: 0.5 }}>
                            {formik.errors.slug}
                        </FormHelperText>
                    )}
                </div>

                <FileDragDrop
                    onFileChange={handleFileChange}
                    initialFile={formik.values.image}
                    initialPreview={formik.values.image_url || ""}
                    error={formik.touched.image && Boolean(formik.errors.image)}
                    helperText={formik.touched.image && formik.errors.image ? String(formik.errors.image) : ""} label="Image/Icon" />

                <div className="input__field">
                    <InputLabel htmlFor="description">
                        Description
                    </InputLabel>

                    <TextField
                        fullWidth
                        id="description"
                        name="description"
                        placeholder="Enter the description of the category"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        multiline
                        rows={4}
                        variant="outlined"
                    />

                    {formik.touched.description && formik.errors.description && (
                        <FormHelperText error sx={{ mt: 0.5 }}>
                            {formik.errors.description}
                        </FormHelperText>
                    )}
                </div>

                <Box
                    className="footer__action flex justify-end items-center gap-2 py-6 mt-2 sticky -bottom-5"
                    sx={{
                        borderTop: `1px solid ${theme.palette.separator.dark}`,
                        background: theme.palette.primary.contrastText,
                    }}
                >
                    <Button
                        variant="contained"
                        sx={{
                            background: theme.palette.separator.dark,
                            color: theme.palette.text.middle
                        }}
                        onClick={handleConfirmationChange}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isLoading}
                    >
                        <Typography variant="body2">
                            {isEditMode ? (isUpdating ? "Updating" : "Update") : (isLoading ? "Creating" : "Create")} Positon
                        </Typography>
                    </Button>
                </Box>
            </form>
            <ConfirmationDialog
                title="Cancel Test Category"
                description="All the recent changes will be lost completely. Are you sure."
                open={openConfirm}
                setOpen={handleConfirmationChange}
                onSave={() => {
                    setPosition(TestCategoryInitialState);
                    handleConfirmationChange();
                }}
            />
        </>
    )
}
