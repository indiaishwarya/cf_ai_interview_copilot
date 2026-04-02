export const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {})
    }
  });

export const badRequest = (message: string) =>
  json({ error: message }, { status: 400 });

export const notFound = () =>
  new Response("Not Found", { status: 404 });