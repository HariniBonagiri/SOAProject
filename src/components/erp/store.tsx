import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  calculateFees, canAddCourse, courseByCode, FEE_CONFIG, makeReceiptNo, makeRegRef, makeTxnRef, STUDENT,
  type Course, type FeeBreakdown,
} from "@/lib/erp";

export type ModuleId = "dashboard" | "registration" | "courses" | "fees" | "history" | "receipts" | "profile" | "help" | "checkout" | "success";
export type RegStatus = "Not Registered" | "Draft" | "Pending Payment" | "Registered";
export type PayMethod = "UPI" | "Net Banking" | "Card" | "Wallet";

export interface PaymentRecord {
  regId: string;
  receiptNo: string;
  txn: string | null;
  method: PayMethod;
  timestamp: string;
  semester: string;
  year: string;
  courses: Course[];
  fees: FeeBreakdown;
  status: "Success" | "Failed";
}

interface Profile { name: string; email: string; phone: string }

interface Persisted {
  selected: string[];
  status: RegStatus;
  locked: boolean;
  regRef: string | null;
  wallet: number;
  method: PayMethod;
  payment: PaymentRecord | null;
  history: PaymentRecord[];
  module: ModuleId;
  profile: Profile;
  notifications: { id: string; text: string; time: string; read: boolean }[];
}

const KEY = "kl-erp-demo-v1";
const now = () => new Date().toISOString();

const initial = (): Persisted => ({
  selected: [],
  status: "Not Registered",
  locked: false,
  regRef: null,
  wallet: FEE_CONFIG.walletStartBalance,
  method: "UPI",
  payment: null,
  history: [],
  module: "dashboard",
  profile: { name: STUDENT.name, email: "caesar.saxena@student.demo", phone: "+91 98765 43210" },
  notifications: [
    { id: "n1", text: "Semester V course registration window is open.", time: now(), read: false },
    { id: "n2", text: "Fee payment deadline: 31 Oct 2026 (demo).", time: now(), read: false },
  ],
});

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    const p = JSON.parse(raw) as Partial<Persisted>;
    const base = initial();
    const merged = { ...base, ...p, profile: { ...base.profile, ...(p.profile ?? {}) } } as Persisted;
    merged.selected = Array.isArray(merged.selected) ? merged.selected.filter((c) => courseByCode(c)) : [];
    merged.history = Array.isArray(merged.history) ? merged.history : [];
    if (merged.module === "success" && !merged.payment) merged.module = "dashboard";
    return merged;
  } catch {
    return initial();
  }
}

function useStoreValue() {
  const [s, setS] = useState<Persisted>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [receiptView, setReceiptView] = useState<PaymentRecord | null>(null);

  useEffect(() => { setS(load()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify(s)); }, [s, hydrated]);

  const selectedCourses = useMemo(() => s.selected.map((c) => courseByCode(c)!).filter(Boolean), [s.selected]);
  const fees = useMemo(() => calculateFees(selectedCourses), [selectedCourses]);
  const registered = s.status === "Registered";

  const notify = useCallback((text: string) =>
    setS((p) => ({ ...p, notifications: [{ id: crypto.randomUUID(), text, time: now(), read: false }, ...p.notifications].slice(0, 15) })), []);

  const go = useCallback((module: ModuleId) => {
    setS((p) => ({ ...p, module }));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const add = (course: Course) => {
    const check = canAddCourse(selectedCourses, course, s.locked);
    if (!check.ok) {
      const msg = {
        locked: registered ? "Registration is complete — courses are locked." : "Selection is locked for checkout. Unlock to edit.",
        duplicate: `${course.code} is already selected.`,
        "no-seats": `${course.code} has no seats available.`,
        "credit-limit": `Adding ${course.code} would exceed the 24-credit limit.`,
      }[check.reason];
      toast.error(msg);
      return false;
    }
    setS((p) => ({ ...p, selected: [...p.selected, course.code], status: "Draft" }));
    toast.success(`${course.code} added to your registration`);
    return true;
  };

  const remove = (code: string) => {
    if (s.locked) { toast.error("Selection is locked. Unlock to edit."); return; }
    setS((p) => {
      const selected = p.selected.filter((c) => c !== code);
      return { ...p, selected, status: selected.length ? "Draft" : "Not Registered" };
    });
    toast(`${code} removed`);
  };

  const clearAll = () => {
    if (s.locked) return;
    setS((p) => ({ ...p, selected: [], status: "Not Registered" }));
    toast("All selections cleared");
  };

  const saveDraft = () => {
    localStorage.setItem(KEY, JSON.stringify(s));
    toast.success("Draft saved on this device");
  };

  const lock = () => {
    setS((p) => ({ ...p, locked: true, status: "Pending Payment", regRef: p.regRef ?? makeRegRef() }));
    notify("Course selection locked. Complete payment to finish registration.");
    toast.success("Selection confirmed and locked for checkout");
  };

  const unlock = () => {
    if (registered) return;
    setS((p) => ({ ...p, locked: false, status: p.selected.length ? "Draft" : "Not Registered" }));
    toast("Selection unlocked for editing");
  };

  const setMethod = (method: PayMethod) => setS((p) => ({ ...p, method }));

  const pay = (method: PayMethod, success: boolean) => {
    if (registered || !s.locked || !s.regRef) return;
    const base = {
      regId: s.regRef, receiptNo: makeReceiptNo(), method, timestamp: now(),
      semester: STUDENT.semester, year: STUDENT.year, courses: selectedCourses, fees,
    };
    if (!success) {
      const rec: PaymentRecord = { ...base, txn: null, status: "Failed" };
      setS((p) => ({ ...p, history: [rec, ...p.history] }));
      notify("Simulated payment failed. Your locked selection is preserved.");
      toast.error("Simulated payment failed — no amount was charged. You can retry.");
      return;
    }
    const rec: PaymentRecord = { ...base, txn: makeTxnRef(), status: "Success" };
    setS((p) => ({
      ...p, status: "Registered", payment: rec, history: [rec, ...p.history], module: "success",
      wallet: method === "Wallet" ? p.wallet - fees.total : p.wallet,
    }));
    notify(`Registration ${rec.regId} confirmed. Receipt available.`);
    toast.success("Simulated payment successful");
    window.scrollTo({ top: 0 });
  };

  const resetSemester = () => {
    setS((p) => ({ ...initial(), history: p.history, profile: p.profile, wallet: FEE_CONFIG.walletStartBalance }));
    setReceiptView(null);
    toast.success("Demo reset — start a new semester registration");
  };

  const updateProfile = (profile: Profile) => { setS((p) => ({ ...p, profile })); toast.success("Profile updated"); };
  const markAllRead = () => setS((p) => ({ ...p, notifications: p.notifications.map((n) => ({ ...n, read: true })) }));

  const openReceipt = (rec: PaymentRecord | null) => { setReceiptView(rec); go("receipts"); };

  return {
    ...s, hydrated, selectedCourses, fees, registered, receiptView,
    go, add, remove, clearAll, saveDraft, lock, unlock, setMethod, pay, resetSemester, updateProfile, markAllRead, openReceipt,
  };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);
export function ErpProvider({ children }: { children: ReactNode }) {
  const v = useStoreValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export function useErp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useErp outside provider");
  return v;
}
