import {
    Box,
    Button,
    CircularProgress,
    Divider,
    InputLabel,
    OutlinedInput,
    Switch,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useGetPointsConfigQuery, useUpdatePointsConfigMutation } from "../../../../services/referralApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { PointsRule } from "../../../../types/referral";

const DEFAULT_RULES: PointsRule[] = [
    { action_key: "referral_registration", action_label: "Referral Registration (referrer earns)", points: 10, is_active: true },
    { action_key: "referral_purchase_course", action_label: "Referral First Purchase — Course (referrer earns)", points: 50, is_active: true },
    { action_key: "referral_purchase_test", action_label: "Referral First Purchase — Test (referrer earns)", points: 50, is_active: true },
    { action_key: "referral_purchase_bundle", action_label: "Referral First Purchase — Bundle (referrer earns)", points: 50, is_active: true },
    { action_key: "course_completion", action_label: "Course Completion (self earns)", points: 100, is_active: true },
    { action_key: "daily_streak_milestone", action_label: "Daily Streak Milestone (self earns)", points: 10, is_active: true },
    { action_key: "self_purchase_course", action_label: "Self Purchase — Course", points: 20, is_active: true },
    { action_key: "self_purchase_test", action_label: "Self Purchase — Test", points: 20, is_active: true },
    { action_key: "self_purchase_bundle", action_label: "Self Purchase — Bundle", points: 20, is_active: true },
    { action_key: "subscription_purchase", action_label: "Subscription Purchase", points: 30, is_active: true },
    { action_key: "profile_completion", action_label: "Profile Completion (100%)", points: 10, is_active: true },
    { action_key: "first_login", action_label: "First Login Bonus", points: 5, is_active: true },
    { action_key: "course_review", action_label: "Course Review Submitted", points: 15, is_active: true },
    { action_key: "test_attempt", action_label: "Test / Quiz Attempt", points: 5, is_active: true },
    { action_key: "discussion_post", action_label: "Discussion Post", points: 5, is_active: true },
    { action_key: "certificate_earned", action_label: "Certificate Earned", points: 50, is_active: true },
    { action_key: "birthday_bonus", action_label: "Birthday Bonus", points: 20, is_active: true },
];

export default function ReferralConfigPage() {
    const dispatch = useAppDispatch();
    const { data, isLoading } = useGetPointsConfigQuery();
    const [updateConfig, { isLoading: saving }] = useUpdatePointsConfigMutation();

    const [conversionRate, setConversionRate] = useState<string>("");
    const [rules, setRules] = useState<PointsRule[]>(DEFAULT_RULES);

    useEffect(() => {
        if (data?.data) {
            setConversionRate(String(data.data.conversion_rate ?? ""));
            if (data.data.rules?.length) {
                setRules(
                    DEFAULT_RULES.map((def) => {
                        const saved = data.data.rules.find((r) => r.action_key === def.action_key);
                        return saved ? { ...def, points: saved.points, is_active: saved.is_active } : def;
                    })
                );
            }
        }
    }, [data]);

    const handlePointsChange = (key: string, value: string) => {
        setRules((prev) =>
            prev.map((r) => (r.action_key === key ? { ...r, points: Number(value) } : r))
        );
    };

    const handleToggle = (key: string) => {
        setRules((prev) =>
            prev.map((r) => (r.action_key === key ? { ...r, is_active: !r.is_active } : r))
        );
    };

    const handleSave = async () => {
        const rate = Number(conversionRate);
        if (!conversionRate || rate <= 0) {
            dispatch(showToast({ message: "Please enter a valid conversion rate.", severity: "error" }));
            return;
        }
        try {
            const res = await updateConfig({ rules, conversion_rate: rate }).unwrap();
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

            {/* Earning Rules */}
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Earning Rules
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Set how many points each action earns. Disable any rule to stop awarding points for it.
            </Typography>

            <Box
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                {/* Header row */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 140px 64px",
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
                </Box>

                {rules.map((rule, idx) => (
                    <Box
                        key={rule.action_key}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 140px 64px",
                            px: 2,
                            py: 1,
                            alignItems: "center",
                            borderBottom: idx < rules.length - 1 ? "1px solid" : "none",
                            borderColor: "divider",
                            opacity: rule.is_active ? 1 : 0.5,
                        }}
                    >
                        <Typography variant="body2" fontWeight={rule.is_active ? 500 : 400}>
                            {rule.action_label}
                        </Typography>
                        <Box px={1}>
                            <OutlinedInput
                                fullWidth
                                size="small"
                                type="number"
                                value={rule.points}
                                onChange={(e) => handlePointsChange(rule.action_key, e.target.value)}
                                disabled={!rule.is_active}
                                inputProps={{ min: 0 }}
                                sx={{ "& input": { textAlign: "center" } }}
                            />
                        </Box>
                        <Box display="flex" justifyContent="center">
                            <Switch
                                size="small"
                                checked={rule.is_active}
                                onChange={() => handleToggle(rule.action_key)}
                                color="primary"
                            />
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
