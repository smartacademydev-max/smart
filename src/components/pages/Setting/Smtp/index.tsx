import { Box, Button, Chip, Divider, FormControlLabel, InputLabel, MenuItem, OutlinedInput, Select, Switch, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useState } from "react";
import {
    useGetSmtpSettingsQuery,
    useTestSmtpConnectionMutation,
    useUpdateSmtpSettingsMutation,
} from "../../../../services/settingApi";
import { showToast } from "../../../../slice/toastSlice";
import { useAppDispatch } from "../../../../store/hook";
import type { SmtpSettingProps } from "../../../../types/setting";

function StatusBadge({ isWorking, lastTestedAt }: { isWorking: boolean | null | undefined; lastTestedAt: string | null | undefined }) {
    const label = isWorking == null ? "Not tested yet" : isWorking ? "Working" : "Not working";
    const color: "success" | "error" | "default" = isWorking == null ? "default" : isWorking ? "success" : "error";
    return (
        <Box className="flex items-center gap-3 flex-wrap">
            <Chip label={label} color={color} size="small" />
            {lastTestedAt && (
                <Typography variant="caption" color="text.secondary">
                    Last checked: {new Date(lastTestedAt).toLocaleString()}
                </Typography>
            )}
        </Box>
    );
}

export default function SmtpSettingRoot() {
    const dispatch = useAppDispatch();
    const { data } = useGetSmtpSettingsQuery();
    const [updateSmtp, { isLoading }] = useUpdateSmtpSettingsMutation();
    const [testSmtp, { isLoading: isTesting }] = useTestSmtpConnectionMutation();
    const [testEmail, setTestEmail] = useState("");

    const handleTest = async () => {
        if (!testEmail) return;
        try {
            const res = await testSmtp({ target_email: testEmail }).unwrap();
            dispatch(showToast({
                message: res.message || "Test email sent successfully",
                severity: "success",
            }));
        } catch (err: any) {
            dispatch(showToast({
                message: err?.data?.message || "Unable to send test email",
                severity: "error",
            }));
        }
    };

    const formik = useFormik<SmtpSettingProps>({
        initialValues: {
            mailer: "smtp",
            host: data?.data?.host || "",
            port: data?.data?.port || 587,
            encryption: data?.data?.encryption || "tls",
            username: data?.data?.username || "",
            password: "",
            from_name: data?.data?.from_name || "",
            from_email: data?.data?.from_email || "",
            test_email: data?.data?.test_email || "",
            health_check_enabled: data?.data?.health_check_enabled ?? false,
            health_check_interval_value: data?.data?.health_check_interval_value ?? 1,
            health_check_interval_unit: data?.data?.health_check_interval_unit ?? "day",
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const res = await updateSmtp(values).unwrap();
                dispatch(showToast({ message: res?.message || "SMTP settings updated", severity: "success" }));
            } catch (e: any) {
                dispatch(showToast({ message: e?.data?.message || "Unable to update SMTP settings", severity: "error" }));
            }
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="app__settings__page__root pb-4 lg:pb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <Typography variant="h5">SMTP Configuration</Typography>
                <StatusBadge
                    isWorking={data?.data?.is_working}
                    lastTestedAt={data?.data?.last_tested_at}
                />
            </div>
            <Divider className="mt-4! mb-6!" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel>SMTP Host</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="host"
                        value={formik.values.host}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. smtp.gmail.com"
                    />
                </div>

                <div>
                    <InputLabel>Port</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="port"
                        type="number"
                        value={formik.values.port}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. 587"
                    />
                </div>

                <div>
                    <InputLabel>Encryption</InputLabel>
                    <Select
                        fullWidth
                        name="encryption"
                        value={formik.values.encryption}
                        onChange={formik.handleChange}
                    >
                        <MenuItem value="tls">TLS</MenuItem>
                        <MenuItem value="ssl">SSL</MenuItem>
                        <MenuItem value="none">None</MenuItem>
                    </Select>
                </div>

                <div>
                    <InputLabel>Username</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="username"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="SMTP username or email"
                    />
                </div>

                <div>
                    <InputLabel>Password</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="password"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Leave blank to keep existing password"
                    />
                </div>

                <div>
                    <InputLabel>From Name</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="from_name"
                        value={formik.values.from_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. SMART Academy"
                    />
                </div>

                <div className="md:col-span-2">
                    <InputLabel>From Email</InputLabel>
                    <OutlinedInput
                        fullWidth
                        name="from_email"
                        type="email"
                        value={formik.values.from_email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. noreply@smart.com"
                    />
                </div>
            </div>

            <Divider className="mt-8! mb-6!" />
            <Typography variant="h6">Automated Health Check</Typography>
            <Typography variant="body2" color="text.secondary" className="mb-4!">
                The backend periodically sends a probe email to verify SMTP is alive. Toggle off if you only want to test manually.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <FormControlLabel
                        control={
                            <Switch
                                name="health_check_enabled"
                                checked={!!formik.values.health_check_enabled}
                                onChange={(e) => formik.setFieldValue("health_check_enabled", e.target.checked)}
                            />
                        }
                        label={
                            <Box>
                                <Typography variant="body2" fontWeight={500}>Enable scheduled health check</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    When on, the server probes SMTP on the cadence below and updates the status badge above.
                                </Typography>
                            </Box>
                        }
                    />
                </div>

                <div>
                    <InputLabel>Probe target email</InputLabel>
                    <OutlinedInput
                        fullWidth
                        type="email"
                        name="test_email"
                        value={formik.values.test_email ?? ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. qa@smart.com"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <InputLabel>Run every</InputLabel>
                        <OutlinedInput
                            fullWidth
                            type="number"
                            name="health_check_interval_value"
                            value={formik.values.health_check_interval_value ?? ""}
                            onChange={(e) => {
                                const v = Number(e.target.value);
                                formik.setFieldValue("health_check_interval_value", Number.isFinite(v) && v > 0 ? Math.min(365, v) : 1);
                            }}
                            inputProps={{ min: 1, max: 365 }}
                            disabled={!formik.values.health_check_enabled}
                        />
                    </div>
                    <div>
                        <InputLabel>Unit</InputLabel>
                        <Select
                            fullWidth
                            name="health_check_interval_unit"
                            value={formik.values.health_check_interval_unit ?? "day"}
                            onChange={formik.handleChange}
                            disabled={!formik.values.health_check_enabled}
                        >
                            <MenuItem value="hour">Hour</MenuItem>
                            <MenuItem value="day">Day</MenuItem>
                            <MenuItem value="week">Week</MenuItem>
                        </Select>
                    </div>
                </div>
            </div>

            <Divider className="mt-6! mb-6!" />
            <div className="text-right">
                <Button type="submit" variant="contained" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save SMTP Settings"}
                </Button>
            </div>

            <Divider className="mt-8! mb-6!" />
            <Typography variant="h6">Test Connection</Typography>
            <Typography variant="body2" color="text.secondary" className="mb-4!">
                Send a one-off test email using the saved configuration. The result surfaces as a toast.
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                    <InputLabel>Target Email Address</InputLabel>
                    <OutlinedInput
                        fullWidth
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="e.g. admin@smart.com"
                    />
                </div>
                <div>
                    <Button
                        onClick={handleTest}
                        variant="outlined"
                        disabled={isTesting || !testEmail}
                    >
                        {isTesting ? "Sending..." : "Execute Test"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
