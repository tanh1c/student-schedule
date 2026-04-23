export const MYBK_AUTH_CHANGE_EVENT = "mybk-auth-change";

export function dispatchMybkAuthChange(detail = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(MYBK_AUTH_CHANGE_EVENT, {
      detail,
    }),
  );
}
