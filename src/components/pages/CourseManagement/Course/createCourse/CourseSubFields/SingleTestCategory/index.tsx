import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Checkbox, Skeleton, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetSelectedTestBasedOnTestCategoryAndCourseIdQuery, useRemoveTestToCourseMutation } from '../../../../../../../services/courseApi';
import { useGetTestCategoryByIdQuery } from '../../../../../../../services/questionApi';
import { showToast } from '../../../../../../../slice/toastSlice';
import { useAppDispatch } from '../../../../../../../store/hook';
import TablePagination from '../../../../../../molecules/Table/Pagination';
import TestCard from '../../../../../../organism/Cards/TestCard';
import EmptyRoute from '../../../../../../organism/EmptyRoute';
import TableFilter from '../../../../../../organism/TableFilter';
import AssignTestDialog from '../Test/AssignTestDialog';

export default function SingleTestCategory({ allowMultiple = true }: { allowMultiple?: boolean; }) {
    const { id, test_category_id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false);
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 8
    });
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const { data, isLoading } = useGetSelectedTestBasedOnTestCategoryAndCourseIdQuery({ pageIndex: qp.pageIndex, pageSize: qp.pageSize, search, course_id: Number(id), test_category_id: Number(test_category_id) }, { skip: !id });
    const [removeTestFromCourse] = useRemoveTestToCourseMutation()
    const { data: singleCategory } = useGetTestCategoryByIdQuery({ id: Number(test_category_id) }, { skip: !id })
    const tests = data?.data?.data || [];


    const handleToggleItem = (id: number) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);

            if (!allowMultiple) {
                return new Set([id]);
            }

            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);

            return newSet;
        });
    };

    const handleTestRemoval = async () => {
        try {
            const response = await removeTestFromCourse({ id: Number(id) || null, body: Array.from(selectedItems) }).unwrap();
            dispatch(
                showToast({
                    message: response?.message || `Successfully removed test`,
                    severity: "success"
                })
            )
        }
        catch (e: any) {
            dispatch(
                showToast({
                    message: e?.data?.message || `Unable to remove test`,
                    severity: "error"
                })
            )
        }
    }
    return (
        <div className='course__test__root'>
            <div className="flex justify-between items-center mb-1">
                <div className="">
                    <Button variant='text' sx={{ py: 1 }} color='inherit' onClick={() => navigate(-1)} startIcon={<ArrowBack />} >Back</Button>
                    <Typography variant='h3' fontWeight={500}>{singleCategory?.data?.name}</Typography>
                </div>
                <Button variant="contained" color='primary' onClick={() => setOpen(true)}>Add More Tests</Button>
            </div>
            <TableFilter
                handleRoleDelete={handleTestRemoval}
                search={search}
                setSearch={setSearch}
                selectedRows={selectedItems}
                categoryLayout={true}
            />
            {!isLoading && !tests.length && <EmptyRoute
                title="No Test found"
                message='Oops your test is empty. Please add test to help student gain knowledge.'
            />}

            <div className="flex flex-col gap-4 md:grid grid-cols-2 xl:grid-cols-3 2xl:gap-6">
                {isLoading ? (
                    [...Array(6)].map((_, idx) => (
                        <div key={idx} className="col-span-1">
                            <div className="flex gap-3 items-center">
                                <Box className="w-full">
                                    <Skeleton variant="rectangular" height={120} className="rounded-xl" />
                                </Box>
                            </div>
                        </div>
                    ))
                ) :
                    (tests.map((test) => (
                        <div className="flex gap-3 items-center" key={test.id} >
                            <Checkbox
                                color="primary"
                                checked={selectedItems.has(Number(test.id))}
                                onChange={() => handleToggleItem(Number(test.id))}
                            />
                            <div onClick={() => handleToggleItem(Number(test.id))} className="cursor-pointer flex-1">
                                <TestCard test={test} />
                            </div>
                        </div>
                    )))}
            </div>
            <TablePagination
                qp={qp}
                setQp={setQp}
                totalPages={data?.data?.pagination?.total_pages || 0}
            />
            <AssignTestDialog open={open} setOpen={setOpen} testCategoryId={Number(test_category_id)} />
        </div>
    )
}
