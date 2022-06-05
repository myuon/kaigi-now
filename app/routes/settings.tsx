import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getSession } from "../sessions.server";
import { googleAuthApi, googleCalendarApi } from "../api/googleapis";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { UserSetting } from "../api/setting";
import { userSettingApi } from "../api/setting";
import { getAuth } from "../auth.server";
import {
  AnchorButton,
  Button,
  IconButton,
  LinkButton,
} from "../components/Button";
import { CheckBox, TextField } from "../components/Input";
import { useEffect, useState } from "react";
import ArrowUpward from "../components/icons/ArrowUpward";
import ArrowDownward from "../components/icons/ArrowDownward";

interface LoaderData {
  userId?: string;
  calendarList?: { id: string; summary: string }[];
  setting?: UserSetting;
  accessToken?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const auth = await getAuth(session);

  if (!auth) {
    return json<LoaderData>({});
  }

  const { accessToken, userId } = auth;
  if (!userId || !accessToken) {
    return json<LoaderData>({});
  }

  const calendarList = await googleCalendarApi.getCalendarList(accessToken);
  const setting = await userSettingApi.get(userId);

  return json<LoaderData>({
    userId,
    calendarList: calendarList.items,
    accessToken,
    setting,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const userId = form.get("userId")?.toString();
  if (!userId) {
    return new Response(JSON.stringify({ error: "userId empty" }), {
      status: 404,
    });
  }
  const setting = await userSettingApi.get(userId);

  await userSettingApi.set(userId, {
    ...setting,
    calendarIds: form.getAll("calendar").map((value) => value.toString()),
  });

  return json({ ok: true });
};

const swap = <T,>(xs: T[] | undefined, i: number, j: number) => {
  return xs
    ? [
        ...xs.slice(0, i),
        xs[j],
        ...xs.slice(i + 1, j),
        xs[i],
        ...xs.slice(j + 1),
      ]
    : undefined;
};

export default function Page() {
  const data = useLoaderData<LoaderData>();
  const result = useActionData();
  const [calendarList, setCalendarList] =
    useState<LoaderData["calendarList"]>();
  useEffect(() => {
    if (data?.calendarList) {
      setCalendarList(data?.calendarList);
    }
  }, [data?.calendarList]);

  return (
    <div className="p-4 grid gap-2">
      <LinkButton to="/">トップに戻る</LinkButton>
      <AnchorButton
        href={googleAuthApi.generateAuthUrl(
          process.env.NODE_ENV === "development"
            ? "http://localhost:8787/callback"
            : "https://kaigi-now.myuon.workers.dev/callback"
        )}
      >
        ログイン
      </AnchorButton>

      <p>UserID: {data?.userId}</p>
      <p className="text-sm">
        <code>{data?.accessToken}</code>
      </p>
      <p>{JSON.stringify(result)}</p>
      <Form method="put" className="grid gap-4">
        <input type="hidden" name="userId" value={data?.userId} />

        <fieldset>
          <p>検索する会議室のカレンダーを選択</p>

          {calendarList?.map((option, i) => (
            <label key={option.id} className="flex items-center gap-1">
              <CheckBox
                name="calendar"
                value={option.id}
                defaultChecked={data?.setting?.calendarIds?.includes(option.id)}
              />
              {i !== 0 && (
                <IconButton
                  type="button"
                  onClick={() => {
                    setCalendarList((prev) => swap(prev, i - 1, i));
                  }}
                >
                  <ArrowUpward />
                </IconButton>
              )}
              {i !== calendarList.length - 1 && (
                <IconButton
                  type="button"
                  onClick={() => {
                    setCalendarList((prev) => swap(prev, i, i + 1));
                  }}
                >
                  <ArrowDownward />
                </IconButton>
              )}
              {(() => {
                const priority = data.setting?.calendarIds?.findIndex(
                  (id) => id === option.id
                );
                return priority !== -1 ? (
                  <span className="text-gray-500 font-mono">
                    [{priority! + 1}]
                  </span>
                ) : null;
              })()}
              {option.summary}
            </label>
          ))}
        </fieldset>

        <label>
          出席者
          <TextField type="email" name="attendeeEmail" />
        </label>

        <Button type="submit">送信</Button>
      </Form>
    </div>
  );
}
