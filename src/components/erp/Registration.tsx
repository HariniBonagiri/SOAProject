import { useMemo, useState } from "react";
import { Ban, Check, ChevronUp, Info, Lock, Minus, Plus, Save, Search, Trash2, Unlock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { canAddCourse, CATEGORIES, courseFee, COURSES, formatINR, STUDENT, type Category, type Course } from "@/lib/erp";
import { useErp } from "./store";
import { CreditMeter, FeeTable, PageHead, StatusBadge } from "./ui";

const selectCls = "h-10 w-full rounded-md border border-input bg-card px-3 text-sm";
const unique = (k: keyof Course) => [...new Set(COURSES.map((c) => String(c[k])))].sort();

function CourseCard({ c, onDetails }: { c: Course; onDetails: () => void }) {
  const erp = useErp();
  const selected = erp.selected.includes(c.code);
  const check = canAddCourse(erp.selectedCourses, c, erp.locked);
  const full = c.seats <= 0;
  return (
    <article className={cn("card-surface flex flex-col p-5 transition-all hover:-translate-y-0.5", selected && "ring-2 ring-primary")}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-bold text-primary">{c.code}</span>
        {selected ? <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success"><Check className="size-3" /> Selected</span>
          : full ? <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive"><Ban className="size-3" /> Full</span>
          : c.seats <= 5 ? <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning-foreground">Few seats</span>
          : <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Open</span>}
      </div>
      <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] font-semibold leading-snug">{c.title}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium">
        <span className="rounded bg-accent px-1.5 py-0.5 text-accent-foreground">{c.category}</span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">{c.type}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-xs">
        <div><dt className="text-muted-foreground">Credits</dt><dd className="font-semibold">{c.credits}</dd></div>
        <div><dt className="text-muted-foreground">Seats</dt><dd className="font-semibold">{c.seats}</dd></div>
        <div><dt className="text-muted-foreground">Fee</dt><dd className="font-semibold tabular">{formatINR(courseFee(c))}</dd></div>
      </dl>
      <div className="mt-1 truncate text-xs text-muted-foreground">Faculty: {c.faculty}</div>
      <div className="mt-auto flex gap-2 pt-4">
        <Button variant="outline" size="sm" onClick={onDetails} aria-label={`Details for ${c.code}`}><Info /></Button>
        {selected ? (
          <Button variant="outline" size="sm" className="flex-1" disabled={erp.locked} onClick={() => erp.remove(c.code)}><Minus /> Remove Course</Button>
        ) : (
          <Button size="sm" className="flex-1" disabled={!check.ok && check.reason !== "credit-limit"} onClick={() => erp.add(c)}
            title={!check.ok && check.reason === "credit-limit" ? "Would exceed 24 credits" : undefined}>
            {full ? "No seats" : <><Plus /> Add Course</>}
          </Button>
        )}
      </div>
    </article>
  );
}

function Summary({ onReview, onClear }: { onReview: () => void; onClear: () => void }) {
  const erp = useErp();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Registration summary</h2>
        <StatusBadge status={erp.status} />
      </div>
      <CreditMeter credits={erp.fees.credits} />
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{erp.selected.length} selected</div>
        {erp.selectedCourses.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Add courses to build your semester.</p>
        ) : (
          <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {erp.selectedCourses.map((c) => (
              <li key={c.code} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate"><span className="font-mono text-xs font-bold text-primary">{c.code}</span> {c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.credits} cr · {formatINR(courseFee(c))}</div>
                </div>
                {!erp.locked && <button type="button" aria-label={`Remove ${c.code}`} onClick={() => erp.remove(c.code)} className="rounded p-1 text-muted-foreground hover:bg-card hover:text-destructive"><X className="size-4" /></button>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <FeeTable fees={erp.fees} emphasis={erp.registered ? "Amount Paid" : "Total Payable"} />
      {erp.registered ? (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success"><Lock className="size-4" /> Registered — courses locked.</p>
      ) : erp.locked ? (
        <div className="grid gap-2">
          <Button onClick={() => erp.go("checkout")}>Proceed to Payment</Button>
          <Button variant="outline" onClick={erp.unlock}><Unlock /> Unlock to edit</Button>
        </div>
      ) : (
        <div className="grid gap-2">
          <Button onClick={onReview}>Review Registration</Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={erp.saveDraft}><Save /> Save Draft</Button>
            <Button variant="outline" disabled={!erp.selected.length} onClick={onClear}><Trash2 /> Clear All</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const erp = useErp();
  const [agree, setAgree] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setAgree(false); }}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review registration</DialogTitle>
          <DialogDescription>{STUDENT.semester} · AY {STUDENT.year}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 rounded-lg bg-muted p-4 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Student: </span><b>{erp.profile.name}</b></div>
          <div><span className="text-muted-foreground">ID: </span><b className="font-mono">{STUDENT.id}</b></div>
          <div className="sm:col-span-2"><span className="text-muted-foreground">Program: </span>{STUDENT.program}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Code</th><th>Title</th><th>Category</th><th className="text-right">Credits</th></tr></thead>
            <tbody>
              {erp.selectedCourses.map((c) => (
                <tr key={c.code} className="border-b"><td className="py-2 font-mono text-xs font-bold">{c.code}</td><td>{c.title}</td><td className="text-muted-foreground">{c.category}</td><td className="text-right">{c.credits}</td></tr>
              ))}
              <tr><td colSpan={3} className="py-2 font-semibold">Total credits</td><td className="text-right font-bold">{erp.fees.credits}</td></tr>
            </tbody>
          </table>
        </div>
        <FeeTable fees={erp.fees} />
        <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
          <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
          I have reviewed my selected courses, credits, and fee details.
        </label>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Back to Edit Courses</Button>
          {erp.locked ? (
            <Button onClick={() => { onOpenChange(false); erp.go("checkout"); }}>Proceed to Payment</Button>
          ) : (
            <Button disabled={!agree} onClick={() => { erp.lock(); onOpenChange(false); erp.go("checkout"); }}><Lock /> Confirm, Lock & Pay</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Registration() {
  const erp = useErp();
  const [cat, setCat] = useState<Category | "All">("All");
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("");
  const [faculty, setFaculty] = useState("");
  const [credits, setCredits] = useState("");
  const [avail, setAvail] = useState("");
  const [sort, setSort] = useState("name");
  const [details, setDetails] = useState<Course | null>(null);
  const [review, setReview] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [sheet, setSheet] = useState(false);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = COURSES.filter((c) =>
      (cat === "All" || c.category === cat) &&
      (!t || c.title.toLowerCase().includes(t) || c.code.toLowerCase().includes(t)) &&
      (!domain || c.domain === domain) && (!faculty || c.faculty === faculty) &&
      (!credits || c.credits === Number(credits)) &&
      (!avail || (avail === "open" ? c.seats > 0 : avail === "full" ? c.seats === 0 : erp.selected.includes(c.code))));
    return [...r].sort((a, b) => sort === "credits" ? b.credits - a.credits : sort === "seats" ? b.seats - a.seats : a.title.localeCompare(b.title));
  }, [cat, q, domain, faculty, credits, avail, sort, erp.selected]);

  const reset = () => { setQ(""); setDomain(""); setFaculty(""); setCredits(""); setAvail(""); setSort("name"); };
  const openReview = () => {
    if (!erp.selected.length) { erp.go("registration"); import("sonner").then(({ toast }) => toast.error("Select at least one course before reviewing.")); return; }
    setReview(true);
  };

  return (
    <div>
      <PageHead title="Academic Course Registration" subtitle={`Choose your subjects for ${STUDENT.semester}. Review your credits and fees before confirming your selection.`} />
      {erp.locked && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm" role="status">
          <Lock className="size-4 shrink-0" />
          {erp.registered ? "Your registration is complete. Courses are locked for this semester." : "Your selection is locked for checkout. Unlock it from the summary panel to make changes."}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-4">
          <div className="card-surface space-y-3 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Search courses" placeholder="Search by course title or code…" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 pl-9" />
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              <select aria-label="Domain" className={selectCls} value={domain} onChange={(e) => setDomain(e.target.value)}><option value="">All domains</option>{unique("domain").map((d) => <option key={d}>{d}</option>)}</select>
              <select aria-label="Faculty" className={selectCls} value={faculty} onChange={(e) => setFaculty(e.target.value)}><option value="">All faculty</option>{unique("faculty").map((d) => <option key={d}>{d}</option>)}</select>
              <select aria-label="Credits" className={selectCls} value={credits} onChange={(e) => setCredits(e.target.value)}><option value="">Any credits</option>{["1", "2", "3", "4"].map((d) => <option key={d} value={d}>{d} credit{d !== "1" && "s"}</option>)}</select>
              <select aria-label="Availability" className={selectCls} value={avail} onChange={(e) => setAvail(e.target.value)}><option value="">Any availability</option><option value="open">Seats available</option><option value="full">Full</option><option value="selected">Selected</option></select>
              <select aria-label="Sort by" className={cn(selectCls, "col-span-2 md:col-span-1")} value={sort} onChange={(e) => setSort(e.target.value)}><option value="name">Sort: Name</option><option value="credits">Sort: Credits</option><option value="seats">Sort: Seats</option></select>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span aria-live="polite">{list.length} course{list.length !== 1 && "s"} shown</span>
              <button type="button" onClick={reset} className="font-medium text-primary hover:underline">Clear filters</button>
            </div>
          </div>

          <div role="tablist" aria-label="Course categories" className="flex gap-2 overflow-x-auto pb-1">
            {(["All", ...CATEGORIES] as const).map((k) => {
              const n = k === "All" ? COURSES.length : COURSES.filter((c) => c.category === k).length;
              return (
                <button key={k} role="tab" type="button" aria-selected={cat === k} onClick={() => setCat(k)}
                  className={cn("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    cat === k ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>
                  {k}<span className={cn("rounded-full px-1.5 text-xs", cat === k ? "bg-primary-foreground/20" : "bg-muted")}>{n}</span>
                </button>
              );
            })}
          </div>

          {list.length === 0 ? (
            <div className="card-surface p-10 text-center text-sm text-muted-foreground">No courses match your filters. <button type="button" className="font-medium text-primary hover:underline" onClick={reset}>Clear filters</button></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{list.map((c) => <CourseCard key={c.code} c={c} onDetails={() => setDetails(c)} />)}</div>
          )}
          <p className="text-xs text-muted-foreground">Demonstration dataset — not the university's actual curriculum.</p>
        </div>

        <aside className="card-surface sticky top-20 hidden h-fit p-5 lg:block"><Summary onReview={openReview} onClear={() => setConfirmClear(true)} /></aside>
      </div>

      {/* Mobile bottom summary */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t bg-card shadow-lg lg:hidden">
        <button type="button" onClick={() => setSheet((s) => !s)} aria-expanded={sheet} className="flex w-full items-center justify-between px-4 py-3">
          <span className="text-sm"><b>{erp.selected.length}</b> courses · <b>{erp.fees.credits}</b>/24 cr</span>
          <span className="flex items-center gap-2 font-bold tabular">{formatINR(erp.fees.total)}<ChevronUp className={cn("size-4 transition-transform", sheet && "rotate-180")} /></span>
        </button>
        {sheet && <div className="max-h-[70vh] overflow-y-auto border-t p-4"><Summary onReview={openReview} onClear={() => setConfirmClear(true)} /></div>}
      </div>
      <div className="h-16 lg:hidden" />

      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent>
          {details && (<>
            <DialogHeader>
              <DialogTitle><span className="font-mono text-primary">{details.code}</span> — {details.title}</DialogTitle>
              <DialogDescription>{details.description}</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {([["Category", details.category], ["Type", details.type], ["Credits", details.credits], ["Seats available", details.seats], ["Faculty", details.faculty], ["Domain", details.domain], ["Fee contribution", formatINR(courseFee(details))]] as const).map(([k, v]) => (
                <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
            <DialogFooter>
              {erp.selected.includes(details.code)
                ? <Button variant="outline" disabled={erp.locked} onClick={() => { erp.remove(details.code); setDetails(null); }}>Remove Course</Button>
                : <Button disabled={details.seats <= 0 || erp.locked} onClick={() => { if (erp.add(details)) setDetails(null); }}>Add Course</Button>}
            </DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Clear all selections?</AlertDialogTitle><AlertDialogDescription>All {erp.selected.length} selected courses will be removed from your draft.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={erp.clearAll}>Clear all</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReviewDialog open={review} onOpenChange={setReview} />
    </div>
  );
}
