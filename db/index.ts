/**
 * Storage is selected at runtime. The default remains D1 for the managed Site;
 * setting AGENTSIGNAL_STORAGE=postgres opts into the Docker deployment.
 */
export const isSelfHosted = () => process.env.AGENTSIGNAL_STORAGE === 'postgres';
