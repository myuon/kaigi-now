import config from "../../config/google-auth-client.json";

export const getAuthorizationPost = async (code: string) => {
  const url = new URL("https://oauth2.googleapis.com/token");
  url.searchParams.set("client_id", config.web.client_id);
  url.searchParams.set("client_secret", config.web.client_secret);
  url.searchParams.set("code", code);
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("state", "authorization");
  url.searchParams.set("redirect_uri", "http://localhost:8787/callback");

  const resp = await fetch(url.toString(), { method: "POST" });
  const body = await resp.json<{
    access_token: string;
    refresh_token: string;
  }>();

  return body;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const url = new URL("https://oauth2.googleapis.com/token");
  url.searchParams.set("client_id", config.web.client_id);
  url.searchParams.set("client_secret", config.web.client_secret);
  url.searchParams.set("grant_type", "refresh_token");
  url.searchParams.set("refresh_token", refreshToken);

  const resp = await fetch(url.toString(), { method: "POST" });
  const body = await resp.json<{
    access_token: string;
  }>();

  return body.access_token;
};
