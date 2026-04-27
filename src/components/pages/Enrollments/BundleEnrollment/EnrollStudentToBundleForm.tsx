import { Box, Button, Checkbox, Dialog, DialogContent, Divider, IconButton, InputLabel, OutlinedInput, Typography, useTheme } from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import SearchIcon from "../../../../icons/SearchIcon";
import { useEnrollStudentToBundleMutation } from "../../../../services/questionApi";
import { useGetAllUserQuery } from "../../../../services/userApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { RegisterUserProps } from "../../../../types/user";
import CustomTable from "../../../molecules/Table";
import TablePagination from "../../../molecules/Table/Pagination";

interface Props {
    open: boolean;
    setOpen: (newValue: boolean) => void;
    id: number;
}

const validationSchema = Yup.object({
    student_id: Yup.number().min(1, "Please select a student").required("Please select a student"),
});

export default function EnrollStudentToBundleForm({ open, setOpen, id }: Props) {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const [search, setSearch] = useState("");
    const [debounceSearch, setDebounceSearch] = useState("");
    const [qp, setQp] = useState({ pageIndex: 1, pageSize: 10 });

    useEffect(() => {
        const timer = setTimeout(() => setDebounceSearch(search), 1000);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useGetAllUserQuery({ ...qp, search: debounceSearch, });

    const handleClose = () => {
        formik.resetForm();
        setOpen(false);
    };

    const [enrollStudent, { isLoading: enrollingStudent }] = useEnrollStudentToBundleMutation();

    const formik = useFormik({
        initialValues: { id: null, student_id: null },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const response = await enrollStudent({
                    id: Number(id),
                    user_id: Number(values.student_id),
                }).unwrap();
                dispatch(showToast({
                    message: response?.message || "Enrolled Student Successfully",
                    severity: "success",
                }));
                formik.resetForm();
                handleClose();
            } catch (e: any) {
                dispatch(showToast({
                    message: e?.data?.message || "Unable to enroll student.",
                    severity: "error",
                }));
            }
        },
    });

    const handleSelectRow = (userId: number) => {
        formik.setFieldValue("student_id", Number(userId));
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
            cell: ({ row }) => <Typography fontWeight={500} className="capitalize">{row.original.name}</Typography>,
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

    return (
        <Dialog open={open} onClose={handleClose} sx={{ "& .MuiPaper-root": { minWidth: { md: "664px", xl: "1041px" } } }}>
            <DialogContent className="flex flex-col gap-6 pb-0!" sx={{ background: theme.palette.primary.contrastText }}>
                <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
                    <div className="header">
                        <div className="flex items-center justify-between">
                            <Typography variant="h5">Enroll Student to Bundle</Typography>
                            <IconButton onClick={handleClose}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.492 1.66675H6.50866C3.47533 1.66675 1.66699 3.47508 1.66699 6.50841V13.4834C1.66699 16.5251 3.47533 18.3334 6.50866 18.3334H13.4837C16.517 18.3334 18.3253 16.5251 18.3253 13.4917V6.50841C18.3337 3.47508 16.5253 1.66675 13.492 1.66675ZM12.8003 11.9167C13.042 12.1584 13.042 12.5584 12.8003 12.8001C12.6753 12.9251 12.517 12.9834 12.3587 12.9834C12.2003 12.9834 12.042 12.9251 11.917 12.8001L10.0003 10.8834L8.08366 12.8001C7.95866 12.9251 7.80033 12.9834 7.64199 12.9834C7.48366 12.9834 7.32533 12.9251 7.20033 12.8001C6.95866 12.5584 6.95866 12.1584 7.20033 11.9167L9.11699 10.0001L7.20033 8.08341C6.95866 7.84175 6.95866 7.44175 7.20033 7.20008C7.44199 6.95842 7.84199 6.95842 8.08366 7.20008L10.0003 9.11675L11.917 7.20008C12.1587 6.95842 12.5587 6.95842 12.8003 7.20008C13.042 7.44175 13.042 7.84175 12.8003 8.08341L10.8837 10.0001L12.8003 11.9167Z" fill="#E21D48" />
                                </svg>
                            </IconButton>
                        </div>
                        <Divider />
                    </div>

                    <div>
                        <InputLabel className="required mb-2">Select Student</InputLabel>
                        <OutlinedInput
                            fullWidth
                            startAdornment={<SearchIcon />}
                            placeholder="Search student / email / phone no."
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

                    <div className="h-full overflow-auto">
                        <CustomTable columns={columns} loading={isLoading} data={data?.data?.data || []} />
                    </div>
                    <TablePagination qp={qp} setQp={setQp} totalPages={data?.data?.pagination?.total_pages || 0} />
                    <Divider />

                    <Box className="flex justify-end gap-4 py-6 sticky bottom-0 left-0 right-0" bgcolor={theme.palette.primary.contrastText}>
                        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                        <Button variant="contained" type="submit" disabled={enrollingStudent}>
                            {enrollingStudent ? "Enrolling..." : "Enroll Now"}
                        </Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
