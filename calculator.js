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

function validateInputs(values, constraints) {
  const errors = [];
  for (const { key, label, min, max, unit } of constraints) {
    const value = values[key];
    if (!Number.isFinite(value)) {
      errors.push(`${label} must be a valid number.`);
      continue;
    }
    const formatBound = (bound) => {
      if (unit === "currency") return `$${new Intl.NumberFormat("en-US").format(bound)}`;
      if (unit === "percent") return `${bound}%`;
      return String(bound);
    };
    if (min !== undefined && value < min) errors.push(`${label} must be at least ${formatBound(min)}.`);
    if (max !== undefined && value > max) errors.push(`${label} must be no more than ${formatBound(max)}.`);
  }
  if (Number.isFinite(values.cap) && Number.isFinite(values.floor) && values.floor > values.cap) {
    errors.push("Annual floor cannot be higher than the annual cap.");
  }
  return errors;
}

if (typeof module !== "undefined") module.exports = { project, HYPOTHETICAL_RETURNS, validateInputs };

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const money = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
  const inputSpecs = [
    { id: "initialPrincipal", key: "principal", label: "Starting balance", unit: "currency" },
    { id: "monthlyContribution", key: "monthly", label: "Monthly contribution", unit: "currency" },
    { id: "years", key: "years", label: "Years until income starts" },
    { id: "capRate", key: "cap", label: "Annual cap", unit: "percent" },
    { id: "floorRate", key: "floor", label: "Annual floor", unit: "percent" },
    { id: "annualWithdrawalRate", key: "payoutRate", label: "Assumed payout rate", unit: "percent" },
  ];
  const constraints = inputSpecs.map(({ id, key, label, unit }) => {
    const input = $(id);
    return {
      key,
      label,
      unit,
      min: input.min === "" ? undefined : Number(input.min),
      max: input.max === "" ? undefined : Number(input.max),
    };
  });

  function clearResults() {
    ["fiaTotal", "marketTotal", "guaranteedAnnualIncome", "guaranteedMonthlyIncome", "totalContributions"].forEach(
      (id) => { $(id).textContent = "—"; }
    );
    $("resultsAnnouncement").textContent = "";
  }

  function render({ announce = false } = {}) {
    if (!announce) $("resultsAnnouncement").textContent = "";
    const values = Object.fromEntries(inputSpecs.map(({ id, key }) => [key, $(id).valueAsNumber]));
    const errors = validateInputs(values, constraints);
    const error = $("inputError");
    $("yearsVal").textContent = `${$("years").value} years`;
    const fieldErrors = Object.fromEntries(inputSpecs.map(({ id }) => [id, []]));
    errors.forEach((message) => {
      const field = inputSpecs.find(({ label }) => message.startsWith(`${label} `));
      if (field) fieldErrors[field.id].push(message);
    });
    inputSpecs.forEach(({ id }) => {
      const messages = fieldErrors[id];
      const input = $(id);
      const fieldError = $(`${id}Error`);
      fieldError.textContent = messages.join(" ");
      fieldError.hidden = messages.length === 0;
      if (messages.length) {
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", `${id}Error`);
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    });
    if (errors.length) {
      error.textContent = errors.join(" ");
      error.hidden = false;
      clearResults();
      return;
    }
    error.textContent = "";
    error.hidden = true;

    const r = project({
      principal: values.principal,
      monthly: values.monthly,
      years: values.years,
      cap: values.cap / 100,
      floor: values.floor / 100,
      payoutRate: values.payoutRate / 100,
    });
    $("fiaTotal").textContent = money(r.annuity);
    $("marketTotal").textContent = money(r.market);
    $("guaranteedAnnualIncome").textContent = money(r.annualIncome);
    $("guaranteedMonthlyIncome").textContent = `(${money(r.monthlyIncome)} / mo)`;
    $("totalContributions").textContent = money(r.deposited);
    if (announce) {
      $("resultsAnnouncement").textContent = [
        "Illustration updated.",
        `Illustrated annuity value: ${money(r.annuity)}.`,
        `Market comparison before fees: ${money(r.market)}.`,
        `Illustrated annual income at assumed payout rate: ${money(r.annualIncome)}.`,
        `Illustrated monthly income: ${money(r.monthlyIncome)}.`,
        `Total contributed: ${money(r.deposited)}.`,
      ].join(" ");
    }
  }
  ["years", "initialPrincipal", "monthlyContribution", "capRate", "floorRate", "annualWithdrawalRate"].forEach((id) =>
    $(id).addEventListener("input", render)
  );
  $("assumptionsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    render({ announce: true });
  });
  render();
}
