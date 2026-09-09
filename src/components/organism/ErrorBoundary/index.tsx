import { Box, Button, Typography } from "@mui/material";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    /** Shown above the error message, e.g. "Enrolled Tests". */
    title?: string;
    /** Bumping this remounts the boundary — pass a value that changes when the input changes. */
    resetKey?: unknown;
}

interface State {
    error: Error | null;
}

/**
 * Keeps a render error contained to one section. Without a boundary React 19 unmounts the whole
 * tree, so a single unrenderable cell value takes every other table on the page down with it.
 */
export default class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
            this.setState({ error: null });
        }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(`[${this.props.title ?? "ErrorBoundary"}]`, error, info.componentStack);
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;

        return (
            <Box
                sx={{
                    border: (theme) => `1px solid ${theme.palette.error.main}`,
                    bgcolor: (theme) => theme.palette.error.light,
                    borderRadius: 2,
                    p: 2,
                }}
            >
                <Typography variant="subtitle1" fontWeight={600} color="error.main" mb={0.5}>
                    {this.props.title ? `Couldn't display ${this.props.title}` : "Something went wrong"}
                </Typography>
                {/* The raw message is a developer's sentence, not a user's —
                    in production the section just says it could not render. */}
                {import.meta.env.DEV ? (
                    <Typography variant="body2" color="text.secondary" mb={1.5}>
                        {error.message}
                    </Typography>
                ) : null}
                <Button size="small" variant="outlined" color="error" onClick={() => this.setState({ error: null })}>
                    Try again
                </Button>
            </Box>
        );
    }
}
