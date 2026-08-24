import { useGetThemeSettingsQuery } from "../services/settingApi";

export function useBrandSettings() {
    const { data, isLoading } = useGetThemeSettingsQuery();
    const brand = data?.data ?? null;

    return {
        brand,
        isLoading,
        brandName: brand?.brand_name ?? "",
        companyName: brand?.company_name ?? "",
        metaDescription: brand?.meta_description ?? "",
        tagline: brand?.tagline ?? "",
        tpin: brand?.tpin ?? "",
        logoUrl: brand?.logo_url ?? "",
        logoDarkUrl: brand?.logo_dark_url ?? "",
        favIconUrl: brand?.favicon_url ?? "",
    };
}
