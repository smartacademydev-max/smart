import { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import ErrorScreen from "./ErrorScreen";

/**
 * Wired as `errorElement` on the pathless root route in `routes/Routes.tsx`, so
 * it covers every route in the app.
 *
 * This has to live on the route, not above the router: RouterProvider catches
 * render errors from its descendants itself and renders the matching route's
 * errorElement, so such an error never reaches a class boundary mounted higher
 * up. AppErrorBoundary alone would not have stopped the default screen.
 */
export default function RouteErrorBoundary() {
    const error = useRouteError();

    useEffect(() => {
        console.error("Route error", error);
    }, [error]);

    return <ErrorScreen error={error} />;
}
