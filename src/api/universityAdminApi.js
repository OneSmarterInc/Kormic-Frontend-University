import client from "./client";

/** GET /api/university-admin/profile/ */
export const getProfile = () => client.get("/university-admin/profile/").then((r) => r.data);

/** PATCH /api/university-admin/profile/ — send only the fields being changed */
export const updateProfile = (payload) =>
  client.patch("/university-admin/profile/", payload).then((r) => r.data);

/** GET /api/university-admin/profile/completion/ — lightweight setup_status only */
export const getProfileCompletion = () =>
  client.get("/university-admin/profile/completion/").then((r) => r.data);

/** GET /api/university-admin/agent-name/ */
export const getAgentName = () =>
  client.get("/university-admin/agent-name/").then((r) => r.data);

/** PATCH /api/university-admin/agent-name/ */
export const updateAgentName = (agentName) =>
  client.patch("/university-admin/agent-name/", { agent_name: agentName }).then((r) => r.data);

/** GET /api/university-admin/scrape-urls/ */
export const getScrapeUrls = () =>
  client.get("/university-admin/scrape-urls/").then((r) => r.data);

/** PUT /api/university-admin/scrape-urls/ — replaces the whole list */
export const setScrapeUrls = (scrapeUrls) =>
  client.put("/university-admin/scrape-urls/", { scrape_urls: scrapeUrls }).then((r) => r.data);

/** POST /api/university-admin/scrape-urls/scrape-now/ — blocks a few seconds per URL */
export const scrapeNow = () =>
  client.post("/university-admin/scrape-urls/scrape-now/").then((r) => r.data);

/** GET /api/university-admin/knowledge/ — optional ?section=<source_type>&source_url=<url> */
export const listKnowledge = ({ section, sourceUrl } = {}) =>
  client
    .get("/university-admin/knowledge/", {
      params: {
        ...(section ? { section } : {}),
        ...(sourceUrl ? { source_url: sourceUrl } : {}),
      },
    })
    .then((r) => r.data);

/** POST /api/university-admin/knowledge/ — always stored as source_type "manual" */
export const createKnowledge = ({ topic, content, confidence }) =>
  client
    .post("/university-admin/knowledge/", { topic, content, ...(confidence != null ? { confidence } : {}) })
    .then((r) => r.data);

/** GET /api/university-admin/knowledge/sections/ — counts grouped by source_type */
export const getKnowledgeSections = () =>
  client.get("/university-admin/knowledge/sections/").then((r) => r.data);

/** GET /api/university-admin/knowledge/urls/ — counts grouped by source_url (scraped facts only) */
export const getKnowledgeSourceUrls = () =>
  client.get("/university-admin/knowledge/urls/").then((r) => r.data);

/** PATCH /api/university-admin/knowledge/<id>/ — only "manual"/"seed" facts are editable */
export const updateKnowledge = (id, payload) =>
  client.patch(`/university-admin/knowledge/${encodeURIComponent(id)}/`, payload).then((r) => r.data);

/** DELETE /api/university-admin/knowledge/<id>/ — only "manual"/"seed" facts are deletable */
export const deleteKnowledge = (id) =>
  client.delete(`/university-admin/knowledge/${encodeURIComponent(id)}/`).then((r) => r.data);
