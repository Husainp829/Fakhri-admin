import { Card, CardContent, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

import type { ChartDatum } from "./ChartsRow";

type FinancialOverviewChartProps = {
  data: ChartDatum[];
};

const FinancialOverviewChart = ({ data }: FinancialOverviewChartProps) => (
  <Card elevation={2}>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Financial Overview
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value: number) => `₹${(value / 1000).toFixed(0)}K`} />
          <Tooltip
            formatter={(value, _name, _item, _index, _payload) =>
              value != null && typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : ""
            }
          />
          <Bar dataKey="value" fill="#1976d2" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default FinancialOverviewChart;
