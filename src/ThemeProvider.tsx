import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useBrandSettings } from './hooks/useBrandSettings';
import { ThemeMode } from './slice/themeSlice';
import { useAppSelector } from './store/hook';
import type { RootState } from './store/store';
import { createAppTheme } from './theme';

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation();
    const { i18n: lang, mode } = useAppSelector(
        (state: RootState) => state.theme
    );

    const { brandName, companyName, tagline, metaDescription, favIconUrl } = useBrandSettings();


    const theme = React.useMemo(() => {
        const themeMode =
            mode === ThemeMode.AUTO
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
                : mode;
        return createAppTheme(themeMode as "light" | "dark");
    }, [mode]);

    React.useEffect(() => {
        i18n.changeLanguage(lang);
    }, [lang, i18n]);

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

    React.useEffect(() => {
        if (companyName) {
            document.title = tagline
                ? `${brandName} — ${tagline}`
                : brandName;
        }
    }, [brandName, tagline]);

    React.useEffect(() => {
        if (!metaDescription) return;
        let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute("name", "description");
            document.head.appendChild(tag);
        }
        tag.setAttribute("content", metaDescription);
    }, [metaDescription]);

    React.useEffect(() => {
        if (!favIconUrl) return;
        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!link) {
            link = document.createElement("link");
            link.setAttribute("rel", "icon");
            document.head.appendChild(link);
        }
        link.setAttribute("href", favIconUrl);
    }, [favIconUrl]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}
