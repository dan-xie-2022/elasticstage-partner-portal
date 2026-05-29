"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Terminal,
  Layers,
  BarChart3,
  BookOpen,
  LifeBuoy,
  Radio,
} from "lucide-react";

const navItems = [
  { label: "Developer Console", href: "/", icon: LayoutDashboard },
  { label: "API Playground", href: "/playground", icon: Terminal },
  { label: "Widget Preview", href: "/widget-preview", icon: Layers },
  { label: "Partner Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "API Reference", href: "/api-reference", icon: BookOpen },
];

const bottomItems = [
  { label: "Support", href: "#", icon: LifeBuoy },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 shrink-0 h-full bg-[#111111] border-r border-[#262626]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#262626]">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-[#e84d1b]">
          <Radio size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white leading-none">elasticStage</p>
          <p className="text-[10px] text-[#737373] mt-0.5 leading-none">Developer Portal</p>
        </div>
      </div>

      {/* Partner badge */}
      <div className="mx-4 mt-4 mb-2 px-3 py-2 rounded-md bg-[#1a1a1a] border border-[#262626]">
        <p className="text-[10px] text-[#737373] uppercase tracking-wider mb-1">Active partner</p>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ff5500] flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">S</span>
          </div>
          <span className="text-[13px] font-medium text-white">SoundCloud</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors ${
                active
                  ? "bg-[#e84d1b]/10 text-[#e84d1b] font-medium"
                  : "text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="px-3 pb-4 border-t border-[#262626] pt-3 space-y-0.5">
        {bottomItems.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] text-[#737373] hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            <Icon size={15} />
            {label}
          </a>
        ))}
        <div className="px-3 pt-2">
          <p className="text-[10px] text-[#404040]">API v1.0 · Partner ID: prt_SC_001</p>
        </div>
      </div>
    </aside>
  );
}
