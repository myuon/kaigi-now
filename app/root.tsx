import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { ErrorBoundaryComponent } from "@remix-run/react/routeModules";
import styles from "./styles/generated.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="text-gray-900">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={8002} />
      </body>
    </html>
  );
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);

  return (
    <html>
      <head>
        <title>Error</title>
      </head>
      <body>
        <Scripts />
      </body>
    </html>
  );
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};
