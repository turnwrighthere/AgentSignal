// This module lets the shared D1 adapter remain bundled in the Node build.
// It is never called when AGENTSIGNAL_STORAGE=postgres.
export const env = {} as { DB?: never };
