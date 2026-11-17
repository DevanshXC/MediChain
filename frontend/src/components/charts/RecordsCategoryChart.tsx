import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface CategoryChartProps {
  data?: Array<{ name: string; value: number }>;
}

const defaultData = [
  { name: 'Diagnosis', value: 8 },
  { name: 'Prescription', value: 14 },
  { name: 'Lab Report', value: 6 },
  { name: 'Consultation', value: 9 },
  { name: 'Discharge', value: 3 },
];

const COLORS = ['#0d9488', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const RecordsCategoryChart: React.FC<CategoryChartProps> = ({ data = defaultData }) => {
  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

