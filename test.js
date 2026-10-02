const { project } = require("./calculator.js");
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
console.log("all tests passed");
