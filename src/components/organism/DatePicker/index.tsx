"use client";

import { Box, Button, MenuItem, Select, Typography, useTheme } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

interface DateRangePickerProps {
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    onStartDateChange: (date: Dayjs | null) => void;
    onEndDateChange: (date: Dayjs | null) => void;
    onApply: () => void;
    onReset: () => void;
}

export default function CustomDatePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onApply,
    onReset,
}: DateRangePickerProps) {
    const theme = useTheme();
    const [currentMonth, setCurrentMonth] = useState(dayjs().month());
    const [currentYear, setCurrentYear] = useState(dayjs().year());

    const handleDateClick = (date: Dayjs) => {
        if (!startDate || (startDate && endDate)) {
            // Start new selection
            onStartDateChange(date);
            onEndDateChange(null);
        } else if (startDate && !endDate) {
            // Complete the range
            if (date.isBefore(startDate)) {
                onStartDateChange(date);
                onEndDateChange(startDate);
            } else {
                onEndDateChange(date);
            }
        }
    };

    const isInRange = (date: Dayjs) => {
        if (!startDate || !endDate) return false;
        return date.isAfter(startDate) && date.isBefore(endDate);
    };

    const isSelected = (date: Dayjs) => {
        if (!startDate && !endDate) return false;
        return (
            date.isSame(startDate, "day") ||
            date.isSame(endDate, "day")
        );
    };

    const isToday = (date: Dayjs) => {
        return date.isSame(dayjs(), "day");
    };

    const generateCalendarDays = () => {
        const startOfMonth = dayjs()
            .year(currentYear)
            .month(currentMonth)
            .startOf("month");
        const endOfMonth = startOfMonth.endOf("month");
        const startDate = startOfMonth.startOf("week");
        const endDate = endOfMonth.endOf("week");

        const days = [];
        let day = startDate;

        while (day.isBefore(endDate) || day.isSame(endDate, "day")) {
            days.push(day);
            day = day.add(1, "day");
        }

        return days;
    };

    const days = generateCalendarDays();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
        <Box>
            <Box className="flex gap-2 mb-4">
                <Select
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(e.target.value as number)}
                    size="small"
                    sx={{
                        flex: 1,
                        backgroundColor: theme.palette.gray?.gray1,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.separator?.dark
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                        },
                        "& .MuiSvgIcon-root": {
                            color: theme.palette.text?.middle
                        },
                    }}
                >
                    {months.map((month, idx) => (
                        <MenuItem key={month} value={idx}>
                            {month}
                        </MenuItem>
                    ))}
                </Select>
                <Select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value as number)}
                    size="small"
                    sx={{
                        flex: 1,
                        backgroundColor: theme.palette.gray?.gray1,
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.separator?.dark
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                        },
                        "& .MuiSvgIcon-root": {
                            color: theme.palette.text?.middle
                        },
                    }}
                >
                    {years.map((year) => (
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
            <Box className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <Typography
                        key={day}
                        className="text-center text-[10px]! py-1"
                        sx={{ color: theme.palette.text?.middle }}
                    >
                        {day}
                    </Typography>
                ))}
            </Box>

            {/* Calendar Days */}
            <Box className="grid grid-cols-7 gap-1 mb-4">
                {days.map((day, idx) => {
                    const selected = isSelected(day);
                    const inRange = isInRange(day);
                    const today = isToday(day);

                    return (
                        <Box
                            key={idx}
                            onClick={() => handleDateClick(day)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 36,
                                aspectRatio: 1 / 1,
                                cursor: "pointer",
                                fontSize: "14px",
                                borderRadius: "50%",
                                fontWeight: today || selected ? 600 : 400,
                                color: theme.palette.primary.contrastText,
                                backgroundColor: selected || inRange
                                    ? theme.palette.primary.main
                                    : today
                                        ? theme.palette.primary.light
                                        : "transparent",
                                border: today && !selected
                                    ? `1px solid ${theme.palette.primary.main}`
                                    : "none",
                                "&:hover": {
                                    backgroundColor: selected || inRange
                                        ? theme.palette.primary.hover
                                        : theme.palette.button?.light,
                                },
                                // Selected/InRange text should be white
                                ...(selected || inRange) && {
                                    color: theme.palette.primary.white,
                                },
                                // Today but not selected should have primary color text
                                ...(today && !selected) && {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            {day.date()}
                        </Box>
                    );
                })}
            </Box>

            {/* Action Buttons */}
            <Box className="flex justify-end gap-2">
                <Button
                    fullWidth
                    color="primary"
                    size="small"
                    onClick={onReset}
                    variant="outlined"
                    sx={{
                        color: theme.palette.text?.middle,
                        borderColor: theme.palette.separator?.dark,
                        "&:hover": {
                            borderColor: theme.palette.separator?.darker,
                            backgroundColor: theme.palette.gray?.gray1,
                        },
                    }}
                >
                    Reset
                </Button>
                <Button
                    fullWidth
                    color="primary"
                    size="small"
                    variant="contained"
                    onClick={onApply}
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.white,
                        "&:hover": {
                            backgroundColor: theme.palette.primary.hover,
                        },
                    }}
                >
                    Apply
                </Button>
            </Box>
        </Box>
    );
}