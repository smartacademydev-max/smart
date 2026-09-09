import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { PATH } from "../../../routes/PATH";

interface Props {
    error: unknown;
}

/**
 * Stands in for React Router's DefaultErrorComponent, which prints the error
 * message *and a full JavaScript stack trace* to whoever is looking at the page
 * — students and admins included. Only its "Hey developer" hint sits behind a
 * dev flag, and react-router 7.9.5 resolves every export condition to its
 * development build, so even that hint ships to production. Supplying an
 * errorElement is the only way to stop that screen rendering at all.
 */
export default function ErrorScreen({ error }: Props) {
    // Open while developing, where the message is the whole point of the screen.
    const [showDetails, setShowDetails] = useState(import.meta.env.DEV);
    const message =
        error instanceof Error ? error.message : typeof error === "string" ? error : null;

    const reload = () => window.location.reload();
    const goHome = () => window.location.assign(PATH.DASHBOARD.ROOT);

    return (
        <Box className="w-full flex items-center justify-center p-6" sx={{ minHeight: "60vh" }}>
            <Box className="flex flex-col items-center text-center gap-4 max-w-[444px]">
                <Typography variant="h4" fontWeight={500}>
                    Something went wrong
                </Typography>
                <Typography variant="subtitle1" color="text.middle">
                    We could not load this page. Reloading usually fixes it.
                </Typography>

                {message ? (
                    <Box className="flex flex-col items-center gap-2">
                        {/* In production the message stays behind a click — enough
                            for someone to screenshot for support, and never the
                            stack trace the default screen printed unasked. */}
                        <Button
                            variant="text"
                            size="small"
                            color="inherit"
                            onClick={() => setShowDetails((open) => !open)}
                        >
                            {showDetails ? "Hide details" : "Show details"}
                        </Button>
                        {showDetails ? (
                            <Typography variant="body2" color="error.main" className="break-all">
                                {message}
                            </Typography>
                        ) : null}
                    </Box>
                ) : null}

                <Box className="flex gap-3 flex-wrap justify-center">
                    <Button variant="contained" color="primary" onClick={reload}>
                        Reload page
                    </Button>
                    <Button variant="outlined" color="primary" onClick={goHome}>
                        Go to home
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
