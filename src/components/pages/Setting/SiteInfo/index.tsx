import { Button, Divider, InputLabel, OutlinedInput, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useGetThemeSettingsQuery, useUpdateThemeSettingMutation } from "../../../../services/settingApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { ThemeSettingFormProps } from "../../../../types/setting";
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
