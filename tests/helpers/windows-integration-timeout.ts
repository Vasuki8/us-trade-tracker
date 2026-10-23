// Real Windows filesystem/Git integration checks can outlast Vitest's 5s default.
// Measured scope and rationale: docs/validation/windows-local-checks.md.
// Other platforms inherit their existing configuration; production deadlines stay separate.
export const windowsIntegrationTimeoutMs=process.platform==='win32'?20_000:undefined;
