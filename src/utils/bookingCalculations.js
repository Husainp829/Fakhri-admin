const PER_THAAL_COST = 110;

/**
 * Calculate thaal amount based on number of thaals
 * @param {number} thaals
 * @returns {number}
 */
const calculateThaalAmount = (thaals = 0) => (Number(thaals) || 0) * PER_THAAL_COST;

/**
 * Total amount pending for payment
 * Formula: rentAmount + thaalAmount - paidAmount
 */
const calculateTotalAmountPending = ({
  rentAmount = 0,
  thaals = 0,
  paidAmount = 0,
  writeOffAmount = 0,
  extraExpenses = 0,
}) => {
  const thaalAmount = calculateThaalAmount(thaals);
  return (
    (Number(rentAmount) || 0) +
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
}) => {
  const {
    rent: rentAmount,
    deposit: depositAmount,
    thaals: thaalCount,
  } = halls.reduce(
    (
      { rent, deposit, thaals, total },
      { rent: r = 0, deposit: d = 0, thaals: t = 0, acCharges = 0, withAC = false }
    ) => {
      const hallTotal = r + d + calculateThaalAmount(t);
      let hallRent = rent + r;
      if (withAC) {
        hallRent += acCharges;
      }
      return {
        rent: hallRent,
        deposit: deposit + d,
        thaals: thaals + t,
        total: total + hallTotal,
      };
    },
    { rent: 0, deposit: 0, thaals: 0, total: 0 }
  );

  const totalAmountPending = calculateTotalAmountPending({
    rentAmount,
    thaals: thaalCount,
    paidAmount,
    writeOffAmount,
    extraExpenses,
  });

  const totalDepositPending = (Number(depositAmount) || 0) - (Number(depositPaidAmount) || 0);

  const refundAmount = (Number(depositPaidAmount) || 0) - totalAmountPending;

  return {
    rentAmount,
    depositAmount,
    thaalCount,
    thaalAmount: calculateThaalAmount(thaalCount),
    totalAmountPending,
    totalDepositPending,
    refundAmount,
  };
};

export { calcBookingTotals, calculateThaalAmount };
