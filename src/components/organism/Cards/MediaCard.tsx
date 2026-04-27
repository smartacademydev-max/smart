import { Box, Divider, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { DocumentUpload, Eye, TickCircle } from 'iconsax-reactjs';
import { useUseChangeMediaStatusMutation } from '../../../services/mediaApi';
import { openPreviewPdf } from '../../../slice/previewPdfSlice';
import { showToast } from '../../../slice/toastSlice';
import { useAppDispatch } from '../../../store/hook';
import type { courseTabType } from '../../../types/course';
import type { MediaProps } from '../../../types/media';
import { formatFileSize } from '../../../utils/convertToMb';


const mediaUiConfig: any = {
    audios: {
        variant: "success",
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.8935 18.5605C11.9068 18.5605 11.1201 19.3605 11.1201 20.3472C11.1201 21.3339 11.9201 22.1205 12.8935 22.1205C13.8801 22.1205 14.6801 21.3205 14.6801 20.3472C14.6801 19.3605 13.8801 18.5605 12.8935 18.5605Z" fill="#1BB830" />
                <path d="M21.5868 2.66602H10.4134C5.56008 2.66602 2.66675 5.55935 2.66675 10.4127V21.5727C2.66675 26.4393 5.56008 29.3327 10.4134 29.3327H21.5734C26.4268 29.3327 29.3201 26.4393 29.3201 21.586V10.4127C29.3334 5.55935 26.4401 2.66602 21.5868 2.66602ZM22.8267 13.066C22.8267 13.8793 22.4801 14.5993 21.8934 15.026C21.5201 15.2927 21.0667 15.4393 20.5867 15.4393C20.3067 15.4393 20.0267 15.386 19.7334 15.2927L16.6801 14.2793C16.6667 14.2793 16.6401 14.266 16.6267 14.2527V20.3327C16.6267 22.386 14.9467 24.066 12.8934 24.066C10.8401 24.066 9.16008 22.386 9.16008 20.3327C9.16008 18.2793 10.8401 16.5993 12.8934 16.5993C13.5467 16.5993 14.1467 16.786 14.6801 17.066V11.506V10.6927C14.6801 9.87935 15.0267 9.15935 15.6134 8.73268C16.2134 8.30602 17.0001 8.19935 17.7734 8.46602L20.8267 9.47935C21.9734 9.86602 22.8401 11.066 22.8401 12.266V13.066H22.8267Z" fill="#1BB830" />
            </svg>
        )
    },
    notes: {
        variant: "warning",
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.3333 2.66699H10.6667C6 2.66699 4 5.33366 4 9.33366V22.667C4 26.667 6 29.3337 10.6667 29.3337H21.3333C26 29.3337 28 26.667 28 22.667V9.33366C28 5.33366 26 2.66699 21.3333 2.66699ZM10.6667 16.3337H16C16.5467 16.3337 17 16.787 17 17.3337C17 17.8803 16.5467 18.3337 16 18.3337H10.6667C10.12 18.3337 9.66667 17.8803 9.66667 17.3337C9.66667 16.787 10.12 16.3337 10.6667 16.3337ZM21.3333 23.667H10.6667C10.12 23.667 9.66667 23.2137 9.66667 22.667C9.66667 22.1203 10.12 21.667 10.6667 21.667H21.3333C21.88 21.667 22.3333 22.1203 22.3333 22.667C22.3333 23.2137 21.88 23.667 21.3333 23.667ZM24.6667 12.3337H22C19.9733 12.3337 18.3333 10.6937 18.3333 8.66699V6.00033C18.3333 5.45366 18.7867 5.00033 19.3333 5.00033C19.88 5.00033 20.3333 5.45366 20.3333 6.00033V8.66699C20.3333 9.58699 21.08 10.3337 22 10.3337H24.6667C25.2133 10.3337 25.6667 10.787 25.6667 11.3337C25.6667 11.8803 25.2133 12.3337 24.6667 12.3337Z" fill="#F97415" />
            </svg>
        )
    },
    videos: {
        variant: "error",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 8L16 12L22 16V8Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H14C15.1046 18 16 17.1046 16 16V8C16 6.89543 15.1046 6 14 6Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        )
    }
}
export default function MediaCard({ media, type }: { media: MediaProps; type?: courseTabType }) {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const [changeStatus] = useUseChangeMediaStatusMutation();

    const config = mediaUiConfig[type || "notes"];

    let bgColor = theme.palette.warning.light;

    switch (config.variant) {
        case "error":
            bgColor = theme.palette.error.main;
            break;
        case "success":
            bgColor = theme.palette.success.light;
            break;
        case "warning":
            bgColor = theme.palette.warning.light;
            break;
        default:
            bgColor = theme.palette.info.light;
    }


    const handleMediaStatusChange = async () => {
        try {
            const response = await changeStatus({
                media_ids: [Number(media.id)]
            }).unwrap();

            dispatch(
                showToast({
                    message: response.message || "Media Availabe For Download Successfully",
                    severity: "success"
                })
            )
        }
        catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to mark media for Download",
                    severity: "error"
                })
            )
        }
    }

    return (
        <Box sx={{ border: `1px solid ${theme.palette.textField.border}` }} className="p-3 rounded-md flex items-center gap-3 w-full">
            <Box
                className="min-w-12.5 h-12.5 rounded-md flex items-center justify-center"
                sx={{ background: bgColor }}
            >
                {config.icon}
            </Box>

            <div className="content w-full">
                <div className="flex justify-between items-start gap-2">
                    <Typography variant='subtitle2' fontWeight={500} className='line-clamp-2 wrap-anywhere'>
                        {media.file_name}
                    </Typography>
                    {type === "notes" ? <div className="flex justify-end items-center gap-2">
                        <IconButton className='p-0! max-w-fit!' onClick={() =>
                            dispatch(
                                openPreviewPdf({
                                    mediaUrl: media.url,
                                    mediaName: media.file_name,
                                    mediaId: media.id
                                })
                            )
                        } >
                            <Eye size={16} />
                        </IconButton>
                        <IconButton className='p-0! max-w-fit!' color='success' onClick={() => { handleMediaStatusChange() }}>
                            <Tooltip title="Change PDF Download Status">
                                {media.is_downloadable ? <TickCircle size={16} variant='Bold' /> : <DocumentUpload size={16} variant='Bold' />}
                            </Tooltip>
                        </IconButton>
                    </div> : ""}
                </div>
                <Divider className='my-1.5!' />
                <Typography color='text.middle' className='text-[12px]!'>
                    {formatFileSize(media.size)}
                </Typography>
            </div>
        </Box>
    );
}
