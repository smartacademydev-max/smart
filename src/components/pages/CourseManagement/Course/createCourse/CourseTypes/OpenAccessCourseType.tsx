import { Divider, FormHelperText, InputLabel, OutlinedInput, Typography } from '@mui/material';
import type { FormikProps } from 'formik';
import type { CourseProps } from '../../../../../../types/course';
import TextEditor from '../../../../../atoms/TextEditor';

interface Props {
    formik: FormikProps<CourseProps>;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
}

export default function OpenAccessCourseType({ formik, value, error, onChange, onBlur }: Props) {
    return (
        <div className="open_access__course__record">
            <Typography variant='h5' className='pb-2! '>Free Materials</Typography>
            <Typography variant='body2' color='text.secondary' className='pb-2!'>
                Content under this course is open to every logged-in user without enrollment.
                It won't appear in user-facing course menus — only inside the Free Materials browser.
            </Typography>
            <Divider className='mb-8!' />
            <div className="input_field mb-6">
                <InputLabel>Label</InputLabel>
                <OutlinedInput
                    fullWidth
                    placeholder='Enter label (shown on course card)'
                    name='course_type_label'
                    value={formik.values.course_type_label ?? ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.course_type_label && formik.errors.course_type_label && (
                    <FormHelperText error sx={{ mt: 0.5 }}>
                        {formik.errors.course_type_label}
                    </FormHelperText>
                )}
            </div>
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
