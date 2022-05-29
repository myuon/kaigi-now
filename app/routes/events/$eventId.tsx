import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = ({ params }) => {
  return json({ eventId: params.eventId });
};

export default function Page() {
  const { eventId } = useLoaderData();

  return (
    <div>
      会議を作成しました！
      {eventId}
      <Link to="/">戻る</Link>
    </div>
  );
}
