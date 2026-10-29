import { useState } from "react";
import {
  Bell, BookOpen, ChevronsLeft, ChevronsRight, ClipboardList, CreditCard, GraduationCap, HelpCircle, History,
  LayoutDashboard, LogOut, Menu, ReceiptText, RotateCcw, User, X,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { STUDENT } from "@/lib/erp";
import { useErp, type ModuleId } from "./store";
import { StatusBadge } from "./ui";
import { Dashboard } from "./Dashboard";
import { Registration } from "./Registration";
import { Checkout, Success } from "./Checkout";
import { Fees, HistoryView, Receipts } from "./Records";
import { Catalog, Help, Profile } from "./Profile";
import { toast } from "sonner";

const NAV: { id: ModuleId; label: string; icon: typeof BookOpen }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "registration", label: "Academic Registration", icon: ClipboardList },
  { id: "courses", label: "Available Courses", icon: BookOpen },
  { id: "fees", label: "Fee Dues & Payments", icon: CreditCard },
  { id: "history", label: "Registration History", icon: History },
  { id: "receipts", label: "Payment Receipts", icon: ReceiptText },
  { id: "profile", label: "Student Profile", icon: User },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><GraduationCap className="size-5" /></div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-wide text-sidebar-accent-foreground">KL UNIVERSITY</div>
          <div className="text-[11px] text-sidebar-foreground">Academic Services</div>
        </div>
      )}
    </div>
  );
}

function SideNav({ collapsed, onPick }: { collapsed: boolean; onPick?: () => void }) {
  const { module, go } = useErp();
  const activeId = module === "checkout" || module === "success" ? "fees" : module;
  return (
    <nav aria-label="Main" className="flex flex-col gap-1 p-3">
      {NAV.map((n) => {
        const active = activeId === n.id;
        return (
          <button key={n.id} type="button" title={collapsed ? n.label : undefined} aria-current={active ? "page" : undefined}
            onClick={() => { go(n.id); onPick?.(); }}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
              active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0")}>
            <n.icon className="size-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{n.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

export function Shell() {
  const erp = useErp();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const unread = erp.notifications.filter((n) => !n.read).length;

  const view = {
    dashboard: <Dashboard />, registration: <Registration />, courses: <Catalog />, fees: <Fees />, history: <HistoryView />,
    receipts: <Receipts />, profile: <Profile />, help: <Help />, checkout: <Checkout />, success: <Success />,
  }[erp.module];

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className={cn("no-print fixed inset-y-0 left-0 z-30 hidden flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:flex", collapsed ? "w-[76px]" : "w-64")}>
        <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}><Logo compact={collapsed} /></div>
        <div className="flex-1 overflow-y-auto"><SideNav collapsed={collapsed} /></div>
        <button type="button" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="m-3 flex items-center justify-center gap-2 rounded-lg border border-sidebar-border py-2 text-xs hover:bg-sidebar-accent">
          {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
        </button>
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="no-print fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-navy/60 animate-in fade-in" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar text-sidebar-foreground animate-in slide-in-from-left">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
              <Logo />
              <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="rounded-md p-1.5 hover:bg-sidebar-accent"><X className="size-5" /></button>
            </div>
            <SideNav collapsed={false} onPick={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <button type="button" aria-label="Open menu" onClick={() => setDrawer(true)} className="rounded-md p-2 hover:bg-muted lg:hidden"><Menu className="size-5" /></button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{STUDENT.portal}</div>
            <div className="hidden truncate text-xs text-muted-foreground sm:block">{STUDENT.university}</div>
          </div>
          <div className="hidden items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs md:flex">
            <span className="font-semibold">AY {STUDENT.year}</span><span className="text-muted-foreground">·</span><span>{STUDENT.semester}</span>
          </div>
          <div className="hidden text-xs xl:block"><span className="text-muted-foreground">ID </span><span className="font-mono font-semibold">{STUDENT.id}</span></div>

          <DropdownMenu>
            <DropdownMenuTrigger aria-label={`Notifications, ${unread} unread`} className="relative rounded-full p-2 hover:bg-muted">
              <Bell className="size-5" />
              {unread > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">{unread}</span>}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                <button type="button" onClick={erp.markAllRead} className="text-xs font-medium text-primary hover:underline">Mark all read</button>
              </div>
              <DropdownMenuSeparator />
              {erp.notifications.length === 0 && <div className="px-2 py-4 text-center text-sm text-muted-foreground">No notifications</div>}
              {erp.notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="flex gap-2 px-2 py-2 text-sm">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-border" : "bg-primary")} />
                  <div><div>{n.text}</div><div className="text-xs text-muted-foreground">{new Date(n.time).toLocaleString("en-IN")}</div></div>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Profile menu" className="flex items-center gap-2 rounded-full p-0.5 hover:bg-muted sm:pr-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">CS</span>
              <span className="hidden text-left text-xs sm:block"><span className="block font-semibold">{erp.profile.name}</span><span className="text-muted-foreground">B.Tech CSE</span></span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel><div>{erp.profile.name}</div><div className="font-mono text-xs font-normal text-muted-foreground">{STUDENT.id}</div></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => erp.go("profile")}><User /> My profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => erp.go("receipts")}><ReceiptText /> Receipts</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setConfirmReset(true)}><RotateCcw /> Start new semester demo</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast("Sign-out is disabled in this demo")}><LogOut /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="no-print flex items-center gap-2 border-b bg-card px-4 py-2 text-xs sm:px-6 md:hidden">
          <span className="font-semibold">AY {STUDENT.year}</span> · {STUDENT.semester} · <StatusBadge status={erp.status} />
        </div>

        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{erp.hydrated ? view : null}</main>

        <footer className="no-print border-t px-6 py-5 text-center text-xs text-muted-foreground">
          Frontend demonstration only — not an official KL University system. No real payments are processed and all course and fee data is illustrative.
        </footer>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new semester demo?</AlertDialogTitle>
            <AlertDialogDescription>This clears the current selection, payment status and wallet balance. Past history records are kept.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={erp.resetSemester}>Reset demo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
