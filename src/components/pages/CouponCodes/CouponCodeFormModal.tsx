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
import { useCreateCouponCodeMutation, useUpdateCouponCodeMutation } from "../../../services/referralApi";
import { showToast } from "../../../slice/toastSlice";
import { useAppDispatch } from "../../../store/hook";
import { COUPON_DISCOUNT_TYPE_LABELS, type CouponCodeFormProps, type CouponCodeProps, type CouponDiscountType } from "../../../types/referral";

const DISCOUNT_TYPE_OPTIONS = Object.entries(COUPON_DISCOUNT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const schema = Yup.object({
    code: Yup.string().trim().required("Coupon code is required"),
    discount_type: Yup.string().required("Discount type is required"),
    discount_value: Yup.number().min(0).required("Discount value is required"),
    min_order_value: Yup.number().min(0).nullable(),
    max_discount: Yup.number().min(0).nullable(),
    expiry_date: Yup.string().nullable(),
    usage_limit: Yup.number().min(0).nullable(),
    is_active: Yup.boolean(),
});

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    editData?: CouponCodeProps | null;
}

export default function CouponCodeFormModal({ open, setOpen, editData }: Props) {
    const dispatch = useAppDispatch();
    const isEdit = Boolean(editData?.id);
    const [create, { isLoading: creating }] = useCreateCouponCodeMutation();
    const [update, { isLoading: updating }] = useUpdateCouponCodeMutation();
    const isLoading = creating || updating;

    const formik = useFormik<CouponCodeFormProps>({
        initialValues: {
            code: editData?.code ?? "",
            discount_type: (editData?.discount_type ?? "percentage") as CouponDiscountType,
            discount_value: editData?.discount_value ?? 0,
            min_order_value: editData?.min_order_value ?? undefined,
            max_discount: editData?.max_discount ?? undefined,
            expiry_date: editData?.expiry_date ? editData.expiry_date.slice(0, 10) : "",
            usage_limit: editData?.usage_limit ?? undefined,
            is_active: editData?.is_active ?? true,
        },
        validationSchema: schema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const payload: CouponCodeFormProps = {
                ...values,
                min_order_value: values.min_order_value || undefined,
                max_discount: values.max_discount || undefined,
                expiry_date: values.expiry_date || undefined,
                usage_limit: values.usage_limit || undefined,
            };
            try {
                if (isEdit && editData?.id) {
                    const res = await update({ id: editData.id, body: payload }).unwrap();
                    dispatch(showToast({ message: res.message || "Coupon updated.", severity: "success" }));
                } else {
                    const res = await create({ body: payload }).unwrap();
                    dispatch(showToast({ message: res.message || "Coupon created.", severity: "success" }));
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
            <DialogTitle>{isEdit ? "Edit Coupon Code" : "Create Coupon Code"}</DialogTitle>
            <DialogContent>
                <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 pt-2">
                    <div className="input__field">
                        <InputLabel className="required">Coupon Code</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="code"
                            value={formik.values.code}
                            onChange={(e) => formik.setFieldValue("code", e.target.value.toUpperCase())}
                            onBlur={formik.handleBlur}
                            placeholder="e.g. SAVE20"
                            error={formik.touched.code && Boolean(formik.errors.code)}
                        />
                        {formik.touched.code && formik.errors.code && (
                            <Typography variant="caption" color="error">{formik.errors.code}</Typography>
                        )}
                    </div>

                    <div className="input__field">
                        <InputLabel className="required">Discount Type</InputLabel>
                        <Select
                            fullWidth
                            name="discount_type"
                            value={formik.values.discount_type}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            input={<OutlinedInput />}
                        >
                            {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                    </div>

                    <div className="input__field">
                        <InputLabel className="required">
                            Discount Value {formik.values.discount_type === "percentage" ? "(%)" : "(Rs.)"}
                        </InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="discount_value"
                            type="number"
                            value={formik.values.discount_value}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            inputProps={{ min: 0, ...(formik.values.discount_type === "percentage" ? { max: 100 } : {}) }}
                            error={formik.touched.discount_value && Boolean(formik.errors.discount_value)}
                        />
                        {formik.touched.discount_value && formik.errors.discount_value && (
                            <Typography variant="caption" color="error">{formik.errors.discount_value as string}</Typography>
                        )}
                    </div>

                    <div className="input__field">
                        <InputLabel>Min. Order Value (Rs.)</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="min_order_value"
                            type="number"
                            value={formik.values.min_order_value ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Optional"
                            inputProps={{ min: 0 }}
                        />
                    </div>

                    {formik.values.discount_type === "percentage" && (
                        <div className="input__field">
                            <InputLabel>Max. Discount (Rs.)</InputLabel>
                            <OutlinedInput
                                fullWidth
                                name="max_discount"
                                type="number"
                                value={formik.values.max_discount ?? ""}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Optional cap"
                                inputProps={{ min: 0 }}
                            />
                        </div>
                    )}

                    <div className="input__field">
                        <InputLabel>Expiry Date</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="expiry_date"
                            type="date"
                            value={formik.values.expiry_date ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </div>

                    <div className="input__field">
                        <InputLabel>Usage Limit</InputLabel>
                        <OutlinedInput
                            fullWidth
                            name="usage_limit"
                            type="number"
                            value={formik.values.usage_limit ?? ""}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Leave blank for unlimited"
                            inputProps={{ min: 1 }}
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
                    {isLoading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Coupon" : "Create Coupon")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
