import { Box, Skeleton } from "@mui/material";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAddCourseMediaByTypeMutation, useGetCourseMediaPlaylistQuery } from "../../../../../services/courseApi";
import { showToast } from "../../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../../store/hook";
import SelectFromMedia from "../../../../molecules/MediaFileDragDrop/SelectFromMedia";
import TablePagination from "../../../../molecules/Table/Pagination";
import PlaylistCard from "../../../../organism/Cards/PlaylistCard";
import EmptyRoute from "../../../../organism/EmptyRoute";
import PageHeader from "../../../../organism/PageHeader";
import TableFilter from "../../../../organism/TableFilter";

export type MediaType = "audios" | "notes" | "videos";

interface MediaConfig {
    title: string;
    description: string;
    emptyTitle: string;
    emptyMessage: string;
    buttonLabel?: string;
    variant: "success" | "error" | "warning";
    icon: React.ReactNode;
}

const mediaConfigs: Record<MediaType, MediaConfig> = {
    audios: {
        title: "Audios",
        description: "Add audios for this course so that you can manage the audio you wanted deeply.",
        emptyTitle: "No Audio found",
        emptyMessage: "Oops your audio is empty. Please add audio to help student gain knowledge.",

        variant: "success",
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.8935 18.5605C11.9068 18.5605 11.1201 19.3605 11.1201 20.3472C11.1201 21.3339 11.9201 22.1205 12.8935 22.1205C13.8801 22.1205 14.6801 21.3205 14.6801 20.3472C14.6801 19.3605 13.8801 18.5605 12.8935 18.5605Z" fill="#1BB830" />
                <path d="M21.5868 2.66602H10.4134C5.56008 2.66602 2.66675 5.55935 2.66675 10.4127V21.5727C2.66675 26.4393 5.56008 29.3327 10.4134 29.3327H21.5734C26.4268 29.3327 29.3201 26.4393 29.3201 21.586V10.4127C29.3334 5.55935 26.4401 2.66602 21.5868 2.66602ZM22.8267 13.066C22.8267 13.8793 22.4801 14.5993 21.8934 15.026C21.5201 15.2927 21.0667 15.4393 20.5867 15.4393C20.3067 15.4393 20.0267 15.386 19.7334 15.2927L16.6801 14.2793C16.6667 14.2793 16.6401 14.266 16.6267 14.2527V20.3327C16.6267 22.386 14.9467 24.066 12.8934 24.066C10.8401 24.066 9.16008 22.386 9.16008 20.3327C9.16008 18.2793 10.8401 16.5993 12.8934 16.5993C13.5467 16.5993 14.1467 16.786 14.6801 17.066V11.506V10.6927C14.6801 9.87935 15.0267 9.15935 15.6134 8.73268C16.2134 8.30602 17.0001 8.19935 17.7734 8.46602L20.8267 9.47935C21.9734 9.86602 22.8401 11.066 22.8401 12.266V13.066H22.8267Z" fill="#1BB830" />
            </svg>
        )
    },
    notes: {
        title: "Notes",
        description: "Add notes for this course so that you can manage the notes you wanted deeply.",
        emptyTitle: "No Notes found",
        emptyMessage: "Oops your notes is empty. Please add notes to help student gain knowledge.",
        buttonLabel: "Add Notes",
        variant: "warning",
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.3333 2.66699H10.6667C6 2.66699 4 5.33366 4 9.33366V22.667C4 26.667 6 29.3337 10.6667 29.3337H21.3333C26 29.3337 28 26.667 28 22.667V9.33366C28 5.33366 26 2.66699 21.3333 2.66699ZM10.6667 16.3337H16C16.5467 16.3337 17 16.787 17 17.3337C17 17.8803 16.5467 18.3337 16 18.3337H10.6667C10.12 18.3337 9.66667 17.8803 9.66667 17.3337C9.66667 16.787 10.12 16.3337 10.6667 16.3337ZM21.3333 23.667H10.6667C10.12 23.667 9.66667 23.2137 9.66667 22.667C9.66667 22.1203 10.12 21.667 10.6667 21.667H21.3333C21.88 21.667 22.3333 22.1203 22.3333 22.667C22.3333 23.2137 21.88 23.667 21.3333 23.667ZM24.6667 12.3337H22C19.9733 12.3337 18.3333 10.6937 18.3333 8.66699V6.00033C18.3333 5.45366 18.7867 5.00033 19.3333 5.00033C19.88 5.00033 20.3333 5.45366 20.3333 6.00033V8.66699C20.3333 9.58699 21.08 10.3337 22 10.3337H24.6667C25.2133 10.3337 25.6667 10.787 25.6667 11.3337C25.6667 11.8803 25.2133 12.3337 24.6667 12.3337Z" fill="#F97415" />
            </svg>
        )
    },
    videos: {
        title: "Videos",
        description: "Add videos for this course so that you can manage the videos you wanted deeply.",
        emptyTitle: "No Videos found",
        emptyMessage: "Oops your video is empty. Please add video to help student gain knowledge.",
        variant: "error",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 8L16 12L22 16V8Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H14C15.1046 18 16 17.1046 16 16V8C16 6.89543 15.1046 6 14 6Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        )
    }
};

interface Props {
    type?: MediaType;
    allowMultiple?: boolean;
}

export default function CourseMedia({ type: typeProp }: Props) {
    const { id, type: typeParam } = useParams<{ id?: string; type?: string }>();
    const type = (typeProp || typeParam) as MediaType;
    const dispatch = useAppDispatch();
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 10,
    })
    const [open, setOpen] = React.useState(false);
    const config = mediaConfigs[type];

    const handleMediaAddition = () => {
        setOpen((prev) => !prev);
    };

    const { data, isLoading } = useGetCourseMediaPlaylistQuery({ type, id: id ? Number(id) : null, qp }, { skip: !id || !type });
    const [addMediaToCourse] = useAddCourseMediaByTypeMutation();

    const handleMediaAssign = async (ids: number[]) => {
        if (!ids.length) {
            return dispatch(
                showToast({
                    message: `Please select at least one ${type}`,
                    severity: "error",
                })
            );
        }
        try {
            const response = await addMediaToCourse({ id: id || null, type, body: ids }).unwrap();
            dispatch(
                showToast({
                    message: response?.message || `Successfully assigned ${type}`,
                    severity: "success"
                })
            )
        }
        catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || `Unable to assign ${type}`,
                    severity: "error"
                })
            )
        }
    }

    const playlists = data?.data?.data || [];

    return (
        <div className="media__root">
            <PageHeader
                breadcrumb={[
                    {
                        title: config.title,
                    }
                ]}
                description={config.description}
            // cta={config.buttonLabel ? {
            //     label: config.buttonLabel,
            //     url: ""
            // } : undefined}
            // handleOpenPopup={config.buttonLabel ? handleMediaAddition : undefined}
            />
            <TableFilter
                search=""
                setSearch={() => { }}
                selectedRows={new Set()}
                handleRoleDelete={() => { }}
            />
            {!isLoading && !playlists?.length && <EmptyRoute
                title={config.emptyTitle}
                message={config.emptyMessage}
                cta={config.buttonLabel ? {
                    label: config.buttonLabel,
                    url: ""
                } : undefined}
                variant={config.variant}
                icon={config.icon}
                handleClick={config.buttonLabel ? handleMediaAddition : undefined}
            />}
            <div className="flex flex-col gap-6 md:grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {isLoading ? (
                    [...Array(6)].map((_, idx) => (
                        <div key={idx} className="col-span-1">
                            <Box className="w-full">
                                <Skeleton variant="rectangular" height={220} className="rounded-md" />
                            </Box>
                        </div>
                    ))
                ) :
                    (playlists.map((playlist) => (
                        <PlaylistCard
                            key={playlist.chapter_id}
                            data={playlist}
                            courseId={id ? Number(id) : undefined}
                            type={type}
                        />
                    )))}
            </div>
            <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={data?.data?.pagination?.total_pages || 0}
            />
            <SelectFromMedia open={open} setOpen={setOpen} type={type} onSelect={(ids) => handleMediaAssign(ids)} />
        </div>
    );
}