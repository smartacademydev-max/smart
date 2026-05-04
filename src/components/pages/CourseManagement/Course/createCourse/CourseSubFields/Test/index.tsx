import { Box, Checkbox, Skeleton } from '@mui/material';
import { useState } from 'react';
import { useGetCourseTestQuery, useRemoveTestToCourseMutation } from '../../../../../../../services/courseApi';
import { showToast } from '../../../../../../../slice/toastSlice';
import { useAppDispatch } from '../../../../../../../store/hook';
import TablePagination from '../../../../../../molecules/Table/Pagination';
import TestCard from '../../../../../../organism/Cards/TestCard';
import EmptyRoute from '../../../../../../organism/EmptyRoute';
import PageHeader from '../../../../../../organism/PageHeader';
import TableFilter from '../../../../../../organism/TableFilter';
import AssignTestDialog from './AssignTestDialog';
import { useParams } from 'react-router-dom';

export default function CourseTest({ allowMultiple = true }: { allowMultiple?: boolean; }) {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false);
    const [qp, setQp] = useState({
        pageIndex: 1,
        pageSize: 8
    });
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const { data, isLoading } = useGetCourseTestQuery({ pageIndex: qp.pageIndex, pageSize: qp.pageSize, search, id: Number(id) }, { skip: !id });
    const [removeTestFromCourse] = useRemoveTestToCourseMutation()

    const tests = data?.data?.data || [];

    console.log("all tests", { tests, id })

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
            <PageHeader
                breadcrumb={[
                    {
                        title: "Test",
                    }
                ]}
                description="Add a test for this course so that you can manage the test you wanted deeply. "
                cta={{
                    label: "Add Test",
                    url: ""
                }}
                handleOpenPopup={() => {
                    setOpen(prev => !prev)
                }}
            />
            <TableFilter
                handleRoleDelete={handleTestRemoval}
                search={search}
                setSearch={setSearch}
                selectedRows={selectedItems}
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
            <AssignTestDialog open={open} setOpen={setOpen} selectedTestIds={tests.map((item) => Number(item.id))} />
        </div>
    )
}
