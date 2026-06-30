import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../../../routes/PATH';
import type { TestCategory } from '../../../types/question';

export default function TestCategoryCard({ data, id }: { data: TestCategory, id: number }) {
    const navigate = useNavigate();
    return (
        <Box sx={{
            border: (theme) => `1px solid ${theme.palette.separator.dark}`,
            borderRadius: "4px",
            padding: "16px"
        }}>
            <Box className="image__wrapper aspect-1/1 rounded-sm overflow-hidden w-12 text-3xl flex items-center justify-center mx-auto" sx={{
                background: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText
            }} >
                {data?.image_url ? <img src={data?.image_url || ""} alt="" className='max-w-12' /> : data?.name.split("")[0]}
            </Box>
            <div className="content__wrapper max-w-[80%] text-center mx-auto my-2">
                <Typography variant='h5' fontWeight={500} className='block'>{data?.name}</Typography>
                <Typography variant='subtitle2'>{data?.description}</Typography>
            </div>
            <Button variant='contained' color='primary' fullWidth onClick={() => navigate(PATH.COURSE_MANAGEMENT.COURSES.EDIT_COURSE.TEST.TEST_CATEGORY.ROOT(id, data.id))}>View Tests</Button>
        </Box>

    )
}
