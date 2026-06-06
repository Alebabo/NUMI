"use client";

import { BarChart3, BookOpen, FileAudio, LogOut, Phone, Settings, TrendingUp, Users } from "lucide-react";
import NumiWordmark from "../NumiWordmark";

type DashboardRole = "manager" | "rep";
export type NavView = "dashboard" | "calls" | "team" | "scoring" | "settings" | "performance" | "practice" | "training";

const managerNavItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "calls", label: "All calls", icon: Phone },
  { id: "team", label: "Team", icon: Users },
  { id: "scoring", label: "Scoring", icon: FileAudio },
  { id: "settings", label: "Settings", icon: Settings }
] as const;

const repNavItems = [
  { id: "calls", label: "My calls", icon: Phone },
  { id: "performance", label: "My performance", icon: TrendingUp },
  { id: "practice", label: "Practice", icon: FileAudio },
  { id: "training", label: "Training", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings }
] as const;

export function DashboardShell({
  children,
  role = "manager",
  onRoleChange,
  activeNav,
  onNavChange
}: {
  children: React.ReactNode;
  role?: DashboardRole;
  onRoleChange?: (role: DashboardRole) => void;
  activeNav?: NavView;
  onNavChange?: (view: NavView) => void;
}) {
  const isManager = role === "manager";
  const navItems = isManager ? managerNavItems : repNavItems;
  const selectedNav = activeNav ?? (isManager ? "dashboard" : "calls");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200/70 bg-[#F7F7F7]">
        <div className="px-4 pb-1 pt-5">
          <div className="mb-2">
            <NumiWordmark size="sm" />
          </div>
        </div>

        <div className="px-4 pb-2 pt-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-widest text-gray-400">
            Founder Hackathon
          </p>
        </div>

        {onRoleChange ? (
          <div className="px-2 pb-2">
            <div className="grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-100 p-1">
              {(["manager", "rep"] as const).map((nextRole) => (
                <button
                  key={nextRole}
                  type="button"
                  onClick={() => onRoleChange(nextRole)}
                  className={`rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    role === nextRole ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {nextRole === "manager" ? "Manager" : "Rep"}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <nav className="flex-1 space-y-px overflow-y-auto px-2 pb-3 pt-1">
          <p className="px-3 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-widest text-gray-400">
            {isManager ? "Management" : "My work"}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = selectedNav === item.id;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavChange?.(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                  active ? "bg-white font-medium text-gray-900 shadow-sm" : "text-gray-500 hover:bg-gray-200/60 hover:text-gray-800"
                }`}
              >
                <span className={`flex w-4 shrink-0 items-center justify-center ${active ? "text-gray-700" : "text-gray-400"}`}>
                  <Icon size={15} strokeWidth={1.7} />
                </span>
                <span className="flex-1 truncate text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-200/60 px-3 py-3">
          <div className="mb-2.5 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-300 text-[11px] font-medium text-gray-600">
              N
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium leading-tight text-gray-800">Numi Demo</p>
              <span className="text-[10px] leading-tight text-gray-400">{isManager ? "Manager" : "Sales rep"}</span>
            </div>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-1.5 px-1 text-left text-[11px] text-gray-400 transition-colors hover:text-gray-600"
          >
            <LogOut size={11} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
