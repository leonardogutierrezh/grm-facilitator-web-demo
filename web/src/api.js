import axios from "axios";

// Same-origin proxy: "/api/..." is rewritten to the real backend by Vercel
// (see vercel.json), so the browser never makes a cross-origin request.
export const API_BASE = "/api";

export const client = axios.create({ baseURL: API_BASE });

export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    delete client.defaults.headers.common["Authorization"];
  }
}

// ---- Auth ----
export async function login(username, password) {
  // Plain fetch so a 401 doesn't throw before we can read the error body.
  const res = await fetch(`${API_BASE}/authentication/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function fetchFacilitatorProfile() {
  const res = await client.get("/authentication/facilitator-profile/");
  return res.data;
}

// ---- Issues ----
async function fetchAllPages(path) {
  let url = path;
  const results = [];
  let guard = 0;
  while (url && guard < 50) {
    guard += 1;
    const res = await client.get(url);
    const data = res.data;
    if (Array.isArray(data)) return data;
    results.push(...(data.results ?? []));
    url = data.next
      ? data.next.substring(data.next.indexOf("/issues"))
      : null;
  }
  return results;
}

export function fetchAssigneeIssues() {
  return fetchAllPages("/issues/assignee/");
}

export function fetchReporterIssues() {
  return fetchAllPages("/issues/reporter/");
}

export async function fetchIssue(id) {
  const res = await client.get(`/issues/${id}`);
  return res.data;
}

export async function fetchIssueComments(id) {
  try {
    const res = await client.get(`/issues/${id}/comments/`);
    const data = res.data;
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (_e) {
    return [];
  }
}

export async function fetchIssueAttachments(id) {
  try {
    const res = await client.get(`/issues/${id}/attachments/`);
    const data = res.data;
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (_e) {
    return [];
  }
}

export async function fetchIssueStatuses() {
  try {
    const res = await client.get("/issues/issue-statuses/");
    const data = res.data;
    return Array.isArray(data) ? data : data.results ?? [];
  } catch (_e) {
    return [];
  }
}

// Partial update (status / flags / reasons / rating).
export async function updateIssue(id, body) {
  const res = await client.patch(`/issues/${id}/update/`, body);
  return res.data;
}

export async function addComment(id, comment) {
  const res = await client.post(`/issues/${id}/add-comment`, { comment });
  return res.data;
}
