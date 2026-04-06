/**
 * Calculate thaal amount based on number of thaals
 */
import type { BookingHallLine, CalcBookingTotalsInput } from "@/types/booking";

const calculateThaalAmount = (thaals = 0, perThaalCost = 0): number =>
  (Number(thaals) || 0) * perThaalCost;

const calculateTotalAmountPending = ({
  rentAmount = 0,
  kitchenCleaningAmount = 0,
  thaalAmount = 0,
  paidAmount = 0,
  writeOffAmount = 0,
  extraExpenses = 0,
}: {
  rentAmount?: number;
  kitchenCleaningAmount?: number;
  thaalAmount?: number;
  paidAmount?: number;
  writeOffAmount?: number;
  extraExpenses?: number;
}): number => {
  const total =
    Number(rentAmount) +
    Number(kitchenCleaningAmount) +
    Number(thaalAmount) +
    Number(extraExpenses);

  const deductions = Number(paidAmount) + Number(writeOffAmount);

  return total - deductions;
};

export const calcBookingTotals = ({
  halls = [],
  depositPaidAmount = 0,
  extraExpenses = 0,
  writeOffAmount = 0,
  paidAmount = 0,
}: CalcBookingTotalsInput): {
  rentAmount: number;
  kitchenCleaningAmount: number;
  depositAmount: number;
  thaalCount: number;
  thaalAmount: number;
  totalAmountPending: number;
  totalDepositPending: number;
  refundAmount: number;
} => {
  type Acc = {
    rent: number;
    deposit: number;
    kitchenCleaning: number;
    thaals: number;
    thaalAmount: number;
  };

  const initial: Acc = { rent: 0, deposit: 0, kitchenCleaning: 0, thaals: 0, thaalAmount: 0 };

  const {
    rent: rentAmount,
    deposit: depositAmount,
    thaals: thaalCount,
    kitchenCleaning: kitchenCleaningAmount,
    thaalAmount,
  } = halls.reduce<Acc>((acc, hall: BookingHallLine) => {
    const {
      rent = 0,
      deposit = 0,
      thaals = 0,
      acCharges = 0,
      kitchenCleaning = 0,
      withAC = false,
      includeThaalCharges = true,
      perThaal = 0,
    } = hall;

    const rentWithAC = rent + (withAC ? acCharges : 0);

    return {
      rent: acc.rent + rentWithAC,
      deposit: acc.deposit + deposit,
      kitchenCleaning: acc.kitchenCleaning + kitchenCleaning,
      thaals: acc.thaals + thaals,
      thaalAmount:
        acc.thaalAmount + (includeThaalCharges ? calculateThaalAmount(thaals, perThaal) : 0),
    };
  }, initial);

  const totalAmountPending = calculateTotalAmountPending({
    rentAmount,
    kitchenCleaningAmount,
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
    depositAmount,
    thaalCount,
    thaalAmount,
    totalAmountPending,
    totalDepositPending,
    refundAmount,
  };
};
