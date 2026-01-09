import React from "react";
import { Card, CardContent, CardActionArea, Typography, Grid } from "@mui/material";
import { Title, usePermissions } from "react-admin";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { hasPermission } from "../../../utils/permissionUtils";

const DashboardCard = ({ icon: Icon, title, description, path }) => {
  const handleClick = () => {
    // Navigate to react-admin resource using hash route
    window.location.hash = `/${path}`;
    window.dispatchEvent(new Event("hashchange"));
  };

  return (
    <Card sx={{ minHeight: 150, width: "100%" }}>
      <CardActionArea onClick={handleClick} sx={{ height: "100%" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Icon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default function AccountsDashboard() {
  const { permissions } = usePermissions();

  return (
    <>
      <Title title="Accounts" />
      <Grid container spacing={2} mt={3}>
        {[
          [
            hasPermission(permissions, "sabilReceipts.view"),
            ReceiptIcon,
            "Sabil Receipts",
            "View and manage all sabil receipts",
            "sabilReceipt",
          ],
          [
            hasPermission(permissions, "lagatReceipts.view"),
            ReceiptIcon,
            "Lagat Receipts",
            "View and manage all lagat receipts",
            "lagatReceipts",
          ],
          [
            hasPermission(permissions, "bookingReceipts.view"),
            ReceiptIcon,
            " Booking Receipts",
            "View and manage all booking receipts",
            "contRcpt",
          ],
        ].map(
          ([perm, icon, title, description, path]) =>
            perm && (
              <Grid key={path} item size={{ xs: 6, sm: 6, md: 4 }}>
                <DashboardCard icon={icon} title={title} description={description} path={path} />
              </Grid>
            )
        )}
      </Grid>
    </>
  );
}
