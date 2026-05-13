import { Add } from "@mui/icons-material";
import { Box, Button, Collapse, Divider, Typography, useTheme } from "@mui/material";
import React from "react";
import type { ChapterProps, ChildLessonProps, LessonProps, SubjectProps, UnitProps } from "../../../types/course";
import { renderHtml } from "../../../utils/renderHtml";
import CustomCollapseIcon from "../../atoms/CustomCollapseIcon";
import ActionIconVisible from "../../molecules/Action/ActionIconVisible";
import MediaCard from "./MediaCard";
import type { CurriculumType } from "../../pages/CourseManagement/Course/createCourse/CourseSubFields/Curriculum";

interface CurriculumItemProps {
    item: SubjectProps | ChapterProps | UnitProps | LessonProps | ChildLessonProps;
    itemType: CurriculumType;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onAddChild?: () => void;
    addChildLabel?: string;
    backgroundColor?: string;
    children?: React.ReactNode;
}

export default function CurriculumItem({
    item,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    onAddChild,
    addChildLabel,
    backgroundColor = "white",
    children
}: CurriculumItemProps) {
    const theme = useTheme();
    return (
        <div
            className="curriculum__content py-5 px-6 rounded-2xl"
            style={{ backgroundColor }}
        >
            <div
                className="curriculum__header flex justify-between cursor-pointer"
                onClick={onToggle}
            >
                <div className="flex header_title gap-2 items-center">
                    <Typography variant="h6">{item.name}</Typography>
                    <CustomCollapseIcon isOpen={isExpanded} />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    <ActionIconVisible
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                </div>
            </div>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Divider className="mt-3! mb-6!" />
                <div className="curriculum__description general__content">
                    {renderHtml(item.description)}
                </div>

                {item.audio || item.note || item.video_url || item.test ? <div className="media__listing flex flex-col gap-4 md:gap-6 md:grid md:grid-cols-3 2xl:grid-cols-5 mt-4 lg:mt-6">
                    {item.audio ?
                        <div className="col-span-1">
                            <MediaCard media={item.audio} type="audios" />
                        </div>
                        : ""}
                    {item.note ? <div className="col-span-1">
                        <MediaCard media={item.note} type="notes" />
                    </div> : ""}
                    {item.video ? <div className="col-span-1">
                        <MediaCard media={item.video} type="videos" />
                    </div> : ""}
                    {item.test ? <div className="col-span-1">
                        <Box
                            className="p-3 rounded-md flex items-center gap-3 h-full"
                            sx={{ border: `1px solid ${theme.palette.textField.border}` }}
                        >
                            <Box
                                className="min-w-10 h-10 rounded-md flex items-center justify-center"
                                sx={{ background: theme.palette.primary.light, color: theme.palette.primary.main }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7 11H13" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7 16H9.62" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Box>
                            <div className="content min-w-0 flex-1">
                                <Typography variant="subtitle2" fontWeight={500} className="truncate" title={item.test.name}>
                                    {item.test.name}
                                </Typography>
                                <Typography variant="caption" color="text.middle" className="capitalize block truncate">
                                    {item.test.test_type} · {item.test.total_questions} Qs · {item.test.duration?.hours ?? 0}h {item.test.duration?.minutes ?? 0}m
                                </Typography>
                            </div>
                        </Box>
                    </div> : ""}

                </div> : ""}

                {onAddChild && addChildLabel && (
                    <Button
                        variant="contained"
                        className="black__btn my-6!"
                        startIcon={<Add />}
                        onClick={onAddChild}
                    >
                        {addChildLabel}
                    </Button>
                )}

                {children}
            </Collapse>
        </div>
    );
}