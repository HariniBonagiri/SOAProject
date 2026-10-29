import { ArrowRight, BookOpen, CheckSquare, CreditCard, Gauge, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COURSES, formatINR, MAX_CREDITS, STUDENT } from "@/lib/erp";
import { useErp } from "./store";
import { CreditMeter, FeeTable, StatCard, StatusBadge, Tracker } from "./ui";

export function Dashboard() {
  const erp = useErp();
  const available = COURSES.filter((c) => c.seats > 0).length;
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-navy p-6 text-navy-foreground sm:p-8">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/40 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{STUDENT.semester} · AY {STUDENT.year}</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome back, {erp.profile.name.split(" ")[0]}!</h1>
            <p className="mt-1 text-sm opacity-80">Manage your semester registration, academic credits, and fee payments.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-card px-1 py-0.5"><StatusBadge status={erp.status} /></span>
            {erp.registered ? (
              <Button variant="secondary" onClick={() => erp.openReceipt(erp.payment)}><ReceiptText /> View receipt</Button>
            ) : erp.locked ? (
              <Button variant="secondary" onClick={() => erp.go("checkout")}>Continue to payment <ArrowRight /></Button>
            ) : (
              <Button variant="secondary" onClick={() => erp.go("registration")}>{erp.selected.length ? "Continue registration" : "Start registration"} <ArrowRight /></Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
        <StatCard icon={<BookOpen className="size-5" />} label="Available Courses" value={available} hint={`${COURSES.length} offered across 5 categories`} />
        <StatCard icon={<CheckSquare className="size-5" />} label="Selected Courses" value={erp.selected.length} hint={erp.registered ? "Registered & locked" : "In current draft"} tone="success" />
        <StatCard icon={<Gauge className="size-5" />} label="Registered Credits" value={<>{erp.fees.credits}<span className="text-base text-muted-foreground"> / {MAX_CREDITS}</span></>} hint={`${MAX_CREDITS - erp.fees.credits} credits remaining`} tone="warning" />
        <StatCard icon={<CreditCard className="size-5" />} label="Total Estimated Fees" value={formatINR(erp.fees.total)} hint={erp.registered ? "Paid in full (demo)" : "Updates as you select"} tone="navy" />
      </div>

      <Tracker />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card-surface p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Current selection</h2>
            <Button variant="ghost" size="sm" onClick={() => erp.go("registration")}>Manage <ArrowRight /></Button>
          </div>
          <CreditMeter credits={erp.fees.credits} />
          {erp.selectedCourses.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No courses selected yet.</p>
          ) : (
            <ul className="mt-5 divide-y">
              {erp.selectedCourses.map((c) => (
                <li key={c.code} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0"><span className="font-mono text-xs font-semibold text-primary">{c.code}</span> <span className="truncate">{c.title}</span></div>
                  <span className="shrink-0 text-xs text-muted-foreground">{c.credits} cr</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card-surface p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Fee estimate</h2>
          <FeeTable fees={erp.fees} emphasis={erp.registered ? "Amount Paid" : "Total Payable"} />
        </section>
      </div>
    </div>
  );
}
