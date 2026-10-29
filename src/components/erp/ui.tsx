import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatINR, MAX_CREDITS, type FeeBreakdown } from "@/lib/erp";
import { useErp, type RegStatus } from "./store";

export function PageHead({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: RegStatus | "Success" | "Failed" | "Paid" | "Due" }) {
  const map: Record<string, string> = {
    "Not Registered": "bg-muted text-muted-foreground border-border",
    Draft: "bg-accent text-accent-foreground border-primary/20",
    "Pending Payment": "bg-warning/15 text-warning-foreground border-warning/40",
    Due: "bg-warning/15 text-warning-foreground border-warning/40",
    Registered: "bg-success/10 text-success border-success/30",
    Success: "bg-success/10 text-success border-success/30",
    Paid: "bg-success/10 text-success border-success/30",
    Failed: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", map[status])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}

export function StatCard({ icon, label, value, hint, tone = "primary" }: { icon: ReactNode; label: string; value: ReactNode; hint: string; tone?: "primary" | "success" | "warning" | "navy" }) {
  const tones = { primary: "bg-accent text-primary", success: "bg-success/10 text-success", warning: "bg-warning/15 text-warning-foreground", navy: "bg-navy text-navy-foreground" };
  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between">
        <div className={cn("grid size-10 place-items-center rounded-lg", tones[tone])}>{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-bold tabular">{value}</div>
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

export function CreditMeter({ credits }: { credits: number }) {
  const pct = Math.min(100, (credits / MAX_CREDITS) * 100);
  const tone = credits >= MAX_CREDITS ? "bg-destructive" : credits >= 18 ? "bg-warning" : "bg-primary";
  const label = credits >= MAX_CREDITS ? "Limit reached" : credits >= 18 ? "Approaching limit" : "Within limit";
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">Selected Credits: <span className="tabular">{credits} / {MAX_CREDITS}</span></span>
        <span className="text-xs text-muted-foreground">Remaining: <span className="tabular font-semibold text-foreground">{MAX_CREDITS - credits}</span></span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={MAX_CREDITS} aria-valuenow={credits} aria-label="Credits selected">
        <div className={cn("h-full rounded-full transition-all duration-500", tone)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function FeeTable({ fees, emphasis = "Total Payable" }: { fees: FeeBreakdown; emphasis?: string }) {
  const rows: [string, string, number][] = [
    ["Tuition fee", `${fees.credits} credits × ₹1,500`, fees.tuition],
    ["Examination fee", `${fees.credits} credits × ₹200`, fees.exam],
    ["Lab / material fee", `${fees.labCount} lab × ₹500`, fees.lab],
    ["Technology fee", "Per semester", fees.technology],
    ["Registration service fee", "Per registration", fees.registration],
  ];
  return (
    <div>
      <dl className="divide-y divide-border text-sm">
        {rows.map(([k, sub, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 py-2">
            <dt><div>{k}</div><div className="text-xs text-muted-foreground">{sub}</div></dt>
            <dd className="tabular font-medium">{formatINR(v)}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2 flex items-center justify-between rounded-lg bg-navy px-4 py-3 text-navy-foreground">
        <span className="text-sm font-semibold">{emphasis}</span>
        <span className="text-lg font-bold tabular">{formatINR(fees.total)}</span>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">Illustrative demonstration fees only.</p>
    </div>
  );
}

export function Tracker() {
  const { status, selected, locked } = useErp();
  const stage = status === "Registered" ? 4 : locked ? 3 : selected.length ? 2 : 1;
  const steps = ["Select Courses", "Review Registration", "Complete Payment", "Registration Confirmed"];
  return (
    <div className="card-surface p-5">
      <h2 className="mb-4 text-sm font-semibold">Registration progress</h2>
      <ol className="grid gap-3 sm:grid-cols-4">
        {steps.map((s, i) => {
          const n = i + 1;
          const done = n < stage || (stage === 4 && n === 4);
          const active = n === stage && !done;
          return (
            <li key={s} className="flex items-center gap-3 sm:flex-col sm:items-start" aria-current={active ? "step" : undefined}>
              <div className="flex w-full items-center gap-2">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                  done ? "border-success bg-success text-success-foreground" : active ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground")}>
                  {done ? <Check className="size-4" /> : n}
                </span>
                {n < 4 && <span className={cn("hidden h-0.5 flex-1 rounded sm:block", n < stage ? "bg-success" : "bg-border")} />}
              </div>
              <div>
                <div className={cn("text-sm font-medium", !done && !active && "text-muted-foreground")}>{s}</div>
                <div className="text-xs text-muted-foreground">{done ? "Completed" : active ? "In progress" : "Upcoming"}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
