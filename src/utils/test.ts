import { clsx } from "./index.js";

console.log('clsx("btn", "btn-primary")', clsx("btn", "btn-primary")); // "btn btn-primary"
console.log(
  'clsx("btn", false && "btn-primary", "active")',
  clsx("btn", false && "btn-primary", "active"),
); // "btn active"
console.log('clsx(["btn", null, "rounded"])', clsx(["btn", null, "rounded"])); // "btn rounded"
console.log(
  "clsx({ btn: true, hidden: false, active: true })",
  clsx({ btn: true, hidden: false, active: true }),
);
console.log(
  'clsx("btn", { hidden: false, active: true })',
  clsx("btn", { hidden: false, active: true }),
); // "btn active"
