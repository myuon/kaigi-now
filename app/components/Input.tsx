import React from "react";

export const TextField = (props: React.ComponentPropsWithoutRef<"input">) => {
  return (
    <input
      type="text"
      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400"
      {...props}
    />
  );
};

export const CheckBox = (props: React.ComponentPropsWithoutRef<"input">) => {
  return (
    <input
      type="checkbox"
      className="apprearance-none h-4 w-4 border border-slate-300 rounded-sm bg-white accent-blue-500"
      {...props}
    />
  );
};
