import { Add } from "@mui/icons-material";
import { Autocomplete, Button, Divider, FormHelperText, IconButton, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import type { FormikProps } from "formik";
import { useMemo } from "react";
import { useGetAllSubscriptionQuery } from "../../../../../../services/subscriptionPlanApi";
import type { BillingCycle, CourseProps, DiscountTypeProps } from "../../../../../../types/course";
import type { SubscriptionPlanProps } from "../../../../../../types/subscriptionPlan";
import EmptyRoute from "../../../../../organism/EmptyRoute";

interface Props {
    formik: FormikProps<CourseProps>;
    handleClick: () => void;
}

const billingCycleOptions: { value: BillingCycle; label: string }[] = [
    { value: "days", label: "Days" },
    { value: "months", label: "Months" },
    { value: "years", label: "Years" },
];

const discountTypeOptions: { value: DiscountTypeProps; label: string }[] = [
    { value: "percentage", label: "Percentage" },
    { value: "amount", label: "Amount" },
];

export default function SubscriptionCourseType({ handleClick, formik }: Props) {
    const { data } = useGetAllSubscriptionQuery({
        pageIndex: 1,
        pageSize: 100,
        search: "",
    });

    const subscriptionPlans: SubscriptionPlanProps[] = data?.data?.data || [];

    // Initialize with at least one empty row if none exist
    const ensureInitialRow = () => {
        if (!formik.values.course_subscription || formik.values.course_subscription.length === 0) {
            formik.setFieldValue("course_subscription", [{
                subscription_id: 0,
                price: "",
                billing_cycle: "months" as BillingCycle,
                number: 1,
                discount: 0,
                discount_type: "percentage" as DiscountTypeProps,
            }]);
        }
    };

    // Call on mount if needed
    useMemo(() => {
        ensureInitialRow();
    }, []);

    const handleAddRow = () => {
        const currentRows = formik.values.course_subscription || [];
        formik.setFieldValue("course_subscription", [
            ...currentRows,
            {
                subscription_id: 0,
                price: "",
                billing_cycle: "months" as BillingCycle,
                number: 1,
                discount: 0,
                discount_type: "percentage" as DiscountTypeProps,
            }
        ]);
    };

    const handleDeleteRow = (index: number) => {
        const currentRows = formik.values.course_subscription || [];
        if (currentRows.length > 1) {
            formik.setFieldValue(
                "course_subscription",
                currentRows.filter((_, i) => i !== index)
            );
        }
    };

    const hasData = (formik.values.course_subscription && formik.values.course_subscription.length > 0);

    return (
        <div className="course__type__record subscription__course__record">
            <div className="flex items-center justify-between pb-2">
                <Typography variant='h5'>Subscription</Typography>
                {hasData && (
                    <Button
                        startIcon={<Add />}
                        variant="contained"
                        color="primary"
                        onClick={handleClick}
                    >
                        Add Subscription
                    </Button>
                )}
            </div>
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

            {hasData ? (
                <div className="subscription__form__wrapper flex flex-col gap-4">
                    {formik.values.course_subscription?.map((item, index) => {
                        const selectedPlan = subscriptionPlans.find(
                            (plan) => Number(plan.id) === item.subscription_id
                        );
                        const planOptions = subscriptionPlans.filter((plan) => {
                            const selectedIds = formik.values.course_subscription
                                ?.filter((_, i) => i !== index)
                                .map((sub) => sub.subscription_id) || [];
                            return !selectedIds.includes(Number(plan.id));
                        });

                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-5"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <Typography variant="subtitle1">
                                        {selectedPlan?.name || `Plan ${index + 1}`}
                                    </Typography>
                                    <IconButton
                                        onClick={() => handleDeleteRow(index)}
                                        color="error"
                                        size="small"
                                        disabled={(formik.values.course_subscription?.length ?? 0) <= 1}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21.07 5.23C19.46 5.07 17.85 4.95 16.23 4.86V4.85L16.01 3.55C15.86 2.63 15.64 1.25 13.3 1.25H10.68C8.35001 1.25 8.13 2.57 7.97 3.54L7.76 4.82C6.83001 4.88 5.9 4.94 4.97 5.03L2.93001 5.23C2.51001 5.27 2.21 5.64 2.25 6.05C2.29 6.46 2.65 6.76 3.07 6.72L5.11001 6.52C10.35 6 15.63 6.2 20.93 6.73C20.96 6.73 20.98 6.73 21.01 6.73C21.39 6.73 21.72 6.44 21.76 6.05C21.79 5.64 21.49 5.27 21.07 5.23Z" fill="#111827" />
                                            <path d="M19.23 8.14C18.99 7.89 18.66 7.75 18.32 7.75H5.67999C5.33999 7.75 4.99999 7.89 4.76999 8.14C4.53999 8.39 4.40999 8.73 4.42999 9.08L5.04999 19.34C5.15999 20.86 5.29999 22.76 8.78999 22.76H15.21C18.7 22.76 18.84 20.87 18.95 19.34L19.57 9.09C19.59 8.73 19.46 8.39 19.23 8.14ZM13.66 17.75H10.33C9.91999 17.75 9.57999 17.41 9.57999 17C9.57999 16.59 9.91999 16.25 10.33 16.25H13.66C14.07 16.25 14.41 16.59 14.41 17C14.41 17.41 14.07 17.75 13.66 17.75ZM14.5 13.75H9.49999C9.08999 13.75 8.74999 13.41 8.74999 13C8.74999 12.59 9.08999 12.25 9.49999 12.25H14.5C14.91 12.25 15.25 12.59 15.25 13C15.25 13.41 14.91 13.75 14.5 13.75Z" fill="#111827" />
                                        </svg>
                                    </IconButton>
                                </div>

                                <Divider className="mb-4!" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="input__field">
                                        <InputLabel>Subscription Name</InputLabel>
                                        <Autocomplete
                                            options={planOptions}
                                            getOptionLabel={(option) => option.name || ""}
                                            value={selectedPlan ?? null}
                                            onChange={(_, newValue) => {
                                                formik.setFieldValue(
                                                    `course_subscription[${index}].subscription_id`,
                                                    newValue ? Number(newValue.id) : 0
                                                );
                                            }}
                                            isOptionEqualToValue={(option, value) => Number(option.id) === Number(value.id)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select subscription"
                                                />
                                            )}
                                            fullWidth
                                        />
                                    </div>

                                    <div className="input__field">
                                        <InputLabel>Price</InputLabel>
                                        <OutlinedInput
                                            value={item.price}
                                            onChange={(e) => {
                                                formik.setFieldValue(
                                                    `course_subscription[${index}].price`,
                                                    e.target.value
                                                );
                                            }}
                                            placeholder="Enter price"
                                            fullWidth
                                        />
                                    </div>

                                    <div className="input__field">
                                        <InputLabel>Billing Cycle</InputLabel>
                                        <Autocomplete
                                            disableClearable
                                            options={billingCycleOptions}
                                            getOptionLabel={(option) => option.label}
                                            value={billingCycleOptions.find(opt => opt.value === item.billing_cycle) || billingCycleOptions[1]}
                                            onChange={(_, newValue) => {
                                                formik.setFieldValue(
                                                    `course_subscription[${index}].billing_cycle`,
                                                    newValue?.value || "months"
                                                );
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select billing cycle"
                                                />
                                            )}
                                            fullWidth
                                        />
                                    </div>

                                    <div className="input__field">
                                        <InputLabel>Duration Number</InputLabel>
                                        <OutlinedInput
                                            type="number"
                                            value={item.number}
                                            onChange={(e) => {
                                                formik.setFieldValue(
                                                    `course_subscription[${index}].number`,
                                                    Number(e.target.value)
                                                );
                                            }}
                                            placeholder="Enter number"
                                            fullWidth
                                        />
                                    </div>

                                    <div className="input__field">
                                        <InputLabel>Discount</InputLabel>
                                        <OutlinedInput
                                            type="number"
                                            value={item.discount ?? 0}
                                            onChange={(e) => {
                                                formik.setFieldValue(
                                                    `course_subscription[${index}].discount`,
                                                    Number(e.target.value)
                                                );
                                            }}
                                            placeholder="Enter discount"
                                            fullWidth
                                            inputProps={{ min: 0 }}
                                        />
                                    </div>

                                    <div className="input__field">
                                        <InputLabel>Discount Type</InputLabel>
                                        <Autocomplete
                                            disableClearable
                                            options={discountTypeOptions}
                                            getOptionLabel={(option) => option.label}
                                            value={discountTypeOptions.find(opt => opt.value === item.discount_type) || discountTypeOptions[0]}
                                            onChange={(_, newValue) => {
                                                formik.setFieldValue(
                                                    `course_subscription[${index}].discount_type`,
                                                    newValue?.value || "percentage"
                                                );
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Select discount type"
                                                />
                                            )}
                                            fullWidth
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div>
                        <Button
                            startIcon={<Add />}
                            variant="text"
                            color="primary"
                            onClick={handleAddRow}
                        >
                            Add More
                        </Button>
                    </div>
                </div>
            ) : (
                <EmptyRoute
                    title="No Subscription found"
                    message="Oops this course subscription is empty. Please add subscription to help student gain knowledge."
                    cta={{
                        label: "Add Subscription",
                        url: ""
                    }}
                    handleClick={handleClick}
                />
            )}
        </div>
    );
}