import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { googleAuthApi } from "../api/googleapis";
import { commitSession, getSession } from "../sessions.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  if (!code) {
    return new Response(JSON.stringify({ error: "code is empty" }), {
      status: 401,
    });
  }

  const { refresh_token } = await googleAuthApi.getAuthorizationCode(code);
  session.set("refresh_token", refresh_token);

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const Page = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return <Link to="/">Back to top</Link>;
};

export default Page;
