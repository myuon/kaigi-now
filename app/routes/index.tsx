import config from "../../config/google-auth-client.json";

export default function Index() {
  console.log(config);
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        display: "grid",
        gap: "8px",
      }}
    >
      <a
        href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.web.client_id}&redirect_uri=http://localhost:8787/callback&response_type=token&scope=https://www.googleapis.com/auth/calendar`}
      >
        ログイン
      </a>
      <button>会議なう！</button>
    </div>
  );
}
