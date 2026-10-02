# Indexed Annuity Illustration (educational demo)

A small, dependency-free web calculator that shows how an annual **cap** and **floor** change a retirement balance compared with full market exposure over the same (hypothetical) return sequence.

Originally built for a retirement-planning website. This public version uses made-up example returns and clearly labeled assumptions.

## What it does
- Takes a starting balance, monthly contribution, years, cap, floor and an assumed payout rate
- Shows the illustrated annuity value, the no-cap/no-floor comparison, and an illustrated income figure
- Pure calculation logic lives in `calculator.js` (`project()`), with tests in `test.js`

## Run it
Open `index.html` in a browser. To run the tests: `node test.js`

## Limits (on purpose)
Educational only. Uses hypothetical yearly returns, not real market history. Ignores fees, surrender charges, participation rates, taxes and rider terms. Payout is a simple percentage of account value, which is a simplification. Not advice or an offer.

## Notes
Cleaned up from an earlier AI-assisted draft: replaced "historical" and "guaranteed" wording with accurate labels, added the market comparison the original description promised, split logic from the DOM and added tests.
