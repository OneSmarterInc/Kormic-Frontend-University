import client from "./client";

/** GET /api/university/<university_id>/profiles/ */
export const listUniversityProfiles = (universityId) =>
  client.get(`/university/${encodeURIComponent(universityId)}/profiles/`).then((r) => r.data);

/** POST /api/university/<university_id>/profile/<student_id>/chat/ — Profile Presenter */
export const chatWithPresenter = (universityId, studentId, question, history = []) =>
  client
    .post(
      `/university/${encodeURIComponent(universityId)}/profile/${encodeURIComponent(
        studentId
      )}/chat/`,
      { question, history }
    )
    .then((r) => r.data);

/** GET /api/university/<university_id>/profile/<student_id>/chat/history/ */
export const getPresenterChatHistory = (universityId, studentId) =>
  client
    .get(
      `/university/${encodeURIComponent(universityId)}/profile/${encodeURIComponent(
        studentId
      )}/chat/history/`
    )
    .then((r) => r.data);

/** POST /api/university/<university_id>/chat/ — preview the university's own program agent */
export const chatWithUniversityAgent = (universityId, message) =>
  client
    .post(`/university/${encodeURIComponent(universityId)}/chat/`, { message })
    .then((r) => r.data);

/** GET /api/university/<university_id>/chat/history/ */
export const getUniversityChatHistory = (universityId) =>
  client.get(`/university/${encodeURIComponent(universityId)}/chat/history/`).then((r) => r.data);

/** GET /api/university/<university_id>/queries/ */
export const listAllQueries = (universityId) =>
  client.get(`/university/${encodeURIComponent(universityId)}/queries/`).then((r) => r.data);

/** GET /api/university/<university_id>/queries/active/ */
export const listActiveQueries = (universityId) =>
  client
    .get(`/university/${encodeURIComponent(universityId)}/queries/active/`)
    .then((r) => r.data);

/** GET /api/university/<university_id>/queries/archive/ */
export const listArchivedQueries = (universityId) =>
  client
    .get(`/university/${encodeURIComponent(universityId)}/queries/archive/`)
    .then((r) => r.data);

/** GET /api/university/<university_id>/knowledge/verified/ */
export const listVerifiedKnowledge = (universityId) =>
  client
    .get(`/university/${encodeURIComponent(universityId)}/knowledge/verified/`)
    .then((r) => r.data);

/** GET /api/university/<university_id>/questions/ */
export const listQuestionLog = (universityId) =>
  client.get(`/university/${encodeURIComponent(universityId)}/questions/`).then((r) => r.data);
