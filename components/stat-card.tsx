import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils";

import Link from "next/link";
import React from "react";

import { LucideIcon } from "lucide-react";

interface CardProps {
  title: string;
  icon: LucideIcon;
  note: string;
  value: number;
  className?: string;
  iconClassName?: string;
  link: string;
}

const CardIcon = ({ icon: Icon }: { icon: LucideIcon }) => {
  return <Icon className="size-5" />;
};

export const StatCard = ({
  title,
  icon,
  note,
  value,
  className,
  iconClassName,
  link,
}: CardProps) => {
  return (
    <Link
      href={link}
      className={cn(
        `
        group relative overflow-hidden
        rounded-3xl border border-white/40
        bg-white/70 backdrop-blur-xl
        p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.06)]
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_12px_40px_rgba(15,23,42,0.10)]
        `,
        className
      )}
    >
      {/* SOFT GLOW */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />

      {/* CONTENT */}
      <div className="relative z-10 flex items-center justify-between gap-5">

        {/* LEFT SIDE */}
        <div className="flex flex-col">

          <p className="text-base font-semibold text-slate-600">
            {title}
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            {formatNumber(value)}
          </h2>

          <p className="mt-1 text-[15px] text-slate-400">
            {note}
          </p>

        </div>

        {/* ICON */}
        <div
          className={cn(
            `
            flex h-14 w-14 shrink-0 items-center justify-center
            rounded-2xl
            bg-slate-900 text-white
            shadow-lg
            `,
            iconClassName
          )}
        >
          <CardIcon icon={icon} />
        </div>

      </div>
    </Link>
  );
};