import type { LoaderFunction } from "@remix-run/cloudflare";
import { getSession } from "../sessions.server";
import { refreshAccessToken } from "../api/googleapis";

export const loaders: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
};

export default function Page() {
  return null;
}
