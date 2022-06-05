import type { RemixLinkProps } from "@remix-run/react/components";
import { Link } from "@remix-run/react/components";
import React from "react";

export const Button = (props: React.ComponentPropsWithoutRef<"button">) => {
  return (
    <button
      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded"
      {...props}
    />
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
