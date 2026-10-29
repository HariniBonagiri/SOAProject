// Core data + fee engine for the Student Academic ERP demo.
// All courses, faculty and fees are DEMONSTRATION data, not an official curriculum.

export type Category = "Core Major" | "Professional Electives" | "Open Electives" | "Skill Development" | "Practical / Labs";
export type CourseType = "Theory" | "Practical" | "Lab";

export interface Course {
  code: string;
  title: string;
  category: Category;
  credits: number;
  faculty: string;
  seats: number;
  type: CourseType;
  domain: string;
  description: string;
}

export const CATEGORIES: Category[] = ["Core Major", "Professional Electives", "Open Electives", "Skill Development", "Practical / Labs"];

export const STUDENT = {
  university: "KL University — Academic Services",
  portal: "Student Academic ERP",
  name: "Caesar Saxena",
  id: "2410030379",
  program: "B.Tech — Computer Science and Engineering",
  department: "Computer Science and Engineering",
  year: "2026–2027",
  semester: "Semester V",
};

export const MAX_CREDITS = 24;

// Edit these values to change the demo fee rules.
export const FEE_CONFIG = {
  tuitionPerCredit: 1500,
  examPerCredit: 200,
  labPerCourse: 500,
  technologyFee: 750,
  registrationFee: 100,
  walletStartBalance: 50000,
};

export const COURSES: Course[] = [
  { code: "CS501", title: "Advanced Database Management Systems", category: "Core Major", credits: 4, faculty: "Dr. Ananya Rao", seats: 42, type: "Theory", domain: "Data Systems", description: "Query optimisation, transactions, concurrency control and distributed databases." },
  { code: "CS502", title: "Design and Analysis of Algorithms", category: "Core Major", credits: 4, faculty: "Dr. Vikram Iyer", seats: 38, type: "Theory", domain: "Theory of Computing", description: "Divide and conquer, greedy methods, dynamic programming and NP-completeness." },
  { code: "CS503", title: "Full Stack Application Development", category: "Core Major", credits: 4, faculty: "Prof. Meera Kulkarni", seats: 12, type: "Theory", domain: "Software Engineering", description: "Modern web architecture, REST APIs, front-end frameworks and deployment." },
  { code: "CS504", title: "Computer Networks", category: "Core Major", credits: 3, faculty: "Dr. Rahul Menon", seats: 30, type: "Theory", domain: "Systems & Networks", description: "Layered architectures, routing, transport protocols and network security basics." },
  { code: "PE511", title: "Machine Learning Fundamentals", category: "Professional Electives", credits: 3, faculty: "Dr. Priya Natarajan", seats: 5, type: "Theory", domain: "Artificial Intelligence", description: "Supervised and unsupervised learning, model evaluation and feature engineering." },
  { code: "PE512", title: "Cloud Computing", category: "Professional Electives", credits: 3, faculty: "Prof. Arjun Reddy", seats: 24, type: "Theory", domain: "Systems & Networks", description: "Virtualisation, containers, service models and cloud-native design patterns." },
  { code: "PE513", title: "Cybersecurity Essentials", category: "Professional Electives", credits: 3, faculty: "Dr. Sneha Pillai", seats: 0, type: "Theory", domain: "Security", description: "Threat models, cryptography primitives, secure coding and incident response." },
  { code: "OE521", title: "Financial Literacy", category: "Open Electives", credits: 2, faculty: "Prof. Kavita Joshi", seats: 60, type: "Theory", domain: "Humanities & Management", description: "Personal finance, budgeting, investment basics and taxation essentials." },
  { code: "OE522", title: "Entrepreneurship and Innovation", category: "Open Electives", credits: 2, faculty: "Dr. Sanjay Bhatt", seats: 45, type: "Theory", domain: "Humanities & Management", description: "Ideation, lean startup methods, business models and pitching." },
  { code: "OE523", title: "Digital Marketing Fundamentals", category: "Open Electives", credits: 2, faculty: "Prof. Neha Kapoor", seats: 3, type: "Theory", domain: "Humanities & Management", description: "SEO, content strategy, social media analytics and campaign planning." },
  { code: "SD531", title: "Professional Communication", category: "Skill Development", credits: 2, faculty: "Prof. Lakshmi Varma", seats: 50, type: "Practical", domain: "Professional Skills", description: "Business writing, presentations, group discussion and interview skills." },
  { code: "SD532", title: "Problem Solving with Java", category: "Skill Development", credits: 2, faculty: "Dr. Vikram Iyer", seats: 28, type: "Practical", domain: "Software Engineering", description: "Competitive problem solving, collections, recursion and coding interviews." },
  { code: "SD533", title: "Career Readiness and Aptitude", category: "Skill Development", credits: 1, faculty: "Prof. Kavita Joshi", seats: 80, type: "Practical", domain: "Professional Skills", description: "Quantitative aptitude, logical reasoning and placement preparation." },
  { code: "LB541", title: "Database Management Systems Lab", category: "Practical / Labs", credits: 2, faculty: "Dr. Ananya Rao", seats: 20, type: "Lab", domain: "Data Systems", description: "Hands-on SQL, PL/SQL, indexing experiments and schema design." },
  { code: "LB542", title: "Full Stack Development Lab", category: "Practical / Labs", credits: 2, faculty: "Prof. Meera Kulkarni", seats: 18, type: "Lab", domain: "Software Engineering", description: "Build and deploy a complete web application in guided sprints." },
  { code: "LB543", title: "Computer Networks Lab", category: "Practical / Labs", credits: 1, faculty: "Dr. Rahul Menon", seats: 0, type: "Lab", domain: "Systems & Networks", description: "Packet capture, socket programming and network simulation." },
];

export const courseByCode = (code: string) => COURSES.find((c) => c.code === code);

export interface FeeBreakdown {
  credits: number;
  labCount: number;
  tuition: number;
  exam: number;
  lab: number;
  technology: number;
  registration: number;
  total: number;
}

/** Centralised fee engine — every displayed amount comes from here. */
export function calculateFees(courses: Course[], cfg = FEE_CONFIG): FeeBreakdown {
  const credits = courses.reduce((s, c) => s + c.credits, 0);
  const labCount = courses.filter((c) => c.type === "Lab").length;
  const any = courses.length > 0;
  const tuition = credits * cfg.tuitionPerCredit;
  const exam = credits * cfg.examPerCredit;
  const lab = labCount * cfg.labPerCourse;
  const technology = any ? cfg.technologyFee : 0;
  const registration = any ? cfg.registrationFee : 0;
  return { credits, labCount, tuition, exam, lab, technology, registration, total: tuition + exam + lab + technology + registration };
}

/** Fee contribution of a single course (tuition + exam + lab). */
export const courseFee = (c: Course, cfg = FEE_CONFIG) =>
  c.credits * (cfg.tuitionPerCredit + cfg.examPerCredit) + (c.type === "Lab" ? cfg.labPerCourse : 0);

export type AddCheck = { ok: true } | { ok: false; reason: "duplicate" | "no-seats" | "credit-limit" | "locked" };

export function canAddCourse(selected: Course[], course: Course, locked = false): AddCheck {
  if (locked) return { ok: false, reason: "locked" };
  if (selected.some((c) => c.code === course.code)) return { ok: false, reason: "duplicate" };
  if (course.seats <= 0) return { ok: false, reason: "no-seats" };
  const credits = selected.reduce((s, c) => s + c.credits, 0);
  if (credits + course.credits > MAX_CREDITS) return { ok: false, reason: "credit-limit" };
  return { ok: true };
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
export const formatINR = (n: number) => inr.format(n);

const rand = (len: number) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (const v of arr) s += chars[v % chars.length];
  return s;
};
export const makeTxnRef = () => `KLDEMO-2026-${rand(8)}`;
export const makeRegRef = () => `REG-2026-S5-${rand(6)}`;
export const makeReceiptNo = () => `RCPT-${rand(4)}-${rand(4)}`;
