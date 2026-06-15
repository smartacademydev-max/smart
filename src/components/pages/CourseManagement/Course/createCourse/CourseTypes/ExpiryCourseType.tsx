import { Autocomplete, Divider, FormHelperText, InputLabel, OutlinedInput, TextField, Typography } from '@mui/material';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { FormikProps } from 'formik';
import type { CourseProps, DiscountTypeProps } from '../../../../../../types/course';
import MakuraDatePicker from '../../../../../atoms/MakuraDatePicker';

export default function ExpiryCourseType({ formik }: { formik: FormikProps<CourseProps> }) {

    const parseDate = (value: string | undefined) => (value ? dayjs(value) : null);

    return (
        <div className="course__type__record expire__course__record">
            <Typography variant='h5' className='pb-2'>Expiry</Typography>
            <Divider className='mb-8!' />
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {/* Label */}
                <div className="col-span-2">
                    <div className="input_field">
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
                </div>

                {/* Start Date */}
                <div className="col-span-2 lg:col-span-1">
                    <div className="input_field">
                        <InputLabel className="required">Start Date</InputLabel>
                        <MakuraDatePicker
                            required
                            value={parseDate(formik.values.course_expiry.start_date)}
                            onChange={(date: Dayjs | null) =>
                                formik.setFieldValue('course_expiry.start_date', date ? date.format('YYYY-MM-DD') : '')
                            }
                            placeholder="Start Date"
                        />
                        {formik.touched.course_expiry?.start_date &&
                            formik.errors.course_expiry?.start_date && (
                                <FormHelperText error>
                                    {formik.errors.course_expiry.start_date}
                                </FormHelperText>
                            )}
                    </div>
                </div>

                {/* End Date */}
                <div className="col-span-2 lg:col-span-1">
                    <div className="input_field">
                        <InputLabel className="required">End Date</InputLabel>
                        <MakuraDatePicker
                            required
                            value={parseDate(formik.values.course_expiry.end_date)}
                            onChange={(date: Dayjs | null) =>
                                formik.setFieldValue('course_expiry.end_date', date ? date.format('YYYY-MM-DD') : '')
                            }
                            placeholder="End Date"
                        />
                        {formik.touched.course_expiry?.end_date &&
                            formik.errors.course_expiry?.end_date && (
                                <FormHelperText error>
                                    {formik.errors.course_expiry.end_date}
                                </FormHelperText>
                            )}
                    </div>
                </div>

                {/* Price */}
                <div className="col-span-2">
                    <div className="input_field">
                        <InputLabel className="required">Price</InputLabel>
                        <OutlinedInput
                            fullWidth
                            placeholder='Enter Price'
                            name='course_expiry.price'
                            value={formik.values.course_expiry.price}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.course_expiry?.price && Boolean(formik.errors.course_expiry?.price)}
                        />
                        {formik.touched.course_expiry?.price && formik.errors.course_expiry?.price && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                                {formik.errors.course_expiry.price}
                            </FormHelperText>
                        )}
                    </div>
                </div>

                {/* Discount */}
                <div className="col-span-2 lg:col-span-1">
                    <div className="input_field">
                        <InputLabel className="required">Discount</InputLabel>
                        <OutlinedInput
                            fullWidth
                            placeholder='Enter Discount'
                            name='course_expiry.discount'
                            type="number"
                            value={formik.values.course_expiry.discount}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.course_expiry?.discount && formik.errors.course_expiry?.discount && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                                {formik.errors.course_expiry.discount}
                            </FormHelperText>
                        )}
                    </div>
                </div>

                {/* Discount Type */}
                <div className="col-span-2 lg:col-span-1">
                    <div className="input_field">
                        <InputLabel className="required">Discount Type</InputLabel>
                        <Autocomplete
                            options={[
                                { label: "Percentage", value: "percentage" },
                                { label: "Amount", value: "amount" },
                            ]}
                            value={formik.values.course_expiry.discount_type === 'percentage' ? { label: "Percentage", value: "percentage" } : { label: "Amount", value: "amount" }}
                            getOptionLabel={(option) => option.label}
                            onChange={(_e, value) => {
                                formik.setFieldValue('course_expiry.discount_type', value?.value as DiscountTypeProps || 'percentage');
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select discount type"
                                />
                            )}
                        />
                        {formik.touched.course_expiry?.discount_type && formik.errors.course_expiry?.discount_type && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                                {formik.errors.course_expiry.discount_type}
                            </FormHelperText>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
