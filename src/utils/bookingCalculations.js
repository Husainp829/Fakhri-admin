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
  perThaalCost = 0,
  thaals = 0,
  paidAmount = 0,
  writeOffAmount = 0,
  extraExpenses = 0,
}) => {
  const thaalAmount = calculateThaalAmount(thaals, perThaalCost);
  return (
    (Number(rentAmount) || 0) +
    (Number(kitchenCleaningAmount) || 0) +
    (Number(jamaatLagat) || 0) +
    thaalAmount +
    (Number(extraExpenses) || 0) -
    (Number(paidAmount) || 0) -
    (Number(writeOffAmount) || 0)
  );
};

const calcBookingTotals = ({
  halls = [],
  depositPaidAmount = 0,
  extraExpenses = 0,
  writeOffAmount = 0,
  paidAmount = 0,
  jamaatLagatUnit = 0,
  perThaalCost = 0,
}) => {
  const {
    rent: rentAmount,
    deposit: depositAmount,
    thaals: thaalCount,
    kitchenCleaning: kitchenCleaningAmount,
  } = halls.reduce(
    (acc, hall) => {
      const {
        rent = 0,
        deposit = 0,
        thaals = 0,
        acCharges = 0,
        kitchenCleaning = 0,
        withAC = false,
      } = hall;

      const rentWithAC = rent + (withAC ? acCharges : 0);

      return {
        rent: acc.rent + rentWithAC,
        deposit: acc.deposit + deposit,
        kitchenCleaning: acc.kitchenCleaning + kitchenCleaning,
        thaals: acc.thaals + thaals,
      };
    },
    { rent: 0, deposit: 0, kitchenCleaning: 0, thaals: 0, total: 0 }
  );

  let jamaatLagat = 0;
  if (jamaatLagatUnit > 0 && halls.length > 0) {
    jamaatLagat = jamaatLagatUnit;
  }

  const totalAmountPending = calculateTotalAmountPending({
    rentAmount,
    kitchenCleaningAmount,
    jamaatLagat,
    perThaalCost,
    thaals: thaalCount,
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
    thaalAmount: calculateThaalAmount(thaalCount, perThaalCost),
    totalAmountPending,
    totalDepositPending,
    refundAmount,
  };
};

const calcPerThaalCost = (halls = []) => {
  if (halls.length === 0) return 0;
  const { thaalAmount, thaals } = halls[0];
  return thaalAmount / (thaals || 1);
};

export { calcBookingTotals, calcPerThaalCost };
