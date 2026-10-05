import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[70px] w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-base text-slate-900 dark:text-slate-100 shadow-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-indigo-600 dark:focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm leading-relaxed",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
