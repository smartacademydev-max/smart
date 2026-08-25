import { Add } from "@mui/icons-material";
import { Box, Button, InputLabel, OutlinedInput, Typography } from "@mui/material";
import { useRef } from "react";
import {
    HIGHLIGHT_COLORS,
    type HighlightSpanProps,
    type HighlightTypeProps
} from "../../../../types/question";

interface Props {
    passage: string;
    types: HighlightTypeProps[];
    spans: HighlightSpanProps[];
    activeType: string;
    error?: string;
    onPassageChange: (value: string) => void;
    onTypesChange: (types: HighlightTypeProps[]) => void;
    onSpansChange: (spans: HighlightSpanProps[]) => void;
    onActiveTypeChange: (key: string) => void;
    /**
     * Applies passage, types and spans together. Setting them one at a time
     * meant each write read a stale config and clobbered the previous one.
     */
    onLoadExample: (
        passage: string,
        types: HighlightTypeProps[],
        spans: HighlightSpanProps[]
    ) => void;
}

/**
 * Authoring for a highlight question: the passage, the coloured categories to
 * mark it with, and the spans the author marks as correct.
 *
 * The passage is deliberately plain text, not rich text. The answer is stored
 * as character offsets, and HTML tags would shift every offset the moment the
 * markup changed — a silently corrupted answer key.
 */
export default function HighlightEditor({
    passage,
    types,
    spans,
    activeType,
    error,
    onPassageChange,
    onTypesChange,
    onSpansChange,
    onActiveTypeChange,
    onLoadExample
}: Props) {
    const passageRef = useRef<HTMLDivElement>(null);

    const colorFor = (key: string) =>
        types.find((t) => t.key === key)?.color ?? HIGHLIGHT_COLORS[2];

    /**
     * Two types sharing a colour are indistinguishable once highlighted, so a
     * colour already in use is never offered — not merely discouraged.
     */
    const takenColors = types.map((t) => t.color).filter(Boolean) as string[];
    const firstFreeColor = HIGHLIGHT_COLORS.find((c) => !takenColors.includes(c));
    const allColorsUsed = firstFreeColor === undefined;

    const addType = () => {
        if (allColorsUsed) return;

        // Keys must stay unique even after removals, so they are derived from
        // the highest existing key rather than the current count.
        const nextIndex = types.reduce((max, t) => {
            const n = Number(t.key.replace("type_", ""));
            return Number.isFinite(n) ? Math.max(max, n) : max;
        }, 0) + 1;

        onTypesChange([
            ...types,
            { key: `type_${nextIndex}`, label: "", color: firstFreeColor }
        ]);
    };

    const updateType = (index: number, patch: Partial<HighlightTypeProps>) => {
        // Never let a colour change collide with another type's colour.
        if (patch.color && types.some((t, i) => i !== index && t.color === patch.color)) {
            return;
        }

        onTypesChange(types.map((t, i) => (i === index ? { ...t, ...patch } : t)));
    };

    const removeType = (index: number) => {
        const removed = types[index];
        onTypesChange(types.filter((_, i) => i !== index));
        // Spans of a deleted type would reference a category that no longer
        // exists, so they go with it.
        onSpansChange(spans.filter((s) => s.type !== removed.key));
    };

    /**
     * Turns the browser's current text selection into a span, using offsets
     * measured against the passage's plain text.
     */
    const markSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !passageRef.current) return;

        const range = selection.getRangeAt(0);
        if (!passageRef.current.contains(range.commonAncestorContainer)) return;

        const before = range.cloneRange();
        before.selectNodeContents(passageRef.current);
        before.setEnd(range.startContainer, range.startOffset);

        const start = before.toString().length;
        const end = start + range.toString().length;

        if (end <= start) return;

        // Replace any span this one overlaps rather than stacking them, so the
        // answer key never holds two conflicting marks over the same words.
        const kept = spans.filter((s) => s.end <= start || s.start >= end);

        onSpansChange([...kept, { type: activeType, start, end }].sort((a, b) => a.start - b.start));
        selection.removeAllRanges();
    };

    /** Renders the passage with the author's marks painted in. */
    const renderMarkedPassage = () => {
        if (!passage) return null;

        const ordered = [...spans].sort((a, b) => a.start - b.start);
        const pieces: React.ReactNode[] = [];
        let cursor = 0;

        ordered.forEach((span, i) => {
            if (span.start > cursor) {
                pieces.push(<span key={`t-${i}`}>{passage.slice(cursor, span.start)}</span>);
            }

            pieces.push(
                <mark
                    key={`m-${i}`}
                    title={`${types.find((t) => t.key === span.type)?.label || span.type} — click to remove`}
                    onClick={() => onSpansChange(spans.filter((s) => s !== span))}
                    style={{
                        background: colorFor(span.type),
                        cursor: "pointer",
                        borderRadius: 3,
                        padding: "1px 2px"
                    }}
                >
                    {passage.slice(span.start, span.end)}
                </mark>
            );

            cursor = span.end;
        });

        if (cursor < passage.length) {
            pieces.push(<span key="tail">{passage.slice(cursor)}</span>);
        }

        return pieces;
    };

    /** A complete worked example, so the format explains itself. */
    const loadExample = () => {
        const text =
            "Vital signs: temperature 39.1 C, heart rate 122, respiratory rate 8, "
            + "blood pressure 118/74, oxygen saturation 86%. The client is drowsy "
            + "and reports new-onset confusion.";

        const mark = (needle: string) => ({
            type: "type_1",
            start: text.indexOf(needle),
            end: text.indexOf(needle) + needle.length
        });

        onLoadExample(
            text,
            [{ key: "type_1", label: "Requires action", color: HIGHLIGHT_COLORS[1] }],
            [mark("respiratory rate 8"), mark("oxygen saturation 86%"), mark("new-onset confusion")]
        );
        onActiveTypeChange("type_1");
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <Box className="rounded-lg p-3" sx={{ border: 1, borderColor: "divider" }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <Typography variant="subtitle2">How a highlight question works</Typography>
                        <Typography variant="caption" color="text.secondary" component="div">
                            1. In <strong>Question</strong> above, write the instruction — e.g.
                            "Highlight the findings that require immediate follow-up."<br />
                            2. Paste the text the student reads into <strong>Text for review</strong> below.<br />
                            3. Name your highlight types and pick a colour for each.<br />
                            4. Select the correct words in the passage to mark the answer.
                        </Typography>
                    </div>
                    <Button size="small" variant="outlined" onClick={loadExample}>
                        Fill in an example
                    </Button>
                </div>
            </Box>

            <div className="input__field">
                <InputLabel>Text for review (no images are allowed)</InputLabel>
                <OutlinedInput
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Paste the passage the student will highlight"
                    value={passage}
                    onChange={(e) => onPassageChange(e.target.value)}
                />
                <Typography variant="caption" color="text.secondary">
                    Plain text only — the answer is stored as character positions, so formatting
                    would shift it.
                </Typography>
            </div>

            <div className="flex flex-col gap-2">
                <Typography variant="subtitle2">Highlight types</Typography>
                {types.map((type, index) => (
                    <div key={index} className="flex items-center gap-2 flex-wrap">
                        <OutlinedInput
                            size="small"
                            placeholder="Label (e.g. Like)"
                            value={type.label ?? ""}
                            onChange={(e) => updateType(index, { label: e.target.value })}
                        />
                        <div className="flex items-center gap-1">
                            {HIGHLIGHT_COLORS.map((color) => {
                                const selected = type.color === color;
                                // Dimmed and unclickable when another type owns it.
                                const taken = !selected && takenColors.includes(color);

                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        disabled={taken}
                                        title={taken ? "Already used by another type" : undefined}
                                        aria-label={`Use ${color}`}
                                        aria-pressed={selected}
                                        onClick={() => updateType(index, { color })}
                                        style={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: 4,
                                            background: color,
                                            /**
                                             * A ring drawn in the theme's own colour
                                             * plus a tick: a dark outline was invisible
                                             * against the dark dashboard.
                                             */
                                            outline: selected ? "2px solid currentColor" : "none",
                                            outlineOffset: 2,
                                            border: "1px solid rgba(0,0,0,0.25)",
                                            opacity: taken ? 0.25 : 1,
                                            cursor: taken ? "not-allowed" : "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#111",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            lineHeight: 1
                                        }}
                                    >
                                        {selected ? "✓" : ""}
                                    </button>
                                );
                            })}
                        </div>
                        {types.length > 1 && (
                            <Button color="error" size="small" onClick={() => removeType(index)}>
                                Remove
                            </Button>
                        )}
                    </div>
                ))}
                <Button
                    variant="text"
                    size="small"
                    startIcon={<Add />}
                    onClick={addType}
                    disabled={allColorsUsed}
                    className="self-start font-medium!"
                >
                    {allColorsUsed ? `All ${HIGHLIGHT_COLORS.length} colours in use` : "Add type"}
                </Button>
            </div>

            {!passage && (
                <Typography variant="caption" color="text.secondary">
                    Add the text above, and the passage will appear here for you to mark the
                    correct answer.
                </Typography>
            )}

            {passage && (
                <Box
                    className="flex flex-col gap-2 rounded-lg p-3"
                    /**
                     * Given prominence on purpose: this is the step authors miss,
                     * because it looks like a preview rather than something to
                     * interact with.
                     */
                    sx={{ border: 2, borderColor: "primary.main" }}
                >
                    <Typography variant="subtitle2" color="primary">
                        Step 4 — select the correct words below
                    </Typography>

                    <div className="flex items-center gap-2 flex-wrap">
                        {types.map((type) => (
                            <Button
                                key={type.key}
                                size="small"
                                variant={activeType === type.key ? "contained" : "outlined"}
                                onClick={() => onActiveTypeChange(type.key)}
                                sx={{
                                    background: activeType === type.key ? type.color : undefined,
                                    borderColor: type.color,
                                    color: activeType === type.key ? "#111" : undefined
                                }}
                            >
                                {type.label || type.key}
                            </Button>
                        ))}
                        <Button size="small" onClick={markSelection} variant="outlined">
                            Highlight selection
                        </Button>
                        <Button size="small" color="error" onClick={() => onSpansChange([])}>
                            Clear
                        </Button>
                    </div>

                    <Box
                        ref={passageRef}
                        onMouseUp={markSelection}
                        className="rounded-lg p-3 leading-relaxed"
                        sx={{ border: 1, borderColor: "divider", whiteSpace: "pre-wrap", userSelect: "text" }}
                    >
                        {renderMarkedPassage()}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                        Drag across the text with your mouse to highlight it. Click a highlight to
                        remove it.
                        {spans.length > 0 && ` ${spans.length} marked.`}
                    </Typography>
                </Box>
            )}

            {error && (
                <Typography variant="caption" color="error">{error}</Typography>
            )}
        </div>
    );
}
