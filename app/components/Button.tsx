import type { RemixLinkProps } from "@remix-run/react/components";
import { Link } from "@remix-run/react/components";
import classNames from "classnames";
import React from "react";
import Loading from "./icons/Loading";

export const Button = ({
  loading,
  children,
  ...props
}: { loading?: boolean } & React.ComponentPropsWithoutRef<"button">) => {
  return (
    <button
      className={classNames(
        "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded flex items-center gap-2 w-full justify-center",
        {
          "cursor-not-allowed text-opacity-80": loading ?? false,
        }
      )}
      {...props}
    >
      {loading && (
        <span>
          <Loading />
        </span>
      )}
      {children}
    </button>
  );
};

export const IconButton = (props: React.ComponentPropsWithoutRef<"button">) => {
  return <button className="text-md inline-block" {...props} />;
};

export const LinkButton = ({
  children,
  ...props
}: RemixLinkProps & React.ComponentPropsWithoutRef<"a">) => {
  return (
    <Link
      className="text-gray-700 hover:text-gray-500 underline underline-offset-1"
      {...props}
    >
      {children}
    </Link>
  );
};

export const AnchorButton = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"a">) => {
  return (
    <a
      className="text-gray-700 hover:text-gray-500 underline underline-offset-1"
      {...props}
    >
      {children}
    </a>
  );
};
