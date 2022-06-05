import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getSession } from "../sessions.server";
import { googleAuthApi, googleCalendarApi } from "../api/googleapis";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { UserSetting } from "../api/setting";
import { userSettingApi } from "../api/setting";
import { getAuth } from "../auth.server";
import { AnchorButton, Button, LinkButton } from "../components/Button";
import { CheckBox, TextField } from "../components/Input";

interface LoaderData {
  userId?: string;
  calendarList?: { id: string; summary: string }[];
  setting?: UserSetting;
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

export default function Page() {
  const data = useLoaderData<LoaderData>();
  const result = useActionData();

  return (
    <div className="p-4 grid gap-2">
      <LinkButton to="/">トップに戻る</LinkButton>
      <AnchorButton href={googleAuthApi.generateAuthUrl()}>
        ログイン
      </AnchorButton>

      <p>UserID: {data?.userId}</p>
      <p>{JSON.stringify(result)}</p>
      <Form method="put" className="grid gap-4">
        <input type="hidden" name="userId" value={data?.userId} />

        <fieldset>
          <p>検索する会議室のカレンダーを選択</p>

          {data?.calendarList?.map((option) => (
            <label key={option.id} className="flex items-center gap-1">
              <CheckBox
                name="calendar"
                value={option.id}
                defaultChecked={data?.setting?.calendarIds?.includes(option.id)}
              />
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
