import client from "./client";

/**
 * GET /api/ — public API index/health check. Includes `university_ids` (every
 * registered university id, for a picker/dropdown) and `university_dashboard_apis`.
 */
export const getApiHome = () => client.get("/").then((r) => r.data);
