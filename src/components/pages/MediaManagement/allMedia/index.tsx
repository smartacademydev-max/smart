import { Checkbox, Divider } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteMediaMutation, useGetallMediaQuery, useUseChangeMediaStatusMutation } from '../../../../services/mediaApi';
import { showToast } from '../../../../slice/toastSlice';
import { useAppDispatch } from '../../../../store/hook';
import type { courseTabType } from '../../../../types/course';
import type { MediaProps } from '../../../../types/media';
import MediaFileDragDrop from '../../../molecules/MediaFileDragDrop';
import TabController from '../../../molecules/TabController';
import TablePagination from '../../../molecules/Table/Pagination';
import MediaCard from '../../../organism/Cards/MediaCard';
import ConfirmationDialog from '../../../organism/ConfirmationDialog';
import EmptyRoute from '../../../organism/EmptyRoute';
import PageHeader from '../../../organism/PageHeader';
import TableFilter from '../../../organism/TableFilter';
import AssignToCourseDialog from './AssignToCourseDialog';

export default function AllMediaRoot() {
    const dispatch = useAppDispatch();
    const [search, setSearch] = useState("");
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 20
    });
    const [currentActive, setCurrentActive] = useState<courseTabType>("notes");
    const { t } = useTranslation();
    const { data } = useGetallMediaQuery({ ...qp, search, type: currentActive });
    const [openConfirm, setOpenConfirm] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());


    const [deleteMedia] = useDeleteMediaMutation();
    const [changeStatus] = useUseChangeMediaStatusMutation();

    const handleToggleItem = (id: number) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);

            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);

            return newSet;
        });
    };

    const handleMediaDeletion = async () => {
        try {
            const response = await deleteMedia({
                media_ids: Array.from(selectedItems)
            }).unwrap();
            dispatch(
                showToast({
                    message: response?.message || "Media Deleted Successfully",
                    severity: "success"
                })
            )
            setSelectedItems(new Set());
            setOpenConfirm(false);
        }
        catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || "Unable to delete Media",
                    severity: "error"
                })
            )
        }
    }

    const handleMediaStatusChange = async () => {
        try {
            const response = await changeStatus({
                media_ids: Array.from(selectedItems)
            }).unwrap();
            setSelectedItems(new Set());
            dispatch(
                showToast({
                    message: response?.message || "Media Availabe For Download Successfully",
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
        <div className=' flex flex-col justify-between h-full'>
            <PageHeader
                breadcrumb={[
                    {
                        title: t("messages.medias")
                    }
                ]}
            />
            <TabController
                options={[
                    { label: "Notes", value: "notes" },
                    { label: "Audios", value: "audios" },
                ]}
                currentActive={currentActive}
                setActiveTab={setCurrentActive}

            />
            <MediaFileDragDrop maxSize={30} type={currentActive} />
            <Divider className='my-4!' />
            <div className="flex flex-col h-full justify-between gap-4">
                <div className="top__wrapper">
                    <TableFilter
                        search={search}
                        setSearch={setSearch}
                        handleRoleDelete={() => setOpenConfirm(true)}
                        selectedRows={selectedItems}
                        assignToCourse={() => setOpen(true)}
                        onStatusChange={() => handleMediaStatusChange()}
                    />
                    {data?.data?.data.length ?
                        <>
                            <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  flex-10">
                                {data?.data?.data?.map((item) => (

                                    <div className="flex gap-3 items-center">
                                        <Checkbox
                                            color="primary"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => handleToggleItem(item.id)}
                                        />
                                        {/* <div onClick={() => handleToggleItem(item.id)} className="cursor-pointer flex-1"> */}
                                        <MediaCard media={item as MediaProps} type={currentActive} />
                                        {/* </div> */}
                                    </div>
                                ))}
                            </div>
                        </>
                        :
                        <EmptyRoute
                            title={t("messages.empty_states.media_management.action")}
                            message={t("messages.empty_states.media_management.description")}
                        />}
                </div>
                <TablePagination qp={qp} setQp={setQp} totalPages={data?.data?.pagination?.total_pages || 0} />
            </div>

            <ConfirmationDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                title={`Delete Media ${currentActive}`}
                description={"Are you sure you want to continue? This action is permanent and cannot be undone."}
                onSave={handleMediaDeletion}
                icon={(<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.0697 5.23C19.4597 5.07 17.8497 4.95 16.2297 4.86V4.85L16.0097 3.55C15.8597 2.63 15.6397 1.25 13.2997 1.25H10.6797C8.34967 1.25 8.12967 2.57 7.96967 3.54L7.75967 4.82C6.82967 4.88 5.89967 4.94 4.96967 5.03L2.92967 5.23C2.50967 5.27 2.20967 5.64 2.24967 6.05C2.28967 6.46 2.64967 6.76 3.06967 6.72L5.10967 6.52C10.3497 6 15.6297 6.2 20.9297 6.73C20.9597 6.73 20.9797 6.73 21.0097 6.73C21.3897 6.73 21.7197 6.44 21.7597 6.05C21.7897 5.64 21.4897 5.27 21.0697 5.23Z" fill="#1D82F5" />
                    <path d="M19.2297 8.14C18.9897 7.89 18.6597 7.75 18.3197 7.75H5.67975C5.33975 7.75 4.99975 7.89 4.76975 8.14C4.53975 8.39 4.40975 8.73 4.42975 9.08L5.04975 19.34C5.15975 20.86 5.29975 22.76 8.78975 22.76H15.2097C18.6997 22.76 18.8398 20.87 18.9497 19.34L19.5697 9.09C19.5897 8.73 19.4597 8.39 19.2297 8.14ZM13.6597 17.75H10.3297C9.91975 17.75 9.57975 17.41 9.57975 17C9.57975 16.59 9.91975 16.25 10.3297 16.25H13.6597C14.0697 16.25 14.4097 16.59 14.4097 17C14.4097 17.41 14.0697 17.75 13.6597 17.75ZM14.4997 13.75H9.49975C9.08975 13.75 8.74975 13.41 8.74975 13C8.74975 12.59 9.08975 12.25 9.49975 12.25H14.4997C14.9097 12.25 15.2497 12.59 15.2497 13C15.2497 13.41 14.9097 13.75 14.4997 13.75Z" fill="#1D82F5" />
                </svg>)}
            />
            <AssignToCourseDialog open={open} setOpen={setOpen} selectedMedia={Array.from(selectedItems)} type={currentActive} />
        </div >
    )
}
