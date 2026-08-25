/**
 * Plain text out of CKEditor markup. Entities are decoded too — stripping the
 * tags alone leaves `&nbsp;` and friends showing literally.
 */
export const stripHtml = (value: string): string => {
    const withoutTags = value.replace(/<[^>]*>/g, " ");
    const decoded = new DOMParser().parseFromString(withoutTags, "text/html").body.textContent ?? "";

    return decoded.replace(/\s+/g, " ").trim();
};

/**
 * The gap numbers a drag-into-text passage references, in the order they
 * appear. Gaps are written `[[1]]`, following Moodle's markup so imported
 * content reads the same.
 */
export const gapsIn = (text: string): number[] => {
    const found = [...stripHtml(text).matchAll(/\[\[(\d+)\]\]/g)].map((m) => Number(m[1]));

    return [...new Set(found)].filter((gap) => gap > 0);
};

/**
 * The passage with its gap markers shown as blanks. `[[1]]` is authoring
 * syntax, so a question list should read as a fill-in-the-blank sentence
 * rather than exposing the markup.
 */
export const gapsAsBlanks = (text: string): string =>
    text.replace(/\[\[(\d+)\]\]/g, "____");
