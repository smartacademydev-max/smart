import { Add, DeleteOutline } from "@mui/icons-material";
import {
    Box,
    Button,
    Checkbox,
    InputLabel,
    OutlinedInput,
    Typography,
    useTheme,
    type Theme
} from "@mui/material";
import {
    BOW_TIE_DEFAULT_AREA_TITLES,
    BOW_TIE_DEFAULT_GROUPS,
    type OptionProps,
    type QuestionConfigProps,
    type QuestionGroupProps
} from "../../../../types/question";
import { useEffect } from "react";
import { stripHtml } from "../../../../utils/questionText";

interface Props {
    groups: QuestionGroupProps[];
    options: OptionProps[];
    config: QuestionConfigProps | null | undefined;
    /** Shown in the preview so the author sees the stem with the diagram. */
    question?: string;
    error?: string;
    onGroupsChange: (groups: QuestionGroupProps[]) => void;
    onOptionsChange: (options: OptionProps[]) => void;
    onConfigChange: (patch: Partial<QuestionConfigProps>) => void;
    /**
     * Seeds groups, options and config together. Writing them one at a time
     * meant each write read a stale config and clobbered the previous one —
     * the same trap HighlightEditor's onLoadExample avoids.
     */
    onLoadExample: (
        groups: QuestionGroupProps[],
        options: OptionProps[],
        config: Partial<QuestionConfigProps>
    ) => void;
}

/**
 * Authoring for a bow-tie question, laid out as a split screen: the response
 * groups on the left, a live diagram of what the student will see on the right.
 *
 * Responses are plain single-line inputs rather than rich-text editors. A tile
 * is a few words that has to fit inside a drop area, and a stack of full
 * CKEditor boxes buried the shape of the question in scroll.
 */
/**
 * One colour per column, so a response stays visually tied to the group it
 * came from. Matches what the student sees when answering.
 */
const zonePaletteFor = (theme: Theme, index: number) =>
    [theme.palette.success, theme.palette.secondary, theme.palette.info][index % 3];

export default function BowTieEditor({
    groups,
    options,
    config,
    question,
    error,
    onGroupsChange,
    onOptionsChange,
    onConfigChange,
    onLoadExample
}: Props) {
    const theme = useTheme();
    /**
     * One diagram title per response group. Kept the same length as `groups`
     * rather than stored free-form: adding a group would otherwise leave its
     * drop areas unlabelled, and removing one would strand an orphan title.
     */
    const areaTitles = groups.map(
        (group, index) =>
            config?.response_area_titles?.[index] ??
            BOW_TIE_DEFAULT_AREA_TITLES[index] ??
            group.label ??
            ""
    );

    const setAreaTitle = (index: number, value: string) => {
        onConfigChange({
            response_area_titles: areaTitles.map((existing, i) => (i === index ? value : existing))
        });
    };

    /**
     * Items authored before this editor stored their tiles as CKEditor HTML.
     * The inputs show plain text, so the markup is flattened once on load —
     * otherwise editing one tile would save plain text while its untouched
     * siblings kept their tags, and the student would see a mix of both.
     */
    useEffect(() => {
        const hasHtml = options.some((option) => /<[^>]+>/.test(option.option));

        if (hasHtml) {
            onOptionsChange(
                options.map((option) => ({ ...option, option: stripHtml(option.option) }))
            );
        }
        // Runs only when a different question is loaded into the editor.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.length]);

    const optionsOf = (groupKey: string) =>
        options
            .map((option, index) => ({ option, index }))
            .filter(({ option }) => option.group_key === groupKey);

    const setGroup = (groupIndex: number, patch: Partial<QuestionGroupProps>) => {
        onGroupsChange(groups.map((group, i) => (i === groupIndex ? { ...group, ...patch } : group)));
    };

    const addResponse = (groupKey: string) => {
        onOptionsChange([
            ...options,
            { id: null, option: "", is_correct: false, position: options.length, group_key: groupKey }
        ]);
    };

    const removeResponse = (optionIndex: number) => {
        onOptionsChange(
            options.filter((_, i) => i !== optionIndex).map((option, i) => ({ ...option, position: i }))
        );
    };

    const setResponse = (optionIndex: number, patch: Partial<OptionProps>) => {
        onOptionsChange(options.map((option, i) => (i === optionIndex ? { ...option, ...patch } : option)));
    };

    /**
     * A response is ticked independently of its siblings: a bow-tie column
     * routinely needs two correct answers, which is exactly what the old
     * shared editor's single-choice radio made impossible to author.
     */
    const toggleCorrect = (optionIndex: number) => {
        setResponse(optionIndex, { is_correct: !options[optionIndex].is_correct });
    };

    const loadExample = () => {
        const tiles: [string, string, boolean][] = [
            ["actions", "Administer oxygen at 2 L/min via nasal cannula", true],
            ["actions", "Request an order for 50% dextrose in water to be administered intravenously.", true],
            ["actions", "Insert a peripheral venous access device (VAD)", false],
            ["conditions", "Hypoglycemia", true],
            ["conditions", "Bell's palsy", false],
            ["conditions", "Ischemic stroke", false],
            ["parameters", "Serum glucose level", true],
            ["parameters", "Neurologic status", true],
            ["parameters", "Urine output", false]
        ];

        onLoadExample(
            BOW_TIE_DEFAULT_GROUPS,
            tiles.map(([group_key, option, is_correct], position) => ({
                id: null,
                option,
                is_correct,
                position,
                group_key
            })),
            {
                groups: BOW_TIE_DEFAULT_GROUPS,
                response_area_titles: BOW_TIE_DEFAULT_AREA_TITLES,
                scoring_type: "partial_match_per_element"
            }
        );
    };

    return (
        <Box className="flex flex-col gap-4">
            <Box className="flex items-start justify-between gap-4">
                <Box>
                    <Typography variant="subtitle1" color="text.primary">
                        Answer Options
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Each response group is a column the student drags from. Tick as many correct
                        responses as the group has drop areas.
                    </Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={loadExample} className="shrink-0">
                    Load example
                </Button>
            </Box>

            {error && (
                <Typography variant="caption" color="error">
                    {error}
                </Typography>
            )}

            <Box className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Authoring */}
                <Box className="flex flex-col gap-4">
                    <Box className="flex flex-col gap-2">
                        <InputLabel>Response area titles</InputLabel>
                        <Typography variant="caption" color="text.secondary">
                            The labels on the diagram, which usually read differently from the group
                            titles below.
                        </Typography>
                        {areaTitles.map((title, index) => (
                            <Box key={groups[index]?.key ?? index} className="flex items-center gap-2">
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    className="w-28 shrink-0 truncate"
                                    title={groups[index]?.label || groups[index]?.key}
                                >
                                    {groups[index]?.label || `Group ${index + 1}`}
                                </Typography>
                                <OutlinedInput
                                    size="small"
                                    fullWidth
                                    value={title}
                                    placeholder={
                                        BOW_TIE_DEFAULT_AREA_TITLES[index] ?? "Response area title"
                                    }
                                    onChange={(e) => setAreaTitle(index, e.target.value)}
                                />
                            </Box>
                        ))}
                    </Box>

                    {groups.map((group, groupIndex) => {
                        const groupOptions = optionsOf(group.key);
                        const dropAreas = group.count ?? 1;
                        const ticked = groupOptions.filter(({ option }) => option.is_correct).length;
                        const mismatch = ticked !== dropAreas;

                        return (
                            <Box
                                key={group.key}
                                className="flex flex-col gap-3 rounded-lg p-3"
                                sx={{ border: "1px solid", borderColor: theme.palette.separator.dark }}
                            >
                                <Typography variant="subtitle2" color="text.primary">
                                    Column {groupIndex + 1}
                                </Typography>

                                <Box className="flex gap-2">
                                    <Box className="flex flex-1 flex-col gap-1">
                                        <InputLabel>Title</InputLabel>
                                        <OutlinedInput
                                            size="small"
                                            fullWidth
                                            value={group.label ?? ""}
                                            placeholder="e.g. Actions to Take"
                                            onChange={(e) => setGroup(groupIndex, { label: e.target.value })}
                                        />
                                    </Box>
                                    <Box className="flex w-24 shrink-0 flex-col gap-1">
                                        <InputLabel>Slots</InputLabel>
                                        <OutlinedInput
                                            size="small"
                                            type="number"
                                            inputProps={{ min: 1 }}
                                            value={dropAreas}
                                            onChange={(e) =>
                                                setGroup(groupIndex, {
                                                    count: Math.max(1, Number(e.target.value) || 1)
                                                })
                                            }
                                        />
                                    </Box>
                                </Box>

                                <Box className="flex flex-col gap-1">
                                    <InputLabel>Possible responses</InputLabel>
                                    <Typography
                                        variant="caption"
                                        color={mismatch ? "error" : "text.secondary"}
                                    >
                                        {ticked} of {dropAreas} correct ticked
                                        {mismatch ? " — these must match before you can save." : "."}
                                    </Typography>
                                </Box>

                                {groupOptions.map(({ option, index }) => (
                                    <Box key={index} className="flex items-center gap-2">
                                        <Checkbox
                                            size="small"
                                            checked={!!option.is_correct}
                                            onChange={() => toggleCorrect(index)}
                                            title="Mark correct"
                                        />
                                        <OutlinedInput
                                            size="small"
                                            fullWidth
                                            multiline
                                            value={option.option}
                                            placeholder="Response text"
                                            onChange={(e) => setResponse(index, { option: e.target.value })}
                                        />
                                        {groupOptions.length > 1 && (
                                            <Button
                                                size="small"
                                                color="error"
                                                className="min-w-0!"
                                                onClick={() => removeResponse(index)}
                                                title="Delete response"
                                            >
                                                <DeleteOutline fontSize="small" />
                                            </Button>
                                        )}
                                    </Box>
                                ))}

                                <Box>
                                    <Button
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={() => addResponse(group.key)}
                                    >
                                        Add
                                    </Button>
                                </Box>
                            </Box>
                        );
                    })}

                </Box>

                {/* Live preview */}
                <Box className="flex flex-col gap-4 lg:sticky lg:top-0 lg:self-start">
                    <Box
                        className="flex flex-col gap-5 rounded-lg p-4"
                        sx={{ border: "1px solid", borderColor: theme.palette.separator.dark }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            Preview
                        </Typography>

                        {question && stripHtml(question) && (
                            <Typography variant="body2" color="text.primary">
                                {stripHtml(question)}
                            </Typography>
                        )}

                        <BowTieDiagram groups={groups} areaTitles={areaTitles} theme={theme} />

                        <Box className="flex flex-wrap gap-3">
                            {groups.map((group, groupIndex) => (
                                <Box key={group.key} className="min-w-32 flex-1">
                                    <Box
                                        className="rounded-t px-2 py-1 text-center"
                                        sx={{
                                            border: "1px solid",
                                            borderColor: zonePaletteFor(theme, groupIndex).main,
                                            backgroundColor: zonePaletteFor(theme, groupIndex).main
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{ color: zonePaletteFor(theme, groupIndex).contrastText }}
                                        >
                                            {group.label || group.key}
                                        </Typography>
                                    </Box>
                                    <Box
                                        className="flex flex-col gap-1 rounded-b p-1"
                                        sx={{
                                            border: "1px solid",
                                            borderTop: 0,
                                            borderColor: zonePaletteFor(theme, groupIndex).main
                                        }}
                                    >
                                        {optionsOf(group.key).map(({ option, index }) => (
                                            <Box
                                                key={index}
                                                className="rounded px-2 py-1"
                                                sx={{
                                                    border: "1px solid",
                                                    borderColor: zonePaletteFor(theme, groupIndex).main,
                                                    backgroundColor: option.is_correct
                                                        ? zonePaletteFor(theme, groupIndex).light
                                                        : "transparent"
                                                }}
                                            >
                                                <Typography variant="caption" color="text.primary">
                                                    {stripHtml(option.option) || "—"}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                            Highlighted responses are the correct answers. The student never sees
                            them highlighted.
                        </Typography>
                    </Box>

                </Box>
            </Box>
        </Box>
    );
}

/**
 * The bow-tie itself: each response group's drop areas stacked in its own
 * column, so the author can see the shape the student will be filling in.
 */
function BowTieDiagram({
    groups,
    areaTitles,
    theme
}: {
    groups: QuestionGroupProps[];
    areaTitles: string[];
    theme: Theme;
}) {
    return (
        <Box className="flex items-center justify-between gap-2">
            {groups.map((group, index) => (
                <Box key={group.key} className="flex flex-1 flex-col justify-center gap-2">
                    {Array.from({ length: group.count ?? 1 }).map((_, slot) => (
                        <Box
                            key={slot}
                            className="rounded px-2 py-3 text-center"
                            sx={{
                                border: "1px dashed",
                                borderColor: theme.palette.separator.dark
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                {areaTitles[index] || group.label || group.key}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}
