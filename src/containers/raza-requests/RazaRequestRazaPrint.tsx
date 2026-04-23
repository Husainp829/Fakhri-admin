import { useGetOne, type RaRecord } from "react-admin";
import { formatListDate } from "@/utils/date-format";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router";

import ReceiptHeader from "@/components/receipt-layout/ReceiptHeader";
import { useHardcopyBorders } from "@/theme/useHardcopyBorders";
import { fromGregorian } from "@/utils/hijri-date-utils";

const RazaRequestRazaPrint = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useGetOne("razaRequests", { id: id ?? "" });
  const { solid1Soft, solid5, solid1 } = useHardcopyBorders();

  if (!data) return <Box p={3}>...Loading</Box>;

  const row = data as RaRecord & {
    itsNo?: string;
    name?: string;
    address?: string;
    purpose?: string;
    amount?: number;
    requestDate?: string;
    lagatReceiptNo?: string | null;
    razaGranted?: string | null;
  };

  const reqDate = row.requestDate ? new Date(row.requestDate) : null;

  return (
    <Box p={2} className="main-div" sx={{ fontFamily: "Roboto, sans-serif" }}>
      <ReceiptHeader title="ANJUMAN - E - FAKHRI" subTitle="Fakhri Mohalla Pune" />

      <Box sx={{ borderTop: solid5, p: 2 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          ITS No. :
          <Box flex={3} sx={{ borderBottom: solid1Soft, mr: 5, ml: 1 }}>
            {row.itsNo}
          </Box>
          <Box flex={3} sx={{ borderBottom: solid1Soft, textAlign: "right", mr: 1 }}>
            {reqDate && !Number.isNaN(reqDate.getTime()) ? formatListDate(reqDate) : ""}
          </Box>
          : تاريخ
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <>Name :</>
          <Box flex={3} sx={{ borderBottom: solid1Soft, ml: 1 }}>
            {row.name}
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-start" mb={2} alignItems="flex-start">
          <>Address :</>
          <Box flex={1} sx={{ borderBottom: solid1Soft, ml: 1, minHeight: 24 }}>
            {row.address}
          </Box>
        </Box>

        <Box textAlign="right" mb={2}>
          <>بعد التحيات جناب عامل صاحب</>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Box sx={{ borderBottom: solid1Soft, mr: 2 }}>{row.name}</Box>
          <>: الاخ النجيب / الاخت النجيبه</>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <>ني رزا واسطے حاضر تھیا چھے</>
          <Box sx={{ borderBottom: solid1Soft, ml: 2 }}>{row.purpose}</Box>
        </Box>

        <Typography variant="body2" sx={{ mt: 3 }}>
          Date:{" "}
          {reqDate && !Number.isNaN(reqDate.getTime())
            ? `${formatListDate(reqDate)} (${fromGregorian(reqDate)})`
            : "—"}
        </Typography>

        <Box display="flex" justifyContent="space-between" mt={4}>
          <Box px={2} py={1} flex={1}>
            <Box mt={8} sx={{ borderTop: solid1, pt: 2 }}>
              Jamaat Autho. Sign.
            </Box>
          </Box>

          <Box
            width={220}
            height={220}
            sx={{ border: solid1 }}
            display="flex"
            alignItems="flex-end"
            justifyContent="center"
          >
            <>عامل صاحب</>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RazaRequestRazaPrint;
