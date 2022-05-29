import { useLocation, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export const Page = () => {
  const location = useLocation();
  const navigate = useNavigate()

  useEffect(() => {
    const obj = Object.fromEntries(
      location.hash.split("&").map((item) => item.split("="))
    );
    localStorage.setItem("GOOGLE_TOKEN", obj["#access_token"]);

    navigate('/')
  }, [location.hash, navigate]);

  return null
};

export default Page;
