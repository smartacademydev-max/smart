import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    InputLabel,
    OutlinedInput,
    Switch,
    Tooltip,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useGetPointsConfigQuery, useUpdatePointsConfigMutation } from "../../../../services/referralApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { PointsRule } from "../../../../types/referral";

type RuleRow = PointsRule & { _isNew?: boolean };

const slugify = (s: string) =>
    s.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").replace(/_+/g, "_").replace(/^_|_$/g, "");

export default function ReferralConfigPage() {
    const dispatch = useAppDispatch();
    const { data, isLoading } = useGetPointsConfigQuery();
    const [updateConfig, { isLoading: saving }] = useUpdatePointsConfigMutation();

    const [conversionRate, setConversionRate] = useState<string>("");
    const [rules, setRules] = useState<RuleRow[]>([]);

    useEffect(() => {
        if (data?.data) {
            setConversionRate(String(data.data.conversion_rate ?? ""));
            setRules(data.data.rules ?? []);
        }
    }, [data]);

    const handleChange = (idx: number, field: keyof PointsRule, value: string | number | boolean) => {
        setRules((prev) =>
            prev.map((r, i) => {
                if (i !== idx) return r;
                const updated = { ...r, [field]: value };
                if (field === "action_label" && r._isNew) {
                    updated.action_key = slugify(String(value));
                }
                return updated;
            })
        );
    };


    const handleDelete = (idx: number) => {
        setRules((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        const rate = Number(conversionRate);
        if (!conversionRate || rate <= 0) {
            dispatch(showToast({ message: "Please enter a valid conversion rate.", severity: "error" }));
            return;
        }
        for (const r of rules) {
            if (!r.action_key || !r.action_label) {
                dispatch(showToast({ message: "All rules must have an action key and label.", severity: "error" }));
                return;
            }
        }
        try {
            const payload = rules.map(({ _isNew, ...r }) => r);
            const res = await updateConfig({ rules: payload, conversion_rate: rate }).unwrap();
            dispatch(showToast({ message: res.message || "Configuration saved.", severity: "success" }));
        } catch (e: any) {
            dispatch(showToast({ message: e?.data?.message || "Unable to save configuration.", severity: "error" }));
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="pb-4 lg:pb-6">
            <Typography variant="h5">Referral & Points Configuration</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
                Define how many points users earn per action, and set the points-to-money conversion rate.
            </Typography>

            <Divider className="mt-4! mb-6!" />

            {/* Conversion Rate */}
            <Box mb={4} maxWidth={400}>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    Points-to-Money Conversion
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    How many points equal Rs. 1 during checkout redemption.
                </Typography>
                <div className="input__field">
                    <InputLabel required>Points per Rs. 1</InputLabel>
                    <OutlinedInput
                        fullWidth
                        type="number"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(e.target.value)}
                        placeholder="e.g. 100"
                        inputProps={{ min: 1 }}
                        endAdornment={
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap", pr: 1 }}>
                                pts = Rs. 1
                            </Typography>
                        }
                    />
                </div>
            </Box>

            <Divider className="mb-6!" />

            {/* Earning Rules header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                    Earning Rules
                </Typography>

            </Box>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Set how many points each action earns. Disable any rule to stop awarding points for it.
            </Typography>

            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                {/* Header row */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 140px 64px 44px",
                        px: 2,
                        py: 1.25,
                        bgcolor: "action.hover",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase" }}>
                        Action
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", textAlign: "center" }}>
                        Points
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", textAlign: "center" }}>
                        Active
                    </Typography>
                    <span />
                </Box>

                {rules.length === 0 && (
                    <Box py={5} textAlign="center">
                        <Typography variant="body2" color="text.disabled">
                            No rules yet. Click "Add Rule" to get started.
                        </Typography>
                    </Box>
                )}

                {rules.map((rule, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 140px 64px 44px",
                            px: 2,
                            py: 1,
                            alignItems: "center",
                            borderBottom: idx < rules.length - 1 ? "1px solid" : "none",
                            borderColor: "divider",
                            opacity: rule.is_active ? 1 : 0.55,
                        }}
                    >
                        {/* Label + key */}
                        <Box pr={1}>
                            <OutlinedInput
                                fullWidth
                                size="small"
                                placeholder="Action label"
                                value={rule.action_label}
                                onChange={(e) => handleChange(idx, "action_label", e.target.value)}
                            />
                            {rule._isNew ? (
                                <OutlinedInput
                                    fullWidth
                                    size="small"
                                    placeholder="action_key (e.g. course_completion)"
                                    value={rule.action_key}
                                    onChange={(e) => handleChange(idx, "action_key", slugify(e.target.value))}
                                    sx={{ mt: 0.5, "& input": { fontFamily: "monospace", fontSize: "0.72rem" } }}
                                />
                            ) : (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        mt: 0.25,
                                        fontFamily: "monospace",
                                        color: "text.disabled",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {rule.action_key}
                                </Typography>
                            )}
                        </Box>

                        {/* Points */}
                        <Box px={1}>
                            <OutlinedInput
                                fullWidth
                                size="small"
                                type="number"
                                value={rule.points}
                                onChange={(e) => handleChange(idx, "points", Number(e.target.value))}
                                disabled={!rule.is_active}
                                inputProps={{ min: 0 }}
                                sx={{ "& input": { textAlign: "center" } }}
                            />
                        </Box>

                        {/* Active */}
                        <Box display="flex" justifyContent="center">
                            <Switch
                                size="small"
                                checked={rule.is_active}
                                onChange={(e) => handleChange(idx, "is_active", e.target.checked)}
                                color="primary"
                            />
                        </Box>

                        {/* Delete */}
                        <Box display="flex" justifyContent="center">
                            <Tooltip title="Remove rule">
                                <IconButton size="small" color="error" onClick={() => handleDelete(idx)}>
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Divider className="mt-6! mb-4!" />

            <Box display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    {saving ? "Saving..." : "Save Configuration"}
                </Button>
            </Box>
        </div>
    );
}
