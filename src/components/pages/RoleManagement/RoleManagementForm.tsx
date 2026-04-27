import {
    Box,
    Button,
    Checkbox,
    FormHelperText,
    InputLabel,
    OutlinedInput,
    Typography,
    useTheme,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { PATH } from "../../../routes/PATH";
import {
    useCreateNewRoleMutation,
    useEditRoleMutation,
    useGetAllPermissionsQuery,
    useGetRoleByIdQuery,
} from "../../../services/roleAndPermissionApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import type { PermissionProps } from "../../../types/roleAndPermission";
import CustomTable from "../../molecules/Table";
import ConfirmationDialog from "../../organism/ConfirmationDialog";

const validationSchema = Yup.object({
    name: Yup.string().required("Role name is required"),
});

export default function RoleManagementForm() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const { id } = useParams();

    const [openConfirm, setOpenConfirm] = React.useState<boolean>(false);
    const { data, isLoading } = useGetAllPermissionsQuery();
    const [createRole, { isLoading: creatingRole }] = useCreateNewRoleMutation();
    const { data: role, isLoading: loadingRole } = useGetRoleByIdQuery({ id: id || "" }, {
        skip: !id,
    });
    const [updateRole, { isLoading: updating }] = useEditRoleMutation();

    const formik = useFormik<{
        name: string;
        permissions: PermissionProps[];
    }>({
        initialValues: {
            name: "",
            permissions: [],
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            if (id) {
                try {
                    const response = await updateRole({ body: values, id: id }).unwrap();
                    dispatch(
                        showToast({
                            message: response?.message || "Role Updated Successfully",
                            severity: "success",
                        })
                    );
                    navigate(PATH.ROLES.ROOT);
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
            else {
                try {
                    const response = await createRole(values).unwrap();
                    dispatch(
                        showToast({
                            message: response.message || "Role Created Successfully",
                            severity: "success",
                        })
                    );
                    navigate(PATH.ROLES.ROOT);
                } catch (e: any) {
                    dispatch(
                        showToast({
                            message: e.data.message || "Something went wrong",
                            severity: "error",
                        })
                    );
                }
            }
        },
    });

    // ✅ Use useEffect instead of useMemo to set formik values
    useEffect(() => {
        if (data?.data) {
            const permissions = data.data.map((perm: PermissionProps) => {
                const matched = role?.data?.permissions?.find(
                    (r: PermissionProps) => r.module === perm.module
                );
                return {
                    ...perm,
                    add: matched?.add ?? false,
                    view: matched?.view ?? false,
                    edit: matched?.edit ?? false,
                    delete: matched?.delete ?? false,
                    download: matched?.download ?? false,
                };
            });

            formik.setValues({
                name: role?.data?.name || "",
                permissions,
            }, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, role]);

    const handlePermissionToggle = useCallback(
        (
            rowIndex: number,
            field: keyof Pick<PermissionProps, "add" | "view" | "edit" | "delete" | "download">
        ) => {
            const updatedPermissions: PermissionProps[] = [...formik.values.permissions];
            if (updatedPermissions[rowIndex] && field in updatedPermissions[rowIndex]) {
                updatedPermissions[rowIndex] = {
                    ...updatedPermissions[rowIndex],
                    [field]: !updatedPermissions[rowIndex][field]
                };
                formik.setFieldValue("permissions", updatedPermissions);
            }
        },
        [formik]
    );

    const handleRowToggle = useCallback((rowIndex: number) => {
        const updatedPermissions = [...formik.values.permissions];
        const row = updatedPermissions[rowIndex];

        if (!row) return;

        const allSelected = row.add && row.view && row.edit && row.delete;

        updatedPermissions[rowIndex] = {
            ...row,
            add: !allSelected,
            view: !allSelected,
            edit: !allSelected,
            delete: !allSelected,
            download: !allSelected,
        };

        formik.setFieldValue("permissions", updatedPermissions);
    }, [formik]);

    const columns = useMemo<ColumnDef<PermissionProps>[]>(
        () => [
            {
                header: "Module",
                accessorKey: "module",
                cell: (info) => {
                    const row = info.row.original;

                    const allChecked =
                        row.add && row.view && row.edit && row.delete;

                    return (
                        <Box className="flex items-center gap-2">
                            <Checkbox
                                checked={allChecked}
                                indeterminate={
                                    !allChecked &&
                                    (row.add || row.view || row.edit || row.delete)
                                }
                                onChange={() => handleRowToggle(info.row.index)}
                            />
                            <Typography fontWeight={500} className="capitalize">
                                {info.getValue() as string}
                            </Typography>
                        </Box>
                    );
                },
            },
            {
                header: "Add",
                accessorKey: "add",
                cell: (info) => (
                    <Checkbox
                        checked={(info.getValue() as boolean) || false}
                        color="primary"
                        onChange={() =>
                            handlePermissionToggle(info.row.index, "add")
                        }
                    />
                ),
            },
            {
                header: "View",
                accessorKey: "view",
                cell: (info) => (
                    <Checkbox
                        checked={(info.getValue() as boolean) || false}
                        color="primary"
                        onChange={() =>
                            handlePermissionToggle(info.row.index, "view")
                        }
                    />
                ),
            },
            {
                header: "Edit",
                accessorKey: "edit",
                cell: (info) => (
                    <Checkbox
                        checked={(info.getValue() as boolean) || false}
                        color="primary"
                        onChange={() =>
                            handlePermissionToggle(info.row.index, "edit")
                        }
                    />
                ),
            },
            {
                header: "Delete",
                accessorKey: "delete",
                cell: (info) => (
                    <Checkbox
                        checked={(info.getValue() as boolean) || false}
                        color="primary"
                        onChange={() =>
                            handlePermissionToggle(info.row.index, "delete")
                        }
                    />
                ),
            },
            {
                header: "Download",
                accessorKey: "download",
                cell: (info) => (
                    <Checkbox
                        checked={(info.getValue() as boolean) || false}
                        color="primary"
                        onChange={() =>
                            handlePermissionToggle(info.row.index, "download")
                        }
                    />
                ),
            },
        ],
        [handlePermissionToggle]
    );

    const handleConfirmationChange = () => {
        setOpenConfirm((prev) => !prev)
    }

    return (
        <>
            <form onSubmit={formik.handleSubmit} className="h-full flex flex-col justify-between">
                <div className="grid grid-cols-2">
                    <div className="col-span-2 md:col-span-1">
                        <div className="input__field mb-6">
                            <InputLabel htmlFor="name">Name of the role</InputLabel>
                            <OutlinedInput
                                fullWidth
                                id="name"
                                name="name"
                                placeholder="Enter the name of the role"
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
                        <Typography variant="h5" className="mb-4!">
                            Permission
                        </Typography>
                    </div>
                </div>
                <div className="top h-full overflow-auto">
                    <CustomTable columns={columns} data={formik.values.permissions || []} loading={isLoading || loadingRole} />
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
                        onClick={handleConfirmationChange}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={creatingRole || updating}
                    >
                        <Typography variant="body2">
                            {id ? (updating ? "Updating" : "Update") : (creatingRole ? "Adding" : "Add")} Role & Permission
                        </Typography>
                    </Button>
                </Box>
            </form>
            <ConfirmationDialog
                title="Cancel Role"
                description="All the recent changes will be lost completely. Are you sure."
                open={openConfirm}
                setOpen={handleConfirmationChange}
                onSave={() => { navigate(PATH.ROLES.ROOT) }}
            />
        </>
    );
}