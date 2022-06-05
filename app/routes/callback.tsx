import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import dayjs from "dayjs";
import { useEffect } from "react";
import { googleAuthApi, googlePeopleApi } from "../api/googleapis";
import { userSessionApi } from "../api/session";
import { userSettingApi } from "../api/setting";
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

  const { access_token, expires_in, refresh_token } =
    await googleAuthApi.getAuthorizationCode(
      code,
      process.env.NODE_ENV === "development"
        ? "http://localhost:8787/callback"
        : "https://kaigi-now.myuon.workers.dev/callback"
    );

  const { data: peopleMe, error } = await googlePeopleApi.getCurrentUser(
    access_token
  );
  if (error) {
    return json(
      { error: "get_current_user_failed", detail: error },
      { status: 500 }
    );
  }
  const userId = peopleMe.metadata.sources.find(
    (source) => source.type === "PROFILE"
  )?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "userId is empty" }), {
      status: 401,
    });
  }

  userSessionApi.set(session, {
    userId,
    accessToken: access_token,
    expiresAt: dayjs().unix() + expires_in,
  });

  const setting = userSettingApi.get(userId);
  userSettingApi.set(userId, {
    ...setting,
    refreshToken: refresh_token,
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const Page = () => {
  const data = useLoaderData();
  console.log(data);
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/settings");
  }, [navigate]);

  return <Link to="/">Back to top</Link>;
};

export default Page;
