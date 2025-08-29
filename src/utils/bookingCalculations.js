/**
 * Calculate thaal amount based on number of thaals
 * @param {number} thaals
 * @returns {number}
 */
const calculateThaalAmount = (thaals = 0, perThaalCost = 0) => (Number(thaals) || 0) * perThaalCost;

const calculateTotalAmountPending = ({
  rentAmount = 0,
  kitchenCleaningAmount = 0,
  jamaatLagat = 0,
  thaalAmount = 0,
  paidAmount = 0,
  writeOffAmount = 0,
  extraExpenses = 0,
}) => {
  const total =
    Number(rentAmount) +
    Number(kitchenCleaningAmount) +
    Number(jamaatLagat) +
    Number(thaalAmount) +
    Number(extraExpenses);

  const deductions = Number(paidAmount) + Number(writeOffAmount);

  return total - deductions;
};

const calcBookingTotals = ({
  halls = [],
  depositPaidAmount = 0,
  extraExpenses = 0,
  writeOffAmount = 0,
  paidAmount = 0,
  jamaatLagatUnit = 0,
  perThaalCost = 0,
  mohalla = "Fakhri Mohalla",
}) => {
  const {
    rent: rentAmount,
    deposit: depositAmount,
    thaals: thaalCount,
    kitchenCleaning: kitchenCleaningAmount,
    thaalAmount,
  } = halls.reduce(
    (acc, hall) => {
      const {
        rent = 0,
        deposit = 0,
        thaals = 0,
        acCharges = 0,
        kitchenCleaning = 0,
        withAC = false,
        includeThaalCharges = true,
      } = hall;

      const rentWithAC = rent + (withAC ? acCharges : 0);

      return {
        rent: acc.rent + rentWithAC,
        deposit: acc.deposit + deposit,
        kitchenCleaning: acc.kitchenCleaning + kitchenCleaning,
        thaals: acc.thaals + thaals,
        thaalAmount:
          acc.thaalAmount + (includeThaalCharges ? calculateThaalAmount(thaals, perThaalCost) : 0),
      };
    },
    { rent: 0, deposit: 0, kitchenCleaning: 0, thaals: 0, thaalAmount: 0, total: 0 }
  );

  let jamaatLagat = 0;
  if (jamaatLagatUnit > 0 && halls.length > 0 && mohalla === "Fakhri Mohalla") {
    jamaatLagat = jamaatLagatUnit;
  }

  const totalAmountPending = calculateTotalAmountPending({
    rentAmount,
    kitchenCleaningAmount,
    jamaatLagat,
    thaalAmount,
    paidAmount,
    writeOffAmount,
    extraExpenses,
  });

  const totalDepositPending = (Number(depositAmount) || 0) - (Number(depositPaidAmount) || 0);

  const refundAmount = (Number(depositPaidAmount) || 0) - totalAmountPending;

  return {
    rentAmount,
    kitchenCleaningAmount,
    jamaatLagat,
    depositAmount,
    thaalCount,
    thaalAmount,
    totalAmountPending,
    totalDepositPending,
    refundAmount,
  };
};

export { calcBookingTotals };
