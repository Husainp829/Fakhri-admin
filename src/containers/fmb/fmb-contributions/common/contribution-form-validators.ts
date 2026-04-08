type ContributionFormValues = Record<string, unknown>;

/**
 * When no FMB row is selected, Hijri year start is required (ITS + period capture).
 */
export function validateContributionFmbOrPeriod(values: ContributionFormValues) {
  const errors: Record<string, string> = {};
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
/**
 * Beneficiary name is required for save when ITS is not in directory (server enforces the same).
 * Directory picks auto-fill this field; adhoc / missing ITS rows leave it empty until the user types.
 */
export function validateBeneficiaryDisplayName(values: ContributionFormValues) {
  const errors: Record<string, string> = {};
  const itsRaw = values.beneficiaryItsNo;
  const its = typeof itsRaw === "string" ? itsRaw.trim() : "";
  const nameRaw = values.beneficiaryName;
  const bn = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (its && !bn) {
    errors.beneficiaryName = "Enter beneficiary name (required when ITS is not in the directory)";
  }
  return errors;
}

export function validatePositiveContributionTotal(values: ContributionFormValues) {
  const errors: Record<string, string> = {};

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
