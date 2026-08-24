import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetAllCategoryRelatedToMegaCategoryQuery, useGetAllMegaCategoryQuery, useGetAllSubCategoryRelatedToCategoryQuery } from '../services/categoryApi';
import { useGetAllPositionQuery } from '../services/positionApi';
import { useGetAllRolesQuery } from '../services/roleAndPermissionApi';
import { useGetAllUserQuery } from '../services/userApi';
import type { CategoryFilterParams, UserStatus } from '../types';
import type { SelectionType } from '../types/course';
import { getItem, removeItem, setItem } from '../utils/localStorageUtil';

export interface AppliedPill {
    key: string;
    label: string;
    onDelete: () => void;
}

const emptySelections = (): SelectionType => ({
    mega_category: [],
    category: {},
    sub_category: {},
    position_ids: [],
    teacher_ids: [],
    role_ids: [],
});

const loadSelections = (key: string): SelectionType => {
    const stored = getItem<SelectionType>(key);
    if (!stored) return emptySelections();
    return {
        mega_category: Array.isArray(stored.mega_category) ? stored.mega_category : [],
        category: typeof stored.category === 'object' && stored.category !== null ? stored.category : {},
        sub_category: typeof stored.sub_category === 'object' && stored.sub_category !== null ? stored.sub_category : {},
        position_ids: Array.isArray(stored.position_ids) ? stored.position_ids : [],
        teacher_ids: Array.isArray(stored.teacher_ids) ? stored.teacher_ids : [],
        role_ids: Array.isArray(stored.role_ids) ? stored.role_ids : [],
    };
};

const loadLabelMap = (key: string): Record<number, string> =>
    getItem<Record<number, string>>(key) ?? {};

function removeItemFromSelections(
    sel: SelectionType,
    type: "mega" | "category" | "sub",
    id: number,
    parentId?: number
): SelectionType {
    const next: SelectionType = {
        mega_category: [...sel.mega_category],
        category: Object.fromEntries(Object.entries(sel.category).map(([k, v]) => [k, [...v]])),
        sub_category: Object.fromEntries(Object.entries(sel.sub_category).map(([k, v]) => [k, [...v]])),
        position_ids: [...sel.position_ids],
        teacher_ids: [...(sel.teacher_ids || [])],
        role_ids: [...(sel.role_ids || [])],
    };

    if (type === "mega") {
        next.mega_category = sel.mega_category.filter(mcId => mcId !== id);
        const removedCatIds = sel.category[id] || [];
        delete next.category[id];
        removedCatIds.forEach(catId => { delete next.sub_category[catId]; });
    } else if (type === "category" && parentId !== undefined) {
        const remaining = (sel.category[parentId] || []).filter(cId => cId !== id);
        if (remaining.length === 0) delete next.category[parentId];
        else next.category[parentId] = remaining;
        delete next.sub_category[id];
    } else if (type === "sub" && parentId !== undefined) {
        const remaining = (sel.sub_category[parentId] || []).filter(sId => sId !== id);
        if (remaining.length === 0) delete next.sub_category[parentId];
        else next.sub_category[parentId] = remaining;
    }
    return next;
}

export const useCourseFilter = (options?: { persistOnMount?: boolean; namespace?: string }) => {
    const storageKey = options?.namespace ? `course_filter_${options.namespace}` : 'course_filter_selections';
    const labelMapKey = options?.namespace ? `course_filter_label_map_${options.namespace}` : 'course_filter_label_map';

    const [selections, setSelections] = useState<SelectionType>(() => loadSelections(storageKey));
    const [appliedSelections, setAppliedSelections] = useState<SelectionType>(() => loadSelections(storageKey));
    const [appliedLabelMap, setAppliedLabelMap] = useState<Record<number, string>>(() => loadLabelMap(labelMapKey));

    const [searchTeacher, setSearchTeacher] = useState("");

    const [courseTypes, setCourseTypes] = useState<string[]>([]);
    const [appliedCourseTypes, setAppliedCourseTypes] = useState<string[]>([]);

    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [appliedStatus, setAppliedStatus] = useState<string[]>([]);

    const [selectedDeviceType, setSelectedDeviceType] = useState<string[]>([]);
    const [appliedDeviceType, setAppliedDeviceType] = useState<string[]>([]);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string[]>([]);
    const [appliedPaymentMethod, setAppliedPaymentMethod] = useState<string[]>([]);

    const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
    const [appliedAudience, setAppliedAudience] = useState<string[]>([]);

    const [filterDialogOpen, setFilterDialogOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<UserStatus>("all");

    const { data: megaCategories, isLoading: loadingMegaCategory } = useGetAllMegaCategoryQuery();
    const { data: roles } = useGetAllRolesQuery({ pageIndex: 1, pageSize: 10 });

    const { data: teachers } = useGetAllUserQuery({
        pageIndex: 1,
        pageSize: 20,
        search: searchTeacher,
        role: 4,
    });

    const { data: categories } = useGetAllCategoryRelatedToMegaCategoryQuery(
        { currentCategory: selections.mega_category.join(",") },
        { skip: selections.mega_category.length === 0 }
    );

    const flattenedCategories = Object.keys(selections.category).length > 0
        ? Object.values(selections.category).flat().join(",")
        : "";

    const { data: subCategories } = useGetAllSubCategoryRelatedToCategoryQuery(
        { currentCategory: flattenedCategories },
        { skip: flattenedCategories.length === 0 }
    );

    const { data: positions } = useGetAllPositionQuery({ pageIndex: 1, pageSize: 20, search: "" });

    const handleCategoryChange = useCallback((
        type: "mega" | "category" | "sub" | "position" | "teacher" | "role",
        ids: number[],
        parentId?: number
    ) => {
        setSelections(prev => {
            const next = { ...prev };
            switch (type) {
                case "mega":
                    next.mega_category = ids;
                    next.category = {};
                    next.sub_category = {};
                    break;
                case "category":
                    if (parentId !== undefined) {
                        next.category = { ...prev.category, [parentId]: ids };
                        next.sub_category = {};
                    }
                    break;
                case "sub":
                    if (parentId !== undefined) {
                        next.sub_category = { ...prev.sub_category, [parentId]: ids };
                    }
                    break;
                case "position":
                    next.position_ids = ids;
                    break;
                case "teacher":
                    next.teacher_ids = ids;
                    break;
                case "role":
                    next.role_ids = ids;
                    break;
            }
            return next;
        });
    }, []);

    const handleApplyFilter = useCallback((
        selectedCourseTypes: string[],
        selectedStatusTypes?: string[],
        selectedDeviceTypes?: string[],
        selectedPaymentMethod?: string[],
        selectedAudience?: string[]
    ) => {
        setAppliedSelections(selections);
        setAppliedCourseTypes(selectedCourseTypes);
        setCourseTypes(selectedCourseTypes);
        if (selectedStatusTypes !== undefined) { setSelectedStatus(selectedStatusTypes); setAppliedStatus(selectedStatusTypes); }
        if (selectedDeviceTypes !== undefined) { setSelectedDeviceType(selectedDeviceTypes); setAppliedDeviceType(selectedDeviceTypes); }
        if (selectedPaymentMethod !== undefined) { setSelectedPaymentMethod(selectedPaymentMethod); setAppliedPaymentMethod(selectedPaymentMethod); }
        if (selectedAudience !== undefined) { setSelectedAudience(selectedAudience); setAppliedAudience(selectedAudience); }

        const newMap: Record<number, string> = {};
        (megaCategories?.data || []).forEach((mc: any) => { if (mc.id) newMap[Number(mc.id)] = mc.name; });
        // categories response nests actual categories inside .sub_category[] on each mega-cat container
        (categories?.data || []).forEach((mc: any) => {
            (mc.sub_category || []).forEach((c: any) => { if (c.id) newMap[Number(c.id)] = c.name; });
        });
        // subCategories response nests actual sub-cats inside .sub_category[] on each category container
        (subCategories?.data || []).forEach((c: any) => {
            (c.sub_category || []).forEach((sc: any) => { if (sc.id) newMap[Number(sc.id)] = sc.name; });
        });
        (positions?.data?.data || []).forEach((p: any) => { if (p.id) newMap[Number(p.id)] = p.name; });
        (teachers?.data?.data || []).forEach((t: any) => { if (t.id) newMap[Number(t.id)] = t.name; });
        (roles?.data?.data || []).forEach((r: any) => { if (r.id) newMap[Number(r.id)] = r.name; });

        const merged = { ...appliedLabelMap, ...newMap };
        setAppliedLabelMap(merged);
        setItem(storageKey, selections);
        setItem(labelMapKey, merged);
    }, [selections, megaCategories, categories, subCategories, positions, teachers, roles, appliedLabelMap, storageKey, labelMapKey]);

    const resetFilters = useCallback(() => {
        const empty = emptySelections();
        setSelections(empty);
        setAppliedSelections(empty);
        setCourseTypes([]);
        setAppliedCourseTypes([]);
        setSelectedStatus([]);
        setAppliedStatus([]);
        setSelectedDeviceType([]);
        setAppliedDeviceType([]);
        setSelectedPaymentMethod([]);
        setAppliedPaymentMethod([]);
        setSelectedAudience([]);
        setAppliedAudience([]);
        setAppliedLabelMap({});
        removeItem(storageKey);
        removeItem(labelMapKey);
    }, [storageKey, labelMapKey]);

    useEffect(() => {
        if (!options?.persistOnMount) {
            resetFilters();
        }
    }, []);

    const hasActiveFilters = useCallback(() => {
        return (
            appliedSelections.mega_category.length > 0 ||
            Object.keys(appliedSelections.category).length > 0 ||
            Object.keys(appliedSelections.sub_category).length > 0 ||
            appliedSelections.position_ids.length > 0 ||
            (appliedSelections?.teacher_ids && appliedSelections.teacher_ids.length > 0) ||
            (appliedSelections?.role_ids && appliedSelections.role_ids.length > 0) ||
            appliedCourseTypes.length > 0 || appliedStatus.length > 0 ||
            appliedDeviceType.length > 0 || appliedPaymentMethod.length > 0 || appliedAudience.length > 0
        );
    }, [appliedSelections, appliedCourseTypes, appliedDeviceType, appliedStatus, appliedPaymentMethod, appliedAudience]);

    const getCategoryFilterParams = useCallback((): CategoryFilterParams => {
        const params: any = {};
        if (appliedSelections.mega_category?.length > 0) params.mega_category = appliedSelections.mega_category;
        const flatCategories = Object.values(appliedSelections.category || {}).flat();
        if (flatCategories.length > 0) params.category = flatCategories;
        const flatSubCategories = Object.values(appliedSelections.sub_category || {}).flat();
        if (flatSubCategories.length > 0) params.sub_category = flatSubCategories;
        const flatPositions = Object.values(appliedSelections.position_ids || {}).flat();
        if (flatPositions.length > 0) params.positions = flatPositions;
        if (appliedSelections?.teacher_ids && appliedSelections.teacher_ids.length > 0) params.teachers = appliedSelections.teacher_ids;
        if (appliedSelections.role_ids && appliedSelections.role_ids.length > 0) params.roles = appliedSelections.role_ids;
        if (appliedCourseTypes?.length > 0) params.payment = appliedCourseTypes;
        if (appliedStatus?.length > 0) params.status = appliedStatus;
        if (appliedDeviceType?.length > 0) params.device = appliedDeviceType;
        if (appliedPaymentMethod?.length > 0) params.payment_method = appliedPaymentMethod;
        if (appliedAudience?.length > 0) params.target_audience = appliedAudience;
        return params;
    }, [appliedSelections, appliedCourseTypes, appliedDeviceType, appliedStatus, appliedPaymentMethod, appliedAudience]);

    const getSelectedCategoryFilterParams = useCallback((): CategoryFilterParams => {
        const params: any = {};
        if (selections.mega_category?.length > 0) params.mega_category = selections.mega_category;
        const flatCategories = Object.values(selections.category || {}).flat();
        if (flatCategories.length > 0) params.category = flatCategories;
        const flatSubCategories = Object.values(selections.sub_category || {}).flat();
        if (flatSubCategories.length > 0) params.sub_category = flatSubCategories;
        const flatPositions = Object.values(selections.position_ids || {}).flat();
        if (flatPositions.length > 0) params.positions = flatPositions;
        if (selections?.teacher_ids && selections.teacher_ids.length > 0) params.teachers = selections.teacher_ids;
        if (selections.role_ids && selections.role_ids.length > 0) params.roles = selections.role_ids;
        if (courseTypes?.length > 0) params.payment = courseTypes;
        if (selectedStatus?.length > 0) params.status = selectedStatus;
        if (selectedDeviceType?.length > 0) params.device = selectedDeviceType;
        if (selectedPaymentMethod?.length > 0) params.payment_method = selectedPaymentMethod;
        if (selectedAudience?.length > 0) params.target_audience = selectedAudience;
        return params;
    }, [selections, courseTypes, selectedDeviceType, selectedStatus, selectedPaymentMethod, selectedAudience]);

    const removeAppliedItem = useCallback((type: "mega" | "category" | "sub", id: number, parentId?: number) => {
        setAppliedSelections(prev => {
            const next = removeItemFromSelections(prev, type, id, parentId);
            setItem(storageKey, next);
            return next;
        });
        setSelections(prev => removeItemFromSelections(prev, type, id, parentId));
    }, [storageKey]);

    const removeAppliedPosition = useCallback((id: number) => {
        setAppliedSelections(prev => {
            const next = { ...prev, position_ids: prev.position_ids.filter(p => p !== id) };
            setItem(storageKey, next);
            return next;
        });
        setSelections(prev => ({ ...prev, position_ids: prev.position_ids.filter(p => p !== id) }));
    }, [storageKey]);

    const removeAppliedTeacher = useCallback((id: number) => {
        setAppliedSelections(prev => {
            const next = { ...prev, teacher_ids: (prev.teacher_ids || []).filter(t => t !== id) };
            setItem(storageKey, next);
            return next;
        });
        setSelections(prev => ({ ...prev, teacher_ids: (prev.teacher_ids || []).filter(t => t !== id) }));
    }, [storageKey]);

    const removeAppliedRole = useCallback((id: number) => {
        setAppliedSelections(prev => {
            const next = { ...prev, role_ids: (prev.role_ids || []).filter(r => r !== id) };
            setItem(storageKey, next);
            return next;
        });
        setSelections(prev => ({ ...prev, role_ids: (prev.role_ids || []).filter(r => r !== id) }));
    }, [storageKey]);

    const removeAppliedCourseType = useCallback((type: string) => {
        setAppliedCourseTypes(prev => prev.filter(t => t !== type));
        setCourseTypes(prev => prev.filter(t => t !== type));
    }, []);

    const removeAppliedStatus = useCallback((s: string) => {
        setAppliedStatus(prev => prev.filter(x => x !== s));
        setSelectedStatus(prev => prev.filter(x => x !== s));
    }, []);

    const removeAppliedDevice = useCallback((d: string) => {
        setAppliedDeviceType(prev => prev.filter(x => x !== d));
        setSelectedDeviceType(prev => prev.filter(x => x !== d));
    }, []);

    const removeAppliedPaymentMethod = useCallback((pm: string) => {
        setAppliedPaymentMethod(prev => prev.filter(x => x !== pm));
        setSelectedPaymentMethod(prev => prev.filter(x => x !== pm));
    }, []);

    const removeAppliedAudience = useCallback((a: string) => {
        setAppliedAudience(prev => prev.filter(x => x !== a));
        setSelectedAudience(prev => prev.filter(x => x !== a));
    }, []);

    const appliedPills = useMemo((): AppliedPill[] => {
        const pills: AppliedPill[] = [];

        appliedSelections.mega_category.forEach(id => {
            pills.push({ key: `mega-${id}`, label: appliedLabelMap[id] ?? `#${id}`, onDelete: () => removeAppliedItem("mega", id) });
        });
        Object.entries(appliedSelections.category).forEach(([parentId, catIds]) => {
            catIds.forEach(id => {
                pills.push({ key: `cat-${id}`, label: appliedLabelMap[id] ?? `#${id}`, onDelete: () => removeAppliedItem("category", id, Number(parentId)) });
            });
        });
        Object.entries(appliedSelections.sub_category).forEach(([parentId, subIds]) => {
            subIds.forEach(id => {
                pills.push({ key: `sub-${id}`, label: appliedLabelMap[id] ?? `#${id}`, onDelete: () => removeAppliedItem("sub", id, Number(parentId)) });
            });
        });
        appliedSelections.position_ids.forEach(id => {
            pills.push({ key: `pos-${id}`, label: appliedLabelMap[id] ?? `Level #${id}`, onDelete: () => removeAppliedPosition(id) });
        });
        (appliedSelections.teacher_ids || []).forEach(id => {
            pills.push({ key: `teacher-${id}`, label: appliedLabelMap[id] ?? `Teacher #${id}`, onDelete: () => removeAppliedTeacher(id) });
        });
        (appliedSelections.role_ids || []).forEach(id => {
            pills.push({ key: `role-${id}`, label: appliedLabelMap[id] ?? `Role #${id}`, onDelete: () => removeAppliedRole(id) });
        });
        appliedCourseTypes.forEach(type => {
            pills.push({ key: `type-${type}`, label: type, onDelete: () => removeAppliedCourseType(type) });
        });
        appliedStatus.forEach(s => {
            pills.push({ key: `status-${s}`, label: s, onDelete: () => removeAppliedStatus(s) });
        });
        appliedDeviceType.forEach(d => {
            pills.push({ key: `device-${d}`, label: d, onDelete: () => removeAppliedDevice(d) });
        });
        appliedPaymentMethod.forEach(pm => {
            pills.push({ key: `pm-${pm}`, label: pm, onDelete: () => removeAppliedPaymentMethod(pm) });
        });
        appliedAudience.forEach(a => {
            pills.push({ key: `audience-${a}`, label: a, onDelete: () => removeAppliedAudience(a) });
        });

        return pills;
    }, [
        appliedSelections, appliedCourseTypes, appliedStatus, appliedDeviceType, appliedPaymentMethod, appliedAudience, appliedLabelMap,
        removeAppliedItem, removeAppliedPosition, removeAppliedTeacher, removeAppliedRole,
        removeAppliedCourseType, removeAppliedStatus, removeAppliedDevice, removeAppliedPaymentMethod, removeAppliedAudience,
    ]);

    return {
        selections,
        appliedSelections,
        appliedCourseTypes,
        appliedLabelMap,
        appliedPills,
        searchTeacher,
        setSearchTeacher,
        filterDialogOpen,
        setFilterDialogOpen,
        courseTypes,
        device: selectedDeviceType,
        status: selectedStatus,
        paymentMethod: selectedPaymentMethod,
        targetAudience: selectedAudience,
        megaCategories: megaCategories?.data || [],
        categories: categories?.data || [],
        subCategories: subCategories?.data || [],
        positions: positions?.data?.data || [],
        teachers: teachers?.data?.data || [],
        roles: roles?.data?.data || [],
        loadingMegaCategory,
        activeTab,
        setActiveTab,
        handleCategoryChange,
        handleApplyFilter,
        resetFilters,
        removeAppliedItem,
        removeAppliedPosition,
        removeAppliedTeacher,
        removeAppliedRole,
        removeAppliedCourseType,
        removeAppliedStatus,
        removeAppliedDevice,
        removeAppliedPaymentMethod,
        removeAppliedAudience,
        hasActiveFilters: hasActiveFilters(),
        getCategoryFilterParams,
        getSelectedCategoryFilterParams,
    };
};
