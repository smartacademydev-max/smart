import {
    Button,
    ClickAwayListener,
    Grow,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Popper,
    Typography,
    useTheme,
} from "@mui/material";
import { ArrowDown2 } from "iconsax-reactjs";
import { useRef, useState } from "react";

export interface FilterDropdownOption<T extends string = string> {
    label: string;
    value: T;
}

interface FilterDropdownProps<T extends string> {
    /** Default label shown when nothing is selected (e.g. "All actions"). */
    label: string;
    /** Optional leading icon. Defaults to a chevron. */
    icon?: React.ReactNode;
    /** Currently selected value, or empty string for the "All" state. */
    value: T | "";
    /** List of options. The "All" reset option is added automatically. */
    options: FilterDropdownOption<T>[];
    /** Fires with the new value, or "" when the user picks "All". */
    onChange: (value: T | "") => void;
    /** Label for the reset row. Defaults to the `label` prop. */
    allLabel?: string;
    /** Width of the popper menu. */
    minMenuWidth?: number;
}

export default function FilterDropdown<T extends string>({
    label,
    icon,
    value,
    options,
    onChange,
    allLabel,
    minMenuWidth = 180,
}: FilterDropdownProps<T>) {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement | null>(null);

    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return;
        }
        setOpen(false);
    };

    const selectedLabel = value
        ? options.find((o) => o.value === value)?.label ?? label
        : label;

    return (
        <>
            <Button
                ref={anchorRef}
                startIcon={icon ?? <ArrowDown2 size={16} color={theme.palette.text.dark} />}
                sx={{
                    border: `1px solid ${theme.palette.separator.dark}`,
                    "& .MuiButton-startIcon": {
                        mr: { xs: 0 },
                    },
                }}
                className="py-2.5! px-3.5! rounded-md! text-center justify-center! gap-2! items-center!"
                onClick={() => setOpen((prev) => !prev)}
            >
                <Typography variant="subtitle2" color="text.dark" className="hidden! md:flex! text-nowrap">
                    {selectedLabel}
                </Typography>
            </Button>

            <Popper
                open={open}
                anchorEl={anchorRef.current}
                transition
                placement="bottom-end"
                disablePortal
                sx={{ zIndex: 10 }}
            >
                {({ TransitionProps }) => (
                    <Grow {...TransitionProps}>
                        <Paper elevation={3}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <List className="p-2!" sx={{ minWidth: minMenuWidth }}>
                                    {options.map((opt) => (
                                        <ListItem key={opt.value} className="menu__item action__item">
                                            <ListItemButton
                                                selected={value === opt.value}
                                                sx={{ m: 0, border: "none" }}
                                                onClick={() => {
                                                    setOpen(false);
                                                    onChange(opt.value);
                                                }}
                                            >
                                                <ListItemText primary={opt.label} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                    <ListItem className="menu__item action__item delete__item">
                                        <ListItemButton
                                            sx={{ m: 0, border: "none" }}
                                            onClick={() => {
                                                setOpen(false);
                                                onChange("");
                                            }}
                                        >
                                            <ListItemText primary={allLabel ?? label} />
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}
