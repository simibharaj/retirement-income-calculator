const { project, validateInputs } = require("./calculator.js");
const assert = require("assert");
// floor 0, huge cap: annuity never loses a year
let r = project({ principal: 100000, monthly: 0, years: 10, cap: 1, floor: 0, payoutRate: 0.05 });
assert(r.annuity >= 100000, "floor should prevent losses");
// cap limits gains
r = project({ principal: 100000, monthly: 0, years: 1, cap: 0.05, floor: 0, payoutRate: 0.05, returns: [0.2] });
assert.strictEqual(Math.round(r.annuity), 105000);
assert.strictEqual(Math.round(r.market), 120000);
// loss year with floor 0 -> flat; market falls
r = project({ principal: 100000, monthly: 0, years: 1, cap: 0.1, floor: 0, payoutRate: 0.05, returns: [-0.12] });
assert.strictEqual(Math.round(r.annuity), 100000);
assert.strictEqual(Math.round(r.market), 88000);
// contributions counted
r = project({ principal: 0, monthly: 100, years: 2, cap: 1, floor: 0, payoutRate: 0.05, returns: [0] });
assert.strictEqual(r.deposited, 2400);
assert.strictEqual(Math.round(r.annualIncome), 120);
const inputConstraints = [
  { key: "principal", label: "Starting balance", min: 10000, unit: "currency" },
  { key: "monthly", label: "Monthly contribution", min: 0, unit: "currency" },
  { key: "years", label: "Years until income starts", min: 5, max: 30 },
  { key: "cap", label: "Annual cap", min: 2, max: 20, unit: "percent" },
  { key: "floor", label: "Annual floor", min: 0, max: 5, unit: "percent" },
  { key: "payoutRate", label: "Assumed payout rate", min: 3, max: 8, unit: "percent" },
];
const validInputs = { principal: 250000, monthly: 500, years: 15, cap: 9.5, floor: 0, payoutRate: 5.5 };
assert.deepStrictEqual(validateInputs(validInputs, inputConstraints), []);
assert.deepStrictEqual(validateInputs({ ...validInputs, principal: 0 }, inputConstraints), [
  "Starting balance must be at least $10,000.",
]);
assert.deepStrictEqual(validateInputs({ ...validInputs, monthly: -50 }, inputConstraints), [
  "Monthly contribution must be at least $0.",
]);
assert.deepStrictEqual(validateInputs({ ...validInputs, principal: NaN }, inputConstraints), [
  "Starting balance must be a valid number.",
]);
assert.deepStrictEqual(validateInputs({ ...validInputs, payoutRate: 9 }, inputConstraints), [
  "Assumed payout rate must be no more than 8%.",
]);
assert.deepStrictEqual(validateInputs({ ...validInputs, cap: 2, floor: 5 }, inputConstraints), [
  "Annual floor cannot be higher than the annual cap.",
]);
const fs = require("fs");
const css = fs.readFileSync("style.css", "utf8");
const mutedColor = css.match(/--text-muted:\s*(#[0-9a-f]{6})/i)?.[1];
assert(mutedColor, "style.css should define the muted text color");
function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrastRatio(foreground, background) {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
for (const cardBackground of ["#f1f5f9", "#eff6ff"]) {
  assert(
    contrastRatio(mutedColor, cardBackground) >= 4.5,
    `muted text must reach 4.5:1 contrast on ${cardBackground}`
  );
}
console.log("all tests passed");
