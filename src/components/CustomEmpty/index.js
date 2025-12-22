import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxIcon from "@mui/icons-material/Inbox";

const CustomEmpty = ({ title, subtitle, action, actionText, icon: Icon = InboxIcon }) => (
  <Box
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
    }}
  >
    <Box
      sx={{
        textAlign: "center",
        margin: "0 1em",
        color: (theme) => theme.palette.text.disabled,
      }}
    >
      <Icon
        sx={{
          width: "9em",
          height: "9em",
          color: (theme) => theme.palette.text.disabled,
          mb: 2,
        }}
      />
      {title && (
        <Typography variant="h4" paragraph>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body1" paragraph>
          {subtitle}
        </Typography>
      )}
    </Box>
    {(action || actionText) && (
      <Box
        sx={{
          textAlign: "center",
          marginTop: "2em",
        }}
      >
        {action || (
          <Typography variant="body2" color="text.secondary">
            {actionText}
          </Typography>
        )}
      </Box>
    )}
  </Box>
);

export default CustomEmpty;
