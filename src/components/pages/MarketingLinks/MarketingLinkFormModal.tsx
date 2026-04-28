import {
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle,
    FormControlLabel,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Switch,
    Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateMarketingLinkMutation, useUpdateMarketingLinkMutation } from "../../../services/referralApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { MARKETING_LINK_SOURCE_LABELS, type MarketingLinkFormProps, type MarketingLinkProps, type MarketingLinkSource } from "../../../types/referral";

const SOURCE_OPTIONS = Object.entries(MARKETING_LINK_SOURCE_LABELS).map(([value, label]) => ({ value, label }));

const schema = Yup.object({
    name: Yup.string().trim().required("Campaign name is required"),
    source: Yup.string().required("Source is required"),
    description: Yup.string(),
    is_active: Yup.boolean(),
});

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    editData?: MarketingLinkProps | null;
}

export default function MarketingLinkFormModal({ open, setOpen, editData }: Props) {
    const dispatch = useAppDispatch();
    const isEdit = Boolean(editData?.id);
    const [create, { isLoading: creating }] = useCreateMarketingLinkMutation();
    const [update, { isLoading: updating }] = useUpdateMarketingLinkMutation();
    const isLoading = creating || updating;

    const formik = useFormik<MarketingLinkFormProps>({
        initialValues: {
            name: editData?.name ?? "",
            source: (editData?.source ?? "google_ads") as MarketingLinkSource,
            description: editData?.description ?? "",
            is_active: editData?.is_active ?? true,
        },
        validationSchema: schema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                if (isEdit && editData?.id) {
                    const res = await update({ id: editData.id, body: values }).unwrap();
                    dispatch(showToast({ message: res.message || "Link updated.", severity: "success" }));
                } else {
                    const res = await create({ body: values }).unwrap();
                    dispatch(showToast({ message: res.message || "Link created.", severity: "success" }));
                }
                setOpen(false);
                formik.resetForm();
            } catch (e: any) {
                dispatch(showToast({ message: e?.data?.message || "Unable to save.", severity: "error" }));
            }
        },
    });

    const handleClose = () => { setOpen(false); formik.resetForm(); };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEdit ? "Edit Marketing Link" : "Create Marketing Link"}</DialogTitle>
            <DialogContent>
                <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 pt-2">
                    <div className="input__field">
                        <InputLabel className="required">Campaign Name</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="e.g. Google Summer 2025"
                            error={formik.touched.name && Boolean(formik.errors.name)}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <Typography variant="caption" color="error">{formik.errors.name}</Typography>
                        )}
                    </div>

                    <div className="input__field">
                        <InputLabel className="required">Source / Platform</InputLabel>
                        <Select
                            fullWidth
                            name="source"
                            value={formik.values.source}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            input={<OutlinedInput />}
                            error={formik.touched.source && Boolean(formik.errors.source)}
                        >
                            {SOURCE_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                    </div>

                    <div className="input__field">
                        <InputLabel>Description</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Optional notes about this campaign"
                            multiline
                            minRows={2}
                        />
                    </div>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formik.values.is_active}
                                onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Active"
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
                <Button variant="contained" onClick={() => formik.handleSubmit()} disabled={isLoading}>
                    {isLoading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Link" : "Create Link")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
