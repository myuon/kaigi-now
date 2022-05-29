import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../../config/google-auth-client.json";

export const loader: LoaderFunction = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  if (!code) {
    return new Response(JSON.stringify({ error: "code is empty" }), {
      status: 401,
    });
  }

  const url = new URL("https://oauth2.googleapis.com/token");
  url.searchParams.set("client_id", config.web.client_id);
  url.searchParams.set("client_secret", config.web.client_secret);
  url.searchParams.set("code", code);
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("state", "authorization");
  url.searchParams.set("redirect_uri", "http://localhost:8787/callback");

  const resp = await fetch(url.toString(), { method: "POST" });
  const body = await resp.json();
  console.log(body);

  return json(body);
};

export const Page = () => {
  const navigate = useNavigate();
  const loaderData = useLoaderData<{
    access_token: string;
    refresh_token: string;
  }>();

  useEffect(() => {
    localStorage.setItem("GOOGLE_ACCESS_TOKEN", loaderData.access_token);
    localStorage.setItem("GOOGLE_REFRESH_TOKEN", loaderData.refresh_token);

    navigate("/");
  }, [loaderData.access_token, loaderData.refresh_token, navigate]);

  return <Link to="/">Back to top</Link>;
};

export default Page;
