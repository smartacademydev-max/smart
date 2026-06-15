import type { CourseProps } from "../types/course";

export const createCourseFormData = (values: CourseProps): FormData => {
    const formData = new FormData();

    // Basic text fields
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("about_this_course", values.about_this_course);
    formData.append("course_type", values.course_type);
    if (values.course_type_label && values.course_type_label.trim()) {
        formData.append("course_type_label", values.course_type_label.trim());
    }

    formData.append("duration[hours]", values.duration.hours.toString());
    formData.append("duration[minutes]", values.duration.minutes.toString());
    formData.append("can_take_free_trial", values.can_take_free_trial.toString());

    if (values.free_type_description) {
        formData.append("free_type_description", values.free_type_description.toString());
    }

    if (values.package_type) {
        formData.append("package_type", values.package_type);
    }

    if (values.thumbnail) {
        formData.append("thumbnail", values.thumbnail);
    }
    if (values.thumbnail_url) {
        formData.append("thumbnail_url", values.thumbnail_url);
    }

    // Course subscription details (only for subscription type)
    if (values.course_type === "subscription" && values.course_subscription && values.course_subscription.length > 0) {
        values.course_subscription.forEach((subscription, index) => {
            formData.append(`course_subscription[${index}][subscription_id]`, subscription.subscription_id.toString());
            formData.append(`course_subscription[${index}][price]`, subscription.price);
            formData.append(`course_subscription[${index}][billing_cycle]`, subscription.billing_cycle);
            formData.append(`course_subscription[${index}][number]`, subscription.number.toString());
        });
    }

    // Course expiry details (only for expiry type)
    if (values.course_type === "expiry") {
        formData.append("course_expiry[start_date]", values.course_expiry.start_date);
        formData.append("course_expiry[end_date]", values.course_expiry.end_date);
        formData.append("course_expiry[price]", values.course_expiry.price);
        formData.append("course_expiry[discount]", values.course_expiry.discount.toString());
        formData.append("course_expiry[discount_type]", values.course_expiry.discount_type);
    }

    // Selections - mega categories array
    values.selections.mega_category.forEach((id, index) => {
        formData.append(`selections[mega_category][${index}]`, id.toString());
    });

    // Selections - categories grouped by mega category
    Object.entries(values.selections.category).forEach(([megaId, categoryIds]) => {
        categoryIds.forEach((catId, index) => {
            formData.append(`selections[category][${megaId}][${index}]`, catId.toString());
        });
    });

    // Selections - sub categories grouped by category
    Object.entries(values.selections.sub_category).forEach(([catId, subCatIds]) => {
        subCatIds.forEach((subId, index) => {
            formData.append(`selections[sub_category][${catId}][${index}]`, subId.toString());
        });
    });

    // Selections - positions/levels array
    values.selections.position_ids.forEach((id, index) => {
        formData.append(`selections[position_ids][${index}]`, id.toString());
    });

    // Teachers/instructors array
    values.teachers.forEach((id, index) => {
        formData.append(`teachers[${index}]`, id.toString());
    });

    return formData;
};