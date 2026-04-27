import { Dialog, DialogContent, DialogTitle, InputLabel, OutlinedInput, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateQuestionLabelMutation, useUpdateQuestionLabelMutation } from "../../../../services/questionApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { QuestionLabelFormProps, QuestionLabelProps } from "../../../../types/question";
import FooterAction from "../../../molecules/FooterAction";

interface Props {
    open: boolean;
    setOpen: (val: boolean) => void;
    editData?: QuestionLabelProps | null;
}

const schema = Yup.object().shape({
    name: Yup.string().trim().required("Label name is required"),
});

export default function QuestionLabelFormModal({ open, setOpen, editData }: Props) {
    const dispatch = useAppDispatch();
    const isEditMode = Boolean(editData?.id);
    const [createLabel, { isLoading: creating }] = useCreateQuestionLabelMutation();
    const [updateLabel, { isLoading: updating }] = useUpdateQuestionLabelMutation();
    const isLoading = creating || updating;

    const formik = useFormik<QuestionLabelFormProps>({
        initialValues: { name: editData?.name ?? "" },
        validationSchema: schema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                if (isEditMode && editData?.id) {
                    const res = await updateLabel({ id: editData.id, body: values }).unwrap();
                    dispatch(showToast({ message: res.message || "Label updated successfully.", severity: "success" }));
                } else {
                    const res = await createLabel({ body: values }).unwrap();
                    dispatch(showToast({ message: res.message || "Label created successfully.", severity: "success" }));
                }
                setOpen(false);
                formik.resetForm();
            } catch (e: any) {
                dispatch(showToast({ message: e?.data?.message || "Unable to handle the request.", severity: "error" }));
            }
        },
    });

    const handleClose = () => {
        setOpen(false);
        formik.resetForm();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditMode ? "Edit Set" : "Create Set"}</DialogTitle>
            <DialogContent>
                <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 pt-2">
                    <div className="input__field">
                        <InputLabel required>Set Name</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter set name"
                            error={formik.touched.name && Boolean(formik.errors.name)}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <Typography variant="caption" color="error">{formik.errors.name}</Typography>
                        )}
                    </div>
                    <FooterAction
                        handleConfirmationChange={handleClose}
                        isLoading={isLoading}
                        isEditMode={isEditMode}
                        isUpdating={isLoading}
                        replaceLabel={isEditMode
                            ? isLoading ? "Updating..." : "Update Set"
                            : isLoading ? "Creating..." : "Create Set"}
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
}
