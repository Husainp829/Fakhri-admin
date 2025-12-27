import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TablePagination,
} from "@mui/material";

const TakhmeenAmountTable = ({ sabilType, data, redirect }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewSabils = (amount) => {
    // Navigate to sabilData list with filters
    const filters = {
      sabilType,
      takhmeenAmount: amount,
    };
    const filterParams = new URLSearchParams({
      filter: JSON.stringify(filters),
    });
    redirect(`/sabilData?${filterParams.toString()}`);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {sabilType}
        </Typography>
        <Chip
          label={`Total: ${data.reduce((sum, item) => sum + item.count, 0)} Sabils`}
          color="primary"
          sx={{ fontWeight: 600 }}
        />
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Takhmeen Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Count</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow key={item.amount} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ₹{item.amount.toLocaleString("en-IN")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {item.count} Sabil{item.count !== 1 ? "s" : ""}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewSabils(item.amount)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};

export default TakhmeenAmountTable;
