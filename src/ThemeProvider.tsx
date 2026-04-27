import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetThemeSettingsQuery } from './services/settingApi';
import { ThemeMode } from './slice/themeSlice';
import { useAppSelector } from './store/hook';
import type { RootState } from './store/store';
import { createAppTheme } from './theme';

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();
    const { i18n: lang, mode } = useAppSelector(
        (state: RootState) => state.theme
    );

    const { data: themeSettings } = useGetThemeSettingsQuery();
    const branding = themeSettings?.data;

    // Create theme based on current mode
    const theme = React.useMemo(() => {
        const themeMode =
            mode === ThemeMode.AUTO
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
                : mode;
        return createAppTheme(themeMode as "light" | "dark");
    }, [mode]);

    // Whenever Redux language changes, update i18next too
    React.useEffect(() => {
        i18n.changeLanguage(lang);
    }, [lang, i18n]);

    // Handle AUTO mode - listen to system preference changes
    React.useEffect(() => {
        if (mode === ThemeMode.AUTO) {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => {
                window.dispatchEvent(new Event("theme-change"));
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [mode]);

    // Apply dynamic meta title, description, and favicon from theme settings
    React.useEffect(() => {
        if (branding?.company_name) {
            document.title = branding.tagline
                ? `${branding.company_name} — ${branding.tagline}`
                : branding.company_name;
        }
    }, [branding?.company_name, branding?.tagline]);

    React.useEffect(() => {
        if (!branding?.meta_description) return;
        let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute("name", "description");
            document.head.appendChild(tag);
        }
        tag.setAttribute("content", branding.meta_description);
    }, [branding?.meta_description]);

    React.useEffect(() => {
        if (!branding?.favicon_url) return;
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!link) {
            link = document.createElement("link");
            link.setAttribute("rel", "icon");
            document.head.appendChild(link);
        }
        link.setAttribute("href", branding.favicon_url);
    }, [branding?.favicon_url]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}
