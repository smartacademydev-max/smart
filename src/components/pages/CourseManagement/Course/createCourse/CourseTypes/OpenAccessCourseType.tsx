import { Divider, Typography } from '@mui/material';
import TextEditor from '../../../../../atoms/TextEditor';

interface Props {
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
}

export default function OpenAccessCourseType({ value, error, onChange, onBlur }: Props) {
    return (
        <div className="open_access__course__record">
            <Typography variant='h5' className='pb-2! '>Free Materials</Typography>
            <Typography variant='body2' color='text.secondary' className='pb-2!'>
                Content under this course is open to every logged-in user without enrollment.
                It won't appear in user-facing course menus — only inside the Free Materials browser.
            </Typography>
            <Divider className='mb-8!' />
            <TextEditor
                required
                error={error}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            />
        </div>
    );
}
