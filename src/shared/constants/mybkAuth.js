export const MYBK_AUTH_CHANGE_EVENT = "mybk-auth-change";
export const MYBK_WORKSPACE_SYNC_EVENT = "mybk-workspace-sync";

export function dispatchMybkAuthChange(detail = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(MYBK_AUTH_CHANGE_EVENT, {
      detail,
    }),
  );
}

export function dispatchMybkWorkspaceSync(detail = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(MYBK_WORKSPACE_SYNC_EVENT, {
      detail,
    }),
  );
}
