import { createEventHandler } from "@remix-run/cloudflare-workers";
import * as build from "@remix-run/dev/server-build";

addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/kv/settings")) {
    event.respondWith(settings.get("key").then((value) => new Response(value)));
  } else {
    createEventHandler({ build, mode: process.env.NODE_ENV })(event);
  }
});
