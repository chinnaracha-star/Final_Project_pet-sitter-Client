type ApiProblem = {
  detail?: string
  message?: string
  title?: string
}

export async function parseApiError(response: Response) {
  const body = (await response.text()).trim()
  if (!body) return `Request failed (${response.status})`

  try {
    const problem = JSON.parse(body) as ApiProblem
    return problem.detail || problem.message || problem.title || `Request failed (${response.status})`
  } catch {
    return response.headers.get('content-type')?.startsWith('text/plain')
      ? body
      : `Request failed (${response.status})`
  }
}
