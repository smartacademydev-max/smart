import { Box, Stack, Typography } from "@mui/material";
import { Video } from "iconsax-reactjs";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../routes/PATH";
import type { PlaylistProps } from "../../../types/course";
import type { MediaType } from "../../pages/CourseManagement/Course/createCourse/CourseMedia";

export default function PlaylistCard({ data, courseId, type }: { data: PlaylistProps; courseId?: number, type: MediaType }) {
    const navigate = useNavigate();
    return (
        <Box className="relative cursor-pointer mt-4! z-10" onClick={() => navigate(PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.PLAYLIST.VIEW_PLAYLIST.ROOT(courseId, type, Number(data.chapter_id)))}>
            <Box className="layer__01 absolute left-1/2 -translate-x-1/2 -top-1.5 -z-1" sx={{
                width: "calc(100% - 12px)",
                height: "8px",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                background: (theme) => theme.palette.separator.darker
            }} />
            <Box className="layer__02 absolute left-1/2 -translate-x-1/2 -top-3 -z-2" sx={{
                width: "calc(100% - 32px)",
                height: "8px",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                background: (theme) => theme.palette.separator.dark
            }} />
            <Box className="aspect-120/70 relative flex flex-col gap-4 justify-center items-center text-center rounded-md mb-1.5 overflow-hidden" sx={{
                background: (theme) => theme.palette.separator.dark,
                color: (theme) => theme.palette.primary.contrastText,
            }}>
                <img
                    src="/fallback.png"
                    alt={data?.chapter_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e0e0e0" width="100" height="100"/%3E%3C/svg%3E';
                    }}
                />
                <Stack className="items-center gap-1 absolute bottom-4 right-4 rounded-lg py-2 px-4" sx={(theme) => ({
                    background:
                        theme.palette.mode === "light"
                            ? "rgba(0,0,0,0.9)"
                            : "rgba(255,255,255,0.9)",
                })}>
                    <Video size={16} />
                    <Typography variant="subtitle2" className="capitalize">{data?.count} {type}</Typography>
                </Stack>
            </Box>
            <Typography variant="h6" className="line-clamp-3" fontWeight={600}>{data?.chapter_name}</Typography>
        </Box>
    )
}