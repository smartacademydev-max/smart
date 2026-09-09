import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorScreen from "./ErrorScreen";

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

/**
 * Catches render errors thrown outside the router. Anything thrown inside it is
 * handled by RouteErrorBoundary instead, because React Router intercepts those
 * before they can reach this boundary.
 */
export default class AppErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Uncaught render error", error, info.componentStack);
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        return <ErrorScreen error={error} />;
    }
}
