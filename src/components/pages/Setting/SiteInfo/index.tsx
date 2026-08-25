import { Button, Divider, InputLabel, OutlinedInput, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useGetThemeSettingsQuery, useUpdateThemeSettingMutation } from "../../../../services/settingApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { ThemeSettingFormProps } from "../../../../types/setting";
import { YesNoSwitch } from "../../../atoms/YesNoSwitch";
import FileDragDrop from "../../../molecules/FileDragDrop";

export default function SiteInfoRoot() {
    const dispatch = useAppDispatch();

    const { data } = useGetThemeSettingsQuery();
    const [updateTheme, { isLoading }] = useUpdateThemeSettingMutation();

    const formik = useFormik<ThemeSettingFormProps>({
        initialValues: {
            company_name: data?.data?.company_name || "",
            brand_name: data?.data?.brand_name || "",
            tagline: data?.data?.tagline || "",
            meta_description: data?.data?.meta_description || "",
            tpin: data?.data?.tpin || "",
            vat_percentage: data?.data?.vat_percentage ?? 13,
            vat_inclusive: Boolean(data?.data?.vat_inclusive),
            logo_url: data?.data?.logo_url || "",
            logo_dark_url: data?.data?.logo_dark_url || "",
            favicon_url: data?.data?.favicon_url || "",
            logo: null,
            logo_dark: null,
            favicon: null,
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            const fd = new FormData();
            fd.append("company_name", values.company_name);
            fd.append("brand_name", values.brand_name);
            fd.append("tagline", values.tagline);
            fd.append("meta_description", values.meta_description);
            fd.append("tpin", values.tpin ?? "");
            fd.append("vat_percentage", String(values.vat_percentage ?? 0));
            fd.append("vat_inclusive", values.vat_inclusive ? "1" : "0");
            if (values.logo) fd.append("logo", values.logo);
            else if (values.logo_url) fd.append("logo_url", values.logo_url);
            if (values.logo_dark) fd.append("logo_dark", values.logo_dark);
            else if (values.logo_dark_url) fd.append("logo_dark_url", values.logo_dark_url);
            if (values.favicon) fd.append("favicon", values.favicon);
            else if (values.favicon_url) fd.append("favicon_url", values.favicon_url);

            try {
                const response = await updateTheme(fd).unwrap();
                dispatch(showToast({ message: response?.message || "Site info updated successfully", severity: "success" }));
            } catch (e: any) {
                dispatch(showToast({ message: e?.data?.message || "Unable to update site info", severity: "error" }));
            }
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="app__settings__page__root pb-4 lg:pb-6">
            <Typography variant="h5">Site Info</Typography>
            <Divider className="mt-4! mb-6!" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel>Company Name</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="company_name"
                        value={formik.values.company_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. Makura Academy"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        Used in email signatures and footers
                    </Typography>
                </div>

                <div>
                    <InputLabel>Brand Name</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="brand_name"
                        value={formik.values.brand_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. Makura"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        Shown on auth pages and in the app header
                    </Typography>
                </div>

                <div>
                    <InputLabel>Tagline</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="tagline"
                        value={formik.values.tagline}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. Learn smarter, grow faster"
                    />
                </div>

                <div>
                    <InputLabel>TPIN / VAT No.</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="tpin"
                        value={formik.values.tpin}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. 610143957"
                    />
                    <Typography variant="caption" color="text.middle">
                        Printed on the tax invoice masthead. Leave blank to omit the line.
                    </Typography>
                </div>

                <div>
                    <InputLabel>VAT Rate (%)</InputLabel>
                    <OutlinedInput
                        fullWidth
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 0.5 }}
                        name="vat_percentage"
                        value={formik.values.vat_percentage}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="13"
                    />
                    <Typography variant="caption" color="text.middle">
                        Applied to new sales. Set to 0 to stop charging VAT — invoices already
                        issued keep the rate they recorded.
                    </Typography>
                </div>

                <div>
                    <InputLabel>Prices Include VAT</InputLabel>
                    <div className="flex items-center gap-3">
                        <YesNoSwitch
                            name="vat_inclusive"
                            checked={Boolean(formik.values.vat_inclusive)}
                            onChange={(e) =>
                                formik.setFieldValue("vat_inclusive", e.target.checked)
                            }
                        />
                        <Typography variant="body2">
                            {formik.values.vat_inclusive ? "Inclusive" : "Exclusive"}
                        </Typography>
                    </div>
                    <Typography variant="caption" color="text.middle">
                        {formik.values.vat_inclusive
                            ? "The listed price is the total — VAT is shown as the share already within it, and the customer pays exactly the listed price."
                            : "VAT is added on top of the listed price, so the customer pays more than the price shown."}
                    </Typography>
                </div>

                <div className="md:col-span-2">
                    <InputLabel>Meta Description</InputLabel>
                    <OutlinedInput
                        fullWidth
                        multiline
                        minRows={3}
                        name="meta_description"
                        value={formik.values.meta_description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Short description used by search engines (150–160 characters recommended)"
                    />
                </div>

                <FileDragDrop
                    label="Logo (Light Mode)"
                    initialPreview={formik.values.logo_url}
                    helperText="Shown on light backgrounds — PNG recommended"
                    maxSize={5}
                    onFileChange={(f) => {
                        formik.setFieldValue("logo", f);
                        if (!f) formik.setFieldValue("logo_url", "");
                    }}
                />

                <FileDragDrop
                    label="Logo (Dark Mode)"
                    initialPreview={formik.values.logo_dark_url}
                    helperText="Shown on dark backgrounds — PNG recommended"
                    maxSize={5}
                    onFileChange={(f) => {
                        formik.setFieldValue("logo_dark", f);
                        if (!f) formik.setFieldValue("logo_dark_url", "");
                    }}
                />

                <FileDragDrop
                    label="Favicon"
                    initialPreview={formik.values.favicon_url}
                    helperText="32×32 or 64×64 px — ICO or PNG"
                    maxSize={2}
                    onFileChange={(f) => {
                        formik.setFieldValue("favicon", f);
                        if (!f) formik.setFieldValue("favicon_url", "");
                    }}
                />
            </div>

            <Divider className="mt-6! mb-6!" />
            <div className="text-right">
                <Button type="submit" variant="contained" disabled={isLoading}>
                    {data?.data ? (isLoading ? "Updating..." : "Update Site Info") : "Save Site Info"}
                </Button>
            </div>
        </form>
    );
}
