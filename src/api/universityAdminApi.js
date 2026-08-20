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

/**
 * POST /api/university-admin/scrape-urls/auto-discover/ — start a crawl of the profile's
 * website_url. 409 if website_url isn't set, or a job is already running.
 */
export const startAutoDiscover = (maxPages) =>
  client
    .post("/university-admin/scrape-urls/auto-discover/", maxPages ? { max_pages: maxPages } : {})
    .then((r) => r.data);

/** GET /api/university-admin/scrape-urls/auto-discover/ — latest job for this university (404 if none ever run) */
export const getLatestAutoDiscoverJob = () =>
  client.get("/university-admin/scrape-urls/auto-discover/").then((r) => r.data);

/** GET /api/university-admin/scrape-urls/auto-discover/<job_id>/ — poll one job */
export const getAutoDiscoverJob = (jobId) =>
  client.get(`/university-admin/scrape-urls/auto-discover/${encodeURIComponent(jobId)}/`).then((r) => r.data);

/** POST /api/university-admin/scrape-urls/auto-discover/<job_id>/stop/ — cooperative cancel */
export const stopAutoDiscoverJob = (jobId) =>
  client
    .post(`/university-admin/scrape-urls/auto-discover/${encodeURIComponent(jobId)}/stop/`)
    .then((r) => r.data);

/**
 * GET /api/university-admin/scrape-urls/auto-discover/<job_id>/results/?mode=...
 * mode: "student_essential" (default) | "base_important" | "all"
 */
export const getAutoDiscoverResults = (jobId, mode = "student_essential") =>
  client
    .get(`/university-admin/scrape-urls/auto-discover/${encodeURIComponent(jobId)}/results/`, {
      params: { mode },
    })
    .then((r) => r.data);

/**
 * POST /api/university-admin/scrape-urls/auto-discover/<job_id>/apply/ — officer's picks.
 * `replace: false` (default) merges into the existing manual list.
 */
export const applyAutoDiscoverResults = (jobId, { urls, replace = false }) =>
  client
    .post(`/university-admin/scrape-urls/auto-discover/${encodeURIComponent(jobId)}/apply/`, {
      urls,
      replace,
    })
    .then((r) => r.data);

/**
 * GET /api/university-admin/scrape-urls/auto-discover/<job_id>/clusters/ — this job's
 * candidate pages grouped by category, with department/knowledge-group mapping and any
 * existing approval record per cluster.
 */
export const getAutoDiscoverClusters = (jobId) =>
  client
    .get(`/university-admin/scrape-urls/auto-discover/${encodeURIComponent(jobId)}/clusters/`)
    .then((r) => r.data);

/**
 * POST /api/university-admin/scrape-urls/auto-discover/<job_id>/clusters/<category>/approve/ —
 * applies the cluster's URLs, scrapes them inline, and tags the resulting facts with the
 * matching knowledge group. Re-approving the same category updates the existing approval
 * record. Runs synchronously — expect a few seconds per URL.
 */
export const approveAutoDiscoverCluster = (jobId, category) =>
  client
    .post(
      `/university-admin/scrape-urls/auto-discover/${encodeURIComponent(jobId)}/clusters/${encodeURIComponent(
        category
      )}/approve/`
    )
    .then((r) => r.data);

/** GET /api/university-admin/knowledge/ — optional ?section=<source_type>&source_url=<url>&group=<slug> */
export const listKnowledge = ({ section, sourceUrl, group } = {}) =>
  client
    .get("/university-admin/knowledge/", {
      params: {
        ...(section ? { section } : {}),
        ...(sourceUrl ? { source_url: sourceUrl } : {}),
        ...(group ? { group } : {}),
      },
    })
    .then((r) => r.data);

/** POST /api/university-admin/knowledge/ — always stored as source_type "manual" */
export const createKnowledge = ({ topic, content, confidence, group }) =>
  client
    .post("/university-admin/knowledge/", {
      topic,
      content,
      ...(confidence != null ? { confidence } : {}),
      ...(group ? { group } : {}),
    })
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

/**
 * GET /api/university-admin/knowledge-groups/ — the 4 default groups are lazily
 * created on first call, so no separate setup step is needed.
 */
export const listKnowledgeGroups = () =>
  client.get("/university-admin/knowledge-groups/").then((r) => r.data);

/** PATCH /api/university-admin/knowledge-groups/<slug>/ — send only the fields being changed */
export const updateKnowledgeGroup = (slug, payload) =>
  client
    .patch(`/university-admin/knowledge-groups/${encodeURIComponent(slug)}/`, payload)
    .then((r) => r.data);

/**
 * GET /api/university-admin/knowledge-groups/<slug>/knowledge/ — the group's own record plus
 * all of its facts in one call. 404s if <slug> isn't one of the four valid groups. Lazily
 * bootstraps the four default groups, same as listKnowledgeGroups.
 */
export const getKnowledgeGroupDetail = (slug) =>
  client
    .get(`/university-admin/knowledge-groups/${encodeURIComponent(slug)}/knowledge/`)
    .then((r) => r.data);
