/* eslint-disable array-callback-return */
/* eslint-disable no-console */

/* eslint-disable no-unused-vars */
import React from "react";
import dayjs from "dayjs";
import { Button, useCreate } from "react-admin";
import { sabils } from "./sabils";

const getCategory = (category) => {
  if (category === 0) return "WATANI";
  return "MUTTAVATTEEN";
};

export default () => {
  const [create] = useCreate();

  const onUploadSabil = () => {
    sabils
      //   .filter((s, i) => i >= 1000)
      .map(async (sabil) => {
        const startDate = dayjs(sabil.PaidTill);
        const now = dayjs("2024-03-31T00:00:00");

        const pendingMonths = now.diff(startDate, "y");
        let paidBalance = 0;
        let pendingBalance = 0;
        if (pendingMonths < 0) {
          paidBalance = Math.abs(pendingMonths * sabil.YearlyAmount);
        } else {
          pendingBalance = pendingMonths * sabil.YearlyAmount;
        }

        const created = await create("sabilData", {
          data: {
            sabilNo: sabil.SabilNo,
            sabilType: "MUTTAVATTEEN",
            itsNo: sabil.ItsId,
            name: `${sabil.Mumeen.First_name} ${sabil.Mumeen.L_name}`,
            address: sabil.Mumeen.address,
            mohallah: sabil.Mohallah,
            lastPaidDate: sabil.PaidTill,
            pan: sabil.PAN,
            pendingBalance,
            paidBalance,
            remarks: sabil.Remark,
            transferTo: sabil.TransferTo,
            category: getCategory(sabil.Category),
            takhmeen: Math.ceil(sabil.YearlyAmount),
            closedAt: sabil.Status === 0 ? dayjs() : null,
          },
        });
        return created;
      });
  };

  return <Button onClick={onUploadSabil}> upload Sabil</Button>;
};

// import React from "react";
// import dayjs from "dayjs";
// import { Button, useCreate } from "react-admin";
// import { sabils } from "./sabils";

// const getCategory = (category) => {
//   if (category === 0) return "WATANI";
//   return "STUDENT";
// };

// export default () => {
//   const [create] = useCreate();

//   const onUploadSabil = () => {
//     sabils.map(async (sabil) => {
//       const startDate = dayjs(sabil.LastPaidDate);
//       const now = dayjs("2024-03-31T00:00:00");

//       const pendingMonths = now.diff(startDate, "y");
//       let paidBalance = 0;
//       let pendingBalance = 0;
//       if (pendingMonths < 0) {
//         paidBalance = Math.abs(pendingMonths * sabil.YearlyAmount);
//       } else {
//         pendingBalance = pendingMonths * sabil.YearlyAmount;
//       }
//       const created = await create("sabilData", {
//         data: {
//           sabilNo: sabil.SabilNo,
//           sabilType: "ESTABLISHMENT",
//           itsNo: sabil.ItsId,
//           name: `${sabil.Mumeen.First_name} ${sabil.Mumeen.L_name}`,
//           firmName: sabil.Name,
//           firmAddress: sabil.Address,
//           address: sabil.Mumeen.address,
//           mohallah: sabil.Mohallah || sabil.Mumeen.Mohallah,
//           lastPaidDate: sabil.LastPaidDate,
//           pan: sabil.PAN,
//           pendingBalance,
//           paidBalance,
//           remarks: sabil.Remark,
//           transferTo: sabil.TransferTo,
//           category: getCategory(sabil.Category),
//           takhmeen: Math.ceil(sabil.YearlyAmount),
//           closedAt: sabil.Status === 0 ? dayjs() : null,
//         },
//       });
//       return created;
//     });
//   };

//   return <Button onClick={onUploadSabil}> upload Sabil</Button>;
// };
