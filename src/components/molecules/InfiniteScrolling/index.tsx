import { Box, Checkbox, CircularProgress, Divider, FormControlLabel, InputAdornment, OutlinedInput, Typography, useTheme } from "@mui/material";
import { SearchNormal1 } from "iconsax-reactjs";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { v4 as uuidv4 } from "uuid";
import { renderHtml } from "../../../utils/renderHtml";

interface InfiniteScrollingProps {
    data: any[];
    hasMore: boolean;
    selectedItems: number[];
    onSelectionChange: (selectedIds: number[]) => void;
    fetchMore: () => void;
    onSearch: (searchTerm: string) => void;
    loading?: boolean;
    maxSelection?: number;
    itemLabelKey?: string;
    itemIdKey?: string;
    placeholder?: string;
    scrollableId?: string;
    /** Dot-notation path to group items by (e.g. "label.name"). Falls back to grouping by created_at date. */
    groupLabelKey?: string;
}

export default function InfiniteScrolling({
    data,
    hasMore,
    selectedItems,
    onSelectionChange,
    fetchMore,
    onSearch,
    loading = false,
    maxSelection = 100,
    itemLabelKey = "name",
    itemIdKey = "id",
    placeholder = "Search...",
    scrollableId = "scrollableDiv",
    groupLabelKey,
}: InfiniteScrollingProps) {

    const theme = useTheme();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSearch(value);
        }, 400);
    };

    // --- Map stable UUIDs to each itemId so they don't regenerate every render ---
    const [uuidMap, setUuidMap] = useState<Record<number, string>>({});

    useEffect(() => {
        const newMap = { ...uuidMap };

        data.forEach((item) => {
            const itemId = item[itemIdKey];
            if (!newMap[itemId]) {
                newMap[itemId] = uuidv4();
            }
        });

        setUuidMap(newMap);
    }, [data]);

    const handleToggle = (id: number) => {
        if (selectedItems.includes(id)) {
            onSelectionChange(selectedItems.filter(i => i !== id));
        } else if (selectedItems.length < maxSelection) {
            onSelectionChange([...selectedItems, id]);
        }
    };

    const isMaxReached = selectedItems.length >= maxSelection;

    // --- Resolve a dot-notation path from an object ---
    const resolvePath = (obj: any, path: string): string => {
        return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? 'Uncategorized';
    };

    // --- Group items by label key or created_at date ---
    const groupedData = data.reduce((acc: Record<string, any[]>, item) => {
        const groupKey = groupLabelKey
            ? resolvePath(item, groupLabelKey)
            : new Date(item.created_at).toDateString();

        if (!acc[groupKey]) acc[groupKey] = [];
        acc[groupKey].push(item);

        return acc;
    }, {});

    // --- Select / deselect all items in a group ---
    const handleGroupToggle = (items: any[]) => {
        const ids = items.map(item => item[itemIdKey]);
        const allSelected = ids.every(id => selectedItems.includes(id));

        if (allSelected) {
            onSelectionChange(selectedItems.filter(id => !ids.includes(id)));
        } else {
            const toAdd = ids.filter(id => !selectedItems.includes(id));
            const remaining = maxSelection - selectedItems.length;
            onSelectionChange([...selectedItems, ...toAdd.slice(0, remaining)]);
        }
    };

    return (
        <Box
            sx={{
                border: `1px solid ${theme.palette.separator.dark}`,
                borderRadius: 1,
                overflow: 'hidden',
                padding: "8px",
                marginTop: "8px"
            }}
        >
            {/* Search */}
            <OutlinedInput
                fullWidth
                size="small"
                placeholder={placeholder}
                onChange={handleSearchChange}
                sx={{ mb: 1 }}
                startAdornment={
                    <InputAdornment position="start">
                        <SearchNormal1 size={16} />
                    </InputAdornment>
                }
            />

            {/* Scrollable List */}
            <Box id={scrollableId} sx={{ height: 200, overflow: "auto" }}>
                {loading && data.length === 0 ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : (
                    <InfiniteScroll
                        dataLength={data.length}
                        next={fetchMore}
                        hasMore={hasMore}
                        scrollableTarget={scrollableId}
                        loader={
                            <Box sx={{ textAlign: "center", p: 2 }}>
                                <CircularProgress size={22} />
                            </Box>
                        }
                    // endMessage={
                    //     data.length > 0 && (
                    //         <Typography variant="caption" sx={{ display: "block", textAlign: "center", p: 2 }}>
                    //             No more items
                    //         </Typography>
                    //     )
                    // }
                    >
                        {data.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: "center" }}>
                                <Typography variant="body2" color="text.secondary">
                                    {"No items available"}
                                </Typography>
                            </Box>
                        ) : (
                            Object.entries(groupedData).map(([groupKey, items]) => {
                                const groupIds = items.map(item => item[itemIdKey]);
                                const allGroupSelected = groupIds.every(id => selectedItems.includes(id));
                                const someGroupSelected = groupIds.some(id => selectedItems.includes(id));

                                return (
                                    <Box key={groupKey}>
                                        {/* Group Label */}
                                        <Box className="flex items-center gap-2 py-1 px-1">
                                            {groupLabelKey && (
                                                <Checkbox
                                                    size="small"
                                                    checked={allGroupSelected}
                                                    indeterminate={!allGroupSelected && someGroupSelected}
                                                    onChange={() => handleGroupToggle(items)}
                                                    sx={{ p: 0 }}
                                                />
                                            )}
                                            <Typography variant="subtitle2" fontWeight={600} color="text.dark" className="text-nowrap">
                                                {groupKey}
                                            </Typography>
                                            <Divider sx={{
                                                color: (theme) => theme.palette.separator.dark,
                                                // width: "100%",
                                                my: "4px"
                                            }} />
                                        </Box>

                                        {items.map((item) => {
                                            const itemId = item[itemIdKey];
                                            const stableKey = uuidMap[itemId];
                                            const isSelected = selectedItems.includes(itemId);

                                            return (
                                                <Box
                                                    key={stableKey}
                                                    className="item__wrapper flex flex-col "
                                                >
                                                    <FormControlLabel
                                                        sx={{ m: 0, p: .5, width: "100%" }}
                                                        control={
                                                            <Checkbox
                                                                checked={isSelected}
                                                                disabled={!isSelected && isMaxReached}
                                                                onChange={() => handleToggle(itemId)}
                                                            />
                                                        }
                                                        label={
                                                            <Box>
                                                                <Typography variant="subtitle1">
                                                                    {renderHtml(item[itemLabelKey])}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                );
                            })
                        )}
                    </InfiniteScroll>
                )}
            </Box>

            {isMaxReached && (
                <Box sx={{ p: 1, bgcolor: "warning.light", borderTop: "1px solid", borderColor: "divider" }}>
                    <Typography variant="caption" color="warning.dark">
                        Maximum selection limit reached ({maxSelection})
                    </Typography>
                </Box>
            )}
        </Box>
    );
}