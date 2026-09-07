/** Authenticate only the GitHub API lookup; public raw source downloads need no token. */
export async function fetchAuditJson(url, { token = process.env.GITHUB_TOKEN, fetchImpl = fetch } = {}) {
  const headers = {
    'User-Agent': 'Bellibing-simulator Echo raw audit',
    Accept: 'application/vnd.github+json, application/json',
  };
  const authenticated = new URL(url).origin === 'https://api.github.com' && Boolean(token);
  if (authenticated) headers.Authorization = `Bearer ${token}`;
  const response = await fetchImpl(url, { headers, ...(authenticated ? { redirect: 'error' } : {}) });
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${url}`);
  return response.json();
}
