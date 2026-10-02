/**
 * Indexed annuity illustration engine (educational demo).
 * Pure functions, no DOM, so they can be tested.
 */

// HYPOTHETICAL yearly index returns used only to illustrate how a cap and a floor
// change outcomes. These are NOT real historical S&P 500 returns.
const HYPOTHETICAL_RETURNS = [0.15, 0.08, -0.12, 0.21, -0.04, 0.11, 0.28, -0.18, 0.12, 0.05];

function project({ principal, monthly, years, cap, floor, payoutRate, returns = HYPOTHETICAL_RETURNS }) {
  let annuity = principal;
  let market = principal;
  let deposited = principal;
  for (let y = 1; y <= years; y++) {
    const contrib = monthly * 12;
    annuity += contrib;
    market += contrib;
    deposited += contrib;
    const r = returns[(y - 1) % returns.length];
    const credited = Math.min(Math.max(r, floor), cap);
    annuity *= 1 + credited;
    market *= 1 + r; // uncapped, no floor, before fees or taxes
  }
  const annualIncome = annuity * payoutRate;
  return { annuity, market, deposited, annualIncome, monthlyIncome: annualIncome / 12 };
}

if (typeof module !== "undefined") module.exports = { project, HYPOTHETICAL_RETURNS };

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const money = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
  const num = (id) => parseFloat($(id).value) || 0;

  function render() {
    const r = project({
      principal: num("initialPrincipal"),
      monthly: num("monthlyContribution"),
      years: parseInt($("years").value, 10),
      cap: num("capRate") / 100,
      floor: num("floorRate") / 100,
      payoutRate: num("annualWithdrawalRate") / 100,
    });
    $("fiaTotal").textContent = money(r.annuity);
    $("marketTotal").textContent = money(r.market);
    $("guaranteedAnnualIncome").textContent = money(r.annualIncome);
    $("guaranteedMonthlyIncome").textContent = `(${money(r.monthlyIncome)} / mo)`;
    $("totalContributions").textContent = money(r.deposited);
    $("yearsVal").textContent = `${$("years").value} years`;
  }
  ["years", "initialPrincipal", "monthlyContribution", "capRate", "floorRate", "annualWithdrawalRate"].forEach((id) =>
    $(id).addEventListener("input", render)
  );
  $("recalculateBtn").addEventListener("click", render);
  render();
}
