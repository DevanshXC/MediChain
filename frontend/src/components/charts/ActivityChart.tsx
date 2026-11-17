import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ActivityChartProps {
  data?: Array<{ name: string; count: number }>;
}

const defaultData = [
  { name: 'Mon', count: 4 },
  { name: 'Tue', count: 7 },
  { name: 'Wed', count: 5 },
  { name: 'Thu', count: 9 },
  { name: 'Fri', count: 12 },
  { name: 'Sat', count: 3 },
  { name: 'Sun', count: 6 },
];

export const ActivityChart: React.FC<ActivityChartProps> = ({ data = defaultData }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

