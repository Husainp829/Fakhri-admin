/**
 * When no FMB row is selected, Hijri year start is required (ITS + period capture).
 */
export function validateContributionFmbOrPeriod(values) {
  const errors = {};
  const hasFmb = values.fmbId != null && values.fmbId !== "";
  if (!hasFmb) {
    const hy = values.hijriYearStart;
    const n = Number(hy);
    if (hy === "" || hy == null || !Number.isFinite(n) || n < 1) {
      errors.hijriYearStart = "Required when no FMB record is selected";
    }
  }
  return errors;
}

/**
 * Blocks zero (or negative) contribution amounts — aligned with API
 * (`Contribution amount must be greater than zero`).
 */
export function validatePositiveContributionTotal(values) {
  const errors = {};

  if (values.isAmountOverridden === true) {
    const a = Number(values.amount);
    if (
      values.amount === "" ||
      values.amount === null ||
      values.amount === undefined ||
      !Number.isFinite(a) ||
      a <= 0
    ) {
      errors.amount = "Amount must be greater than zero";
    }
    return errors;
  }

  const q = Number(values.quantity);
  const u = Number(values.unitAmount);
  if (!Number.isFinite(q) || q < 1) {
    errors.quantity = "Must be at least 1";
  }
  const unitMissing =
    values.unitAmount === "" || values.unitAmount === null || values.unitAmount === undefined;
  if (unitMissing || !Number.isFinite(u) || u <= 0) {
    errors.unitAmount = "Unit amount must be greater than zero";
  }
  const total = (Number.isFinite(q) ? q : 0) * (Number.isFinite(u) ? u : 0);
  if (Number.isFinite(total) && total <= 0) {
    errors.unitAmount = errors.unitAmount || "Contribution total must be greater than zero";
  }
  return errors;
}
