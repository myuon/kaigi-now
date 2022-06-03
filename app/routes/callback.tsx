import type { LoaderFunction } from "@remix-run/cloudflare";
import { Link, useNavigate } from "@remix-run/react";
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
    await googleAuthApi.getAuthorizationCode(code);

  const peopleMe = await googlePeopleApi.getCurrentUser(access_token);
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
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/settings");
  }, [navigate]);

  return <Link to="/">Back to top</Link>;
};

export default Page;
