import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const CountCard = ({ title, value, icon: Icon, color = "primary" }) => (
  <Card elevation={2}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mt: 1,
              fontWeight: 700,
              color: "text.primary.main",
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: "50%",
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ fontSize: 32, color: "white" }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default CountCard;
