import { describe, it, expect } from "vitest";
import { calculateFees, canAddCourse, courseByCode, COURSES } from "./erp";

const c = (code: string) => courseByCode(code)!;

describe("fee engine", () => {
  it("charges nothing when no course is selected", () => {
    expect(calculateFees([]).total).toBe(0);
  });
  it("applies ₹1,500 tuition and ₹200 exam per credit plus ₹750 tech and ₹100 registration", () => {
    const f = calculateFees([c("CS501")]); // 4 credits
    expect(f.tuition).toBe(6000);
    expect(f.exam).toBe(800);
    expect(f.technology).toBe(750);
    expect(f.registration).toBe(100);
    expect(f.total).toBe(7650);
  });
  it("adds ₹500 per lab course", () => {
    const f = calculateFees([c("LB541"), c("LB542")]);
    expect(f.lab).toBe(1000);
  });
});

describe("selection rules", () => {
  it("rejects courses with zero seats", () => {
    expect(canAddCourse([], c("PE513"))).toEqual({ ok: false, reason: "no-seats" });
  });
  it("rejects duplicates", () => {
    expect(canAddCourse([c("CS501")], c("CS501"))).toEqual({ ok: false, reason: "duplicate" });
  });
  it("allows exactly 24 credits but not 25", () => {
    const sel = ["CS501", "CS502", "CS503", "CS504", "PE511", "PE512"].map(c); // 21
    expect(canAddCourse(sel, c("SD531"))).toEqual({ ok: true }); // 23
    expect(canAddCourse([...sel, c("SD531")], c("SD533"))).toEqual({ ok: true }); // 24
    expect(canAddCourse([...sel, c("SD531"), c("SD533")], c("OE521"))).toEqual({ ok: false, reason: "credit-limit" });
  });
  it("has at least 15 demo courses", () => {
    expect(COURSES.length).toBeGreaterThanOrEqual(15);
  });
});
