import { useAppSelector } from "../store/hook";

/**
 * Permission check for places a wrapper component can't reach — conditionally
 * passing a callback prop, deciding a menu entry, gating a table column.
 *
 * Same "any of" semantics as the `CAN` component: reach for `CAN` when you are
 * wrapping JSX, and for this when you need the boolean itself.
 */
export const useHasPermission = (permissions: string | string[]): boolean => {
    const user = useAppSelector((state) => state.auth.user);
    const granted = user?.permissions || [];
    const required = Array.isArray(permissions) ? permissions : [permissions];

    return required.some((permission) => granted.includes(permission));
};
