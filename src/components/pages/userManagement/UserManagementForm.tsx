import { Box, Button, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select, Typography, useTheme } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useFormik } from "formik";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { PATH } from "../../../routes/PATH";
import { useGetAllRolesQuery } from "../../../services/roleAndPermissionApi";
import { useCreateUserMutation, useEditUserMutation, useGetUserByIdQuery } from "../../../services/userApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { RegisterUserInitialData } from "../../../types/user";
import MakuraDatePicker from "../../atoms/MakuraDatePicker";
import Password from "../../atoms/Password";
import FileDragDrop from "../../molecules/FileDragDrop";
import ConfirmationDialog from "../../organism/ConfirmationDialog";

const validationSchema = (id?: string) => {
    return Yup.object({
        name: Yup.string()
            .required("Name is required")
            .min(2, "Name must have more than 2 characters")
            .max(50, "Name must not exceed 50 characters"),

        email: Yup.string()
            .required("Email is required")
            .email("Please enter a valid email address")
            .matches(
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                "Please enter a valid email address"
            ),

        phone: Yup.string()
            .required("Phone number is required")
            .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
            .length(10, "Phone number must be exactly 10 digits"),

        role: Yup.mixed(),
        designation: Yup.string()
            .required("Designation is required"),

        password: id
            ? Yup.string()
                .min(6, "Password must be at least 6 characters")
                .max(20, "Password must not exceed 20 characters")
            : Yup.string()
                .required("Password is required")
                .min(6, "Password must be at least 6 characters")
                .max(20, "Password must not exceed 20 characters")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                ),

        password_confirmation: id
            ? Yup.string()
                .oneOf([Yup.ref('password')], "Passwords must match")
            : Yup.string()
                .required("Password confirmation is required")
                .oneOf([Yup.ref('password')], "Passwords must match"),

        profile: Yup.mixed().nullable(),
        dob: Yup.mixed().nullable(),
        address: Yup.string(),
        temporary_address: Yup.string().nullable(),
    });
};

export default function UserManagementForm() {
    const { id } = useParams();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [openConfirm, setOpenConfirm] = React.useState<boolean>(false);

    const { data: roles } = useGetAllRolesQuery({
        pageSize: 20,
    });

    const [createUser, { isLoading }] = useCreateUserMutation();
    const { data: user } = useGetUserByIdQuery({ id: id || "" }, { skip: !id })
    const [updateUser, { isLoading: updating }] = useEditUserMutation();
    const formik = useFormik({
        initialValues: user?.data || RegisterUserInitialData,
        validationSchema: validationSchema(id),
        enableReinitialize: true,
        onSubmit: async (values) => {

            const formData = new FormData();

            if (values.name) {
                formData.append("name", values.name)
            }
            if (values.email) {
                formData.append("email", values.email)
            }
            if (values.phone) {
                formData.append("phone", values.phone)
            }
            if (values.role?.id) {
                formData.append("role", values.role.id)
            }
            if (values.password) {
                formData.append("password", values.password)
            }
            if (values.password_confirmation) {
                formData.append("password_confirmation", values.password_confirmation)
            }
            if (values.designation) {
                formData.append("designation", values.designation)
            }
            if (values.profile) {
                formData.append("profile", values.profile)
            }
            if (values.thumbnail_url) {
                formData.append("thumbnail_url", values.thumbnail_url)
            }
            if (values.dob) {
                const dateStr = typeof values.dob === 'string'
                    ? values.dob
                    : (values.dob as Dayjs).format('YYYY-MM-DD');
                formData.append("dob", dateStr)
            }
            if (values.address) {
                formData.append("address", values.address)
            }
            if (values.temporary_address) {
                formData.append("temporary_address", values.temporary_address)
            }
            if (id) {
                try {
                    const response = await updateUser({
                        id: id || "",
                        body: formData
                    }).unwrap();
                    dispatch(
                        showToast({
                            message: response.message || "User Updated Successfully",
                            severity: "success",
                        })
                    );
                    navigate(PATH.USER_MANAGEMENT.ROOT);
                }
                catch (e: any) {
                    dispatch(
                        showToast({
                            message: e?.data?.message || "Unable to update user. Try again later.",
                            severity: "error",
                        })
                    );
                }
            }
            else {
                try {
                    const response = await createUser(formData).unwrap();
                    dispatch(
                        showToast({
                            message: response.message || "User Created Successfully",
                            severity: "success",
                        })
                    );
                    navigate(PATH.USER_MANAGEMENT.ROOT);
                }
                catch (e: any) {
                    dispatch(
                        showToast({
                            message: e?.data?.message || "Unable to create user. Try again later.",
                            severity: "error",
                        })
                    );
                }
            }
        }
    });

    // Handle file upload
    const handleFileChange = (file: File | null) => {
        formik.setFieldValue('profile', file);
        formik.setFieldTouched('profile', true);
    };

    // Handle cancel with dirty check
    const handleCancel = () => {
        if (formik.dirty) {
            setOpenConfirm(true);
        } else {
            navigate(PATH.USER_MANAGEMENT.ROOT);
        }
    };

    const handleConfirmCancel = () => {
        setOpenConfirm(false);
        navigate(PATH.USER_MANAGEMENT.ROOT);
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit} className="h-full flex flex-col justify-between">
                <div className="top">
                    <div className="flex flex-col gap-4 lg:gap-6 md:grid md:grid-cols-2 mb-6">
                        <div className="col-span-1">
                            <FileDragDrop
                                onFileChange={handleFileChange}
                                initialFile={formik.values.profile}
                                initialPreview={formik.values.thumbnail_url}
                                error={formik.touched.profile && Boolean(formik.errors.profile)}
                                helperText={formik.touched.profile && formik.errors.profile ? String(formik.errors.profile) : ""}
                            />
                        </div>
                        <div className="col-span-1">
                            <div className="input__field mb-6">
                                <InputLabel className="required" htmlFor="name">Name</InputLabel>
                                <OutlinedInput
                                    name="name"
                                    id="name"
                                    fullWidth
                                    placeholder="Enter name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <FormHelperText error>{formik.errors.name}</FormHelperText>
                                )}
                            </div>
                            <div className="input__field">
                                <InputLabel className="required" htmlFor="designation">Designation</InputLabel>
                                <OutlinedInput
                                    name="designation"
                                    id="designation"
                                    fullWidth
                                    placeholder="Enter designation"
                                    value={formik.values.designation}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.designation && Boolean(formik.errors.designation)}
                                />
                                {formik.touched.designation && formik.errors.designation && (
                                    <FormHelperText error>{formik.errors.designation}</FormHelperText>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:gap-6 md:grid md:grid-cols-3 mb-6">
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel className="required" htmlFor="role">Role</InputLabel>
                                <Select
                                    fullWidth
                                    name="role"
                                    id="role"
                                    value={formik.values.role?.id || ""}
                                    onChange={(e) => {

                                        const selectedRole = roles?.data?.data?.find((r) => r.id === Number(e.target.value));
                                        formik.setFieldValue("role", selectedRole || null);
                                    }}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.role && Boolean(formik.errors.role)}
                                >
                                    {roles?.data?.data?.map((item) => (
                                        <MenuItem key={item.id} value={item.id} className="capitalize">
                                            {item.name.split("_").join(" ")}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.role && formik.errors.role && (
                                    <FormHelperText error>{String(formik.errors.role)}</FormHelperText>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel className="required" htmlFor="email">Email Address</InputLabel>
                                <OutlinedInput
                                    name="email"
                                    id="email"
                                    fullWidth
                                    placeholder="Enter email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <FormHelperText error>{formik.errors.email}</FormHelperText>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel className="required" htmlFor="phone">Phone No.</InputLabel>
                                <OutlinedInput
                                    name="phone"
                                    id="phone"
                                    fullWidth
                                    placeholder="Enter phone"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                                />
                                {formik.touched.phone && formik.errors.phone && (
                                    <FormHelperText error>{formik.errors.phone}</FormHelperText>
                                )}
                            </div>
                        </div>
                    </div>

                    <Typography variant="h6" className="pb-2 mb-8!" sx={{
                        borderBottom: `1px solid ${theme.palette.textField.border}`
                    }}>Password Credentials</Typography>

                    <div className="flex flex-col gap-4 lg:gap-6 md:grid md:grid-cols-3">
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel className="required" htmlFor="password">Password</InputLabel>
                                <Password
                                    name="password"
                                    id="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    placeholder="Enter password"
                                    autoComplete="new-password"
                                />
                                {formik.touched.password && formik.errors.password && (
                                    <FormHelperText error>{formik.errors.password}</FormHelperText>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel className="required" htmlFor="password_confirmation">Confirm Password</InputLabel>
                                <Password
                                    name="password_confirmation"
                                    id="password_confirmation"
                                    value={formik.values.password_confirmation}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.password_confirmation && Boolean(formik.errors.password_confirmation)}
                                    placeholder="Confirm password"
                                    autoComplete="new-password"
                                />
                                {formik.touched.password_confirmation && formik.errors.password_confirmation && (
                                    <FormHelperText error>{formik.errors.password_confirmation}</FormHelperText>
                                )}
                            </div>
                        </div>
                    </div>

                    <Typography variant="h6" className="pb-2 mb-8! mt-8!" sx={{
                        borderBottom: `1px solid ${theme.palette.textField.border}`
                    }}>Additional Information</Typography>

                    <div className="flex flex-col gap-4 lg:gap-6 md:grid md:grid-cols-3 mb-6">
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel htmlFor="dob">Date of Birth</InputLabel>
                                <MakuraDatePicker
                                    value={formik.values.dob ? dayjs(formik.values.dob) : null}
                                    onChange={(newValue) => {
                                        formik.setFieldValue("dob", newValue ? newValue.format('YYYY-MM-DD') : null);
                                    }}
                                    placeholder="Select date of birth"
                                    error={formik.touched.dob && Boolean(formik.errors.dob)}
                                />
                                {formik.touched.dob && formik.errors.dob && (
                                    <FormHelperText error>{formik.errors.dob}</FormHelperText>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel htmlFor="address">Permanent Address</InputLabel>
                                <OutlinedInput
                                    name="address"
                                    id="address"
                                    fullWidth
                                    placeholder="Enter permanent address"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.address && Boolean(formik.errors.address)}
                                />
                                {formik.touched.address && formik.errors.address && (
                                    <FormHelperText error>{formik.errors.address}</FormHelperText>
                                )}
                            </div>
                        </div>
                        <div className="col-span-1">
                            <div className="input__field">
                                <InputLabel htmlFor="temporary_address">Temporary Address</InputLabel>
                                <OutlinedInput
                                    name="temporary_address"
                                    id="temporary_address"
                                    fullWidth
                                    placeholder="Enter temporary address"
                                    value={formik.values.temporary_address ?? ""}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.temporary_address && Boolean(formik.errors.temporary_address)}
                                />
                                {formik.touched.temporary_address && formik.errors.temporary_address && (
                                    <FormHelperText error>{formik.errors.temporary_address}</FormHelperText>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Box
                    className="footer__action flex justify-end items-center gap-2 py-6 mt-8 sticky -bottom-5"
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
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        <Typography variant="body2">
                            {id ? (updating ? "Updating User" : "Update User") : (isLoading ? "Adding User" : "Add User")}
                        </Typography>
                    </Button>
                </Box>
            </form>

            <ConfirmationDialog
                title="Discard User Creation"
                description="Are you sure you want to discard this user creation? All unsaved changes will be lost permanently."
                open={openConfirm}
                setOpen={setOpenConfirm}
                onSave={handleConfirmCancel}
            />
        </>
    );
}