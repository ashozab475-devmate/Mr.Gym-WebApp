// Membership plan options and their fees (PKR). Shared between the
// public join form and the staff "Add member" form so they can't drift
// out of sync.
export const PLANS = [
  { label: "Without Cardio", fee: 1500 },
  { label: "With Cardio", fee: 3000 },
];

export function feeForPlan(planLabel) {
  const plan = PLANS.find((p) => p.label === planLabel);
  return plan ? plan.fee : "";
}
