import type { ThemeOptions } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { darkPalette } from "./palette/darkPalette";
import { lightPalette } from "./palette/lightPalette";

declare module "@mui/material/styles" {
    interface Palette {
        button: {
            main: string;
            gray: string;
            hover: string;
            light: string;
            lightest: string;
            contrastText: string;
        };
        gray: {
            main: string;
            gray1: string;
            gray2: string;
            gray3: string;
        };
        icon: {
            main: string;
            black: string;
            dark: string;
            light: string;
        };
        separator: {
            main: string;
            dark: string;
            darker: string;
            darkest: string;
        };
        tab: {
            main: string;
            background: string;
            backgroundHover: string;
            border: string;
            text: string;
            textHover: string;
        };
        textField: {
            main: string;
            border: string;
            error: string;
            placeholder: string;
            name: string;
        };
    }
    interface PaletteOptions {
        button?: {
            main?: string;
            gray?: string;
            hover?: string;
            light?: string;
            lightest?: string;
            contrastText?: string;
        };
        gray?: {
            main?: string;
            gray1?: string;
            gray2?: string;
            gray3?: string;
        };
        icon?: {
            main?: string;
            black?: string;
            dark?: string;
            light?: string;
        };
        separator?: {
            main?: string;
            dark?: string;
            darker?: string;
            darkest?: string;
        };
        tab?: {
            main?: string;
            background?: string;
            backgroundHover?: string;
            border?: string;
            text?: string;
            textHover?: string;
        };
        textField?: {
            main?: string;
            border?: string;
            error?: string;
            placeholder?: string;
            name?: string;
        };
    }

    interface TypeBackground {
        sidebar: string;
    }
    interface PaletteColor {
        hover?: string;
        black?: string;
        white?: string;
    }
    interface SimplePaletteColorOptions {
        hover?: string;
        light?: string;
        black?: string;
        white?: string;
    }
    interface TypeText {
        main: string;
        dark: string;
        light: string;
        lightest: string;
        middle: string;
    }
}

// Common theme options
const commonThemeOptions: ThemeOptions = {
    typography: {
        fontFamily: '"Helvetica Neue", sans-serif',

        h1: {
            fontSize: "48px",
            lineHeight: 1.4,
            "@media (max-width:1600px)": { fontSize: "42px" },
            "@media (max-width:1440px)": { fontSize: "38px" },
            "@media (max-width:1280px)": { fontSize: "34px" },
            "@media (max-width:1200px)": { fontSize: "30px" },
            "@media (max-width:900px)": { fontSize: "26px" },
            "@media (max-width:600px)": { fontSize: "22px" },
        },
        h2: {
            fontSize: "36px",
            lineHeight: 1.38,
            "@media (max-width:1600px)": { fontSize: "32px" },
            "@media (max-width:1440px)": { fontSize: "28px" },
            "@media (max-width:1280px)": { fontSize: "26px" },
            "@media (max-width:1200px)": { fontSize: "24px" },
            "@media (max-width:900px)": { fontSize: "22px" },
            "@media (max-width:600px)": { fontSize: "20px" },
        },
        h3: {
            fontSize: "28px",
            lineHeight: 1.4,
            "@media (max-width:1600px)": { fontSize: "26px" },
            "@media (max-width:1440px)": { fontSize: "24px" },
            "@media (max-width:1280px)": { fontSize: "22px" },
            "@media (max-width:1200px)": { fontSize: "20px" },
            "@media (max-width:900px)": { fontSize: "18px" },
            "@media (max-width:600px)": { fontSize: "16px" },
        },
        h4: {
            fontSize: "24px",
            lineHeight: 1.42,
            "@media (max-width:1600px)": { fontSize: "22px" },
            "@media (max-width:1440px)": { fontSize: "20px" },
            "@media (max-width:1280px)": { fontSize: "18px" },
            "@media (max-width:1200px)": { fontSize: "17px" },
            "@media (max-width:900px)": { fontSize: "16px" },
            "@media (max-width:600px)": { fontSize: "15px" },
        },
        h5: {
            fontSize: "20px",
            lineHeight: 1.5,
            "@media (max-width:1600px)": { fontSize: "18px" },
            "@media (max-width:1440px)": { fontSize: "17px" },
            "@media (max-width:1280px)": { fontSize: "16px" },
            "@media (max-width:1200px)": { fontSize: "15px" },
            "@media (max-width:900px)": { fontSize: "14px" },
            "@media (max-width:600px)": { fontSize: "14px" },
        },
        h6: {
            fontSize: "16px",
            lineHeight: 1.5,
            "@media (max-width:1600px)": { fontSize: "15px" },
            "@media (max-width:1440px)": { fontSize: "14px" },
            "@media (max-width:1280px)": { fontSize: "14px" },
            "@media (max-width:1200px)": { fontSize: "13px" },
            "@media (max-width:900px)": { fontSize: "13px" },
            "@media (max-width:600px)": { fontSize: "12px" },
        },
        body1: {
            fontSize: "16px",
            lineHeight: 1.5,
            "@media (max-width:1600px)": { fontSize: "15px" },
            "@media (max-width:1440px)": { fontSize: "14px" },
            "@media (max-width:1280px)": { fontSize: "14px" },
            "@media (max-width:1200px)": { fontSize: "13px" },
            "@media (max-width:900px)": { fontSize: "13px" },
            "@media (max-width:600px)": { fontSize: "12px" },
        },
        body2: {
            fontSize: "14px",
            lineHeight: 1.5,
            "@media (max-width:1440px)": { fontSize: "13px" },
            "@media (max-width:1200px)": { fontSize: "12px" },
            "@media (max-width:900px)": { fontSize: "12px" },
            "@media (max-width:600px)": { fontSize: "11px" },
        },
        subtitle1: {
            fontSize: "14px",
            lineHeight: 1.5,
            "@media (max-width:1440px)": { fontSize: "13px" },
            "@media (max-width:1200px)": { fontSize: "12px" },
            "@media (max-width:900px)": { fontSize: "12px" },
            "@media (max-width:600px)": { fontSize: "11px" },
        },
        subtitle2: {
            fontSize: "13px",
            lineHeight: 1.4,
            "@media (max-width:1440px)": { fontSize: "12px" },
            "@media (max-width:1200px)": { fontSize: "12px" },
            "@media (max-width:900px)": { fontSize: "11px" },
            "@media (max-width:600px)": { fontSize: "11px" },
        },
        caption: {
            fontSize: "12px",
            lineHeight: 1.4,
            "@media (max-width:1440px)": { fontSize: "11px" },
            "@media (max-width:1200px)": { fontSize: "11px" },
            "@media (max-width:900px)": { fontSize: "10px" },
            "@media (max-width:600px)": { fontSize: "10px" },
        },
        overline: {
            fontSize: "10px",
            lineHeight: 1.4,
            "@media (max-width:1200px)": { fontSize: "10px" },
            "@media (max-width:900px)": { fontSize: "9px" },
            "@media (max-width:600px)": { fontSize: "9px" },
        },
    },

    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: (theme) => ({
                ".general__content__box": {
                    '& h1': {
                        ...theme.typography.h2,
                        fontWeight: 700,
                        margin: '1.5rem 0 1rem 0',
                    },
                    '& h2': {
                        ...theme.typography.h3,
                        fontWeight: 700,
                        margin: '1.5rem 0 1rem 0',
                    },
                    '& h3': {
                        ...theme.typography.h4,
                        fontWeight: 600,
                        margin: '1.25rem 0 0.75rem 0',
                    },
                    '& h4': {
                        ...theme.typography.h5,
                        fontWeight: 600,
                        margin: '1rem 0 0.5rem 0',
                    },
                    '& p': {
                        ...theme.typography.subtitle1,
                        margin: '0.75rem 0',
                    },
                    '& ul': {
                        paddingLeft: '1.5rem',
                        margin: '0.75rem 0',
                        '& li': {
                            ...theme.typography.subtitle1,
                            margin: '0.25rem 0',
                        },
                    },
                    '& ol': {
                        paddingLeft: '1.5rem',
                        margin: '0.75rem 0',
                        '& li': {
                            ...theme.typography.subtitle1,
                            margin: '0.25rem 0',
                        },
                    },
                    '& strong': {
                        fontWeight: 700,
                    },
                    '& a': {
                        color: theme.palette.primary.main,
                        textDecoration: 'underline',
                        '&:hover': {
                            textDecoration: 'none',
                        },
                    },
                    '& blockquote': {
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        padding: '0.75rem',
                        margin: '1rem 0',
                        fontStyle: 'italic',
                        backgroundColor: theme.palette.action.hover,
                        borderRadius: "8px"
                    },
                    '& img': {
                        maxWidth: {
                            xs: '100%',
                            md: "50%"
                        },
                        height: 'auto',
                    },
                    '& table': {
                        width: '100%',
                        borderCollapse: 'collapse',
                        margin: '1rem 0',
                        '& th, & td': {
                            border: `1px solid ${theme.palette.divider}`,
                            padding: '0.5rem',
                            textAlign: 'left',
                        },
                    },
                    '& hr': {
                        border: 'none',
                        borderTop: `1px solid ${theme.palette.divider}`,
                        margin: '2rem 0',
                    },
                },
                ".styled__list": {
                    "ul": {
                        ">li": {
                            listStyleType: "disc"
                        }
                    }, "ol": {
                        ">li": {
                            listStyleType: "decimal"
                        }
                    }
                },
                ".subscription__description": {
                    "ul": {
                        display: "flex",
                        gap: "16px",
                        "li": {
                            ...theme.typography.subtitle2,
                            color: theme.palette.text.dark,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",

                            /* Custom SVG Bullet */
                            "&::before": {
                                content: '""',
                                display: "inline-block",
                                width: "14px",
                                height: "14px",
                                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                                    `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.99984 1.16699C3.78567 1.16699 1.1665 3.78616 1.1665 7.00033C1.1665 10.2145 3.78567 12.8337 6.99984 12.8337C10.214 12.8337 12.8332 10.2145 12.8332 7.00033C12.8332 3.78616 10.214 1.16699 6.99984 1.16699ZM9.78817 5.65866L6.48067 8.96616C6.399 9.04783 6.28817 9.09449 6.1715 9.09449C6.05484 9.09449 5.944 9.04783 5.86234 8.96616L4.2115 7.31533C4.04234 7.14616 4.04234 6.86616 4.2115 6.69699C4.38067 6.52783 4.66067 6.52783 4.82984 6.69699L6.1715 8.03866L9.16984 5.04033C9.339 4.87116 9.61901 4.87116 9.78817 5.04033C9.95734 5.20949 9.95734 5.48366 9.78817 5.65866Z" fill="#1D82F5"/>
</svg>
`
                                )}")`,
                                backgroundSize: "14px 14px",
                            }
                        }
                    },
                    "p": {
                        marginBottom: "8px",
                        ...theme.typography.subtitle2,
                    }
                },
                ".live__class__form": {
                    ".MuiFormControlLabel-label": {
                        color: `${theme.palette.textField.name} !important`
                    }
                }
            })
        },
        MuiStack: {
            styleOverrides: {
                root: {
                    flexDirection: "row",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 8,
                    padding: "10px 16px",
                    boxShadow: "none",
                    textTransform: "none",
                    fontWeight: 400,
                    "&.black__btn": {
                        backgroundColor: theme.palette.primary.black,
                        color: theme.palette.primary.white,
                        "&:hover": {
                            backgroundColor: theme.palette.primary.hover,
                        },
                    }
                }),
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    "&.activate:hover svg path": {
                        fill: theme.palette.success.dark,
                    },
                    "&.active__layout": {
                        background: theme.palette.icon.black,
                        "svg path": {
                            fill: theme.palette.primary.contrastText
                        }
                    }
                }),
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: ({ theme }) => ({
                    ...theme.typography.subtitle2,
                    color: theme.palette.textField.name,
                    marginBottom: "4px",
                    fontWeight: 400,
                    lineHeight: "1.5",

                    [theme.breakpoints.down("lg")]: {
                        fontSize: "12px",
                    },

                    "&.Mui-focused": {
                        fontSize: "16px",
                    },

                    "&.MuiInputLabel-shrink": {
                        fontSize: "12px",
                    },

                    "&.required::after": {
                        content: '"*"',
                        display: "inline-block",
                        color: theme.palette.error.main,
                        marginLeft: "4px",
                    },
                }),
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    ...theme.typography.subtitle1,
                    padding: "14px 16px",
                    borderRadius: "8px",
                    fontWeight: "400",
                }),
                input: {
                    padding: "2px",
                    fontSize: "16px",
                    height: "unset"
                },
                notchedOutline: ({ theme }) => ({
                    borderColor: theme.palette.textField.border,
                }),
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    ".MuiSelect-select": {
                        maxHeight: "24px"
                    }
                }
            }
        },
        MuiList: {
            styleOverrides: {
                root: {
                    padding: 0,
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: ({ theme }) => ({
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "stretch",
                    padding: 0,

                    "&.menu__item:not(.action__item) *": {
                        color: theme.palette.text.light,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    },

                    "&.menu__item.action__item": {
                        "& .MuiListItemButton-root": {
                            transition: "all 0.2s ease-in-out",
                            padding: "8px 12px",
                            borderRadius: "4px"
                        },

                        ".MuiListItemText, .MuiListItemText ": {
                            color: theme.palette.text.light,
                        },

                        "&:hover": {
                            ".MuiListItemButton-root": {
                                color: theme.palette.primary.main,
                                backgroundColor: theme.palette.primary.light,

                                "svg path": {
                                    stroke: theme.palette.primary.main,
                                },
                                ".MuiListItemText, .MuiListItemText *": {
                                    color: theme.palette.primary.main,
                                    fill: theme.palette.primary.main,
                                },
                            },
                        },

                        "&.delete__item": {
                            "&:hover": {
                                ".MuiListItemButton-root": {
                                    color: theme.palette.primary.contrastText,
                                    backgroundColor: theme.palette.error.main,

                                    "svg path": {
                                        stroke: theme.palette.primary.contrastText,
                                    },
                                    ".MuiListItemText, .MuiListItemText *": {
                                        color: theme.palette.primary.contrastText,
                                        fill: theme.palette.primary.contrastText,
                                    },
                                },
                            },
                        },
                        "&.suspend__item": {
                            "&:hover": {
                                ".MuiListItemButton-root": {
                                    color: theme.palette.primary.contrastText,
                                    backgroundColor: theme.palette.warning.main,

                                    "svg path": {
                                        stroke: theme.palette.primary.contrastText,
                                    },
                                    ".MuiListItemText, .MuiListItemText *": {
                                        color: theme.palette.primary.contrastText,
                                        fill: theme.palette.primary.contrastText,
                                    },
                                },
                            },
                        },
                        "&.view__item": {
                            "&:hover": {
                                ".MuiListItemButton-root": {
                                    color: theme.palette.primary.contrastText,
                                    backgroundColor: theme.palette.info.main,

                                    "svg path": {
                                        stroke: theme.palette.primary.contrastText,
                                    },
                                    ".MuiListItemText, .MuiListItemText *": {
                                        color: theme.palette.primary.contrastText,
                                        fill: theme.palette.primary.contrastText,
                                    },
                                },
                            },
                        },
                    },

                    "&.active__tab__controller": {
                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                        ".MuiTypography-root": {
                            color: theme.palette.primary.main,
                            // fontWeight: 600,
                        }
                    },

                    "&.sub__menu": {
                        "&  .MuiListItemButton-root": {
                            transition: "all 0.2s ease-in-out",
                            borderRadius: "4px",

                            "&.active": {
                                background: theme.palette.separator.dark,
                                ".MuiTypography-root": {
                                    color: `${theme.palette.text.dark} !important`
                                }
                            }
                        },

                        "& .sub__menu": {
                            paddingLeft: "16px",
                            "&  .MuiListItemButton-root": {
                                ".MuiTypography-root": {
                                    color: `${theme.palette.text.middle} !important`
                                },
                                "&.active": {
                                    background: "transparent",
                                    ".MuiTypography-root": {
                                        color: `${theme.palette.text.dark} !important`
                                    }
                                }
                            },
                        }

                    }
                }),
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: () => ({
                    padding: "16px",
                    marginBottom: "4px",
                    borderBottom: `1px solid #4B4B4B`,
                    gap: "16px",
                    "&.active *": {
                        color: "#fff !important",

                        "svg path": {
                            stroke: "#fff"
                        }
                    },
                    "&.active-nested": {
                        "& *": {
                            color: "#fff !important",
                        },
                        "& svg path": {
                            stroke: "#fff !important"
                        }
                    }
                }),
            },
        },
        MuiListItemText: {
            styleOverrides: {
                root: () => ({
                    margin: 0
                }),
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: ({ theme }) => ({
                    "&.MuiTypography-body1": {
                        ...theme.typography.subtitle1,
                    },
                }),
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: "unset",
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderColor: `${theme.palette.separator.dark}`,
                }),
            },
        },
        MuiCheckbox: {
            defaultProps: {
                size: 'small',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.66654 1.33398C2.82559 1.33398 1.33321 2.82637 1.33321 4.66732V11.334C1.33321 13.1749 2.82559 14.6673 4.66654 14.6673H11.3332C13.1742 14.6673 14.6665 13.1749 14.6665 11.334V4.66732C14.6665 2.82637 13.1742 1.33398 11.3332 1.33398H4.66654ZM4.99987 2.33398C3.52711 2.33398 2.33321 3.52789 2.33321 5.00065V11.0006C2.33321 12.4734 3.52711 13.6673 4.99987 13.6673H10.9999C12.4726 13.6673 13.6665 12.4734 13.6665 11.0006V5.00065C13.6665 3.52789 12.4726 2.33398 10.9999 2.33398H4.99987Z"
                            fill="#9CA3B0"
                        />
                    </svg>
                ),
                checkedIcon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1.33" y="1.33" width="13.34" height="13.34" rx="3.33" fill="currentColor" />
                        <path
                            d="M11.5 5.5L6.75 10.25L4.5 8"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ),
            },
            styleOverrides: {
                root: {
                    padding: '0',
                    '&:hover': {
                        backgroundColor: 'transparent',
                    },
                    '& .MuiSvgIcon-root': {
                        fontSize: '1.25rem',
                    },
                },
            },
        },
        MuiFormControlLabel: {
            styleOverrides: {
                root: ({ theme }) => ({
                    margin: 0,
                    gap: "10px",
                    alignItems: "flex-start",
                    '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        lineHeight: 1.57,
                        color: theme.palette.text.middle
                    },
                }),
            },
        },
        MuiPaginationItem: {
            styleOverrides: {
                root: ({ theme }) => ({
                    ...theme.typography.subtitle2,
                    border: `1px solid ${theme.palette.separator.dark}`,
                    borderRadius: '4px',
                    background: theme.palette.primary.contrastText,
                    minWidth: 34,
                    height: 34,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    "&.Mui-selected": {
                        background: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText
                    }
                })
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: ({ theme }) => ({
                    backgroundColor: theme.palette.primary.black,
                    color: theme.palette.primary.contrastText,
                    fontSize: "16px",
                    padding: "8px 14px",
                    borderRadius: "4px",
                }),
                arrow: ({ theme }) => ({
                    color: theme.palette.common.black,
                }),
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                // popper: {
                //     "& .MuiAutocomplete-paper": {
                //         padding: "8px 12px",
                //         borderRadius: "8px",
                //     },
                // },
                option: ({ theme }) => ({
                    ...theme.typography.body1,
                    padding: "8px 12px",
                    color: theme.palette.text.primary,
                    '&[aria-selected="true"]': {
                        backgroundColor: theme.palette.action.selected,
                    },
                    '&[data-focus="true"]': {
                        backgroundColor: theme.palette.action.hover,
                    },
                }),
            },
        },
    },

};

export const createAppTheme = (mode: "light" | "dark") => {
    return createTheme({
        ...commonThemeOptions,
        palette: {
            mode,
            ...(mode === "light" ? lightPalette : darkPalette),
        },
    });
};

