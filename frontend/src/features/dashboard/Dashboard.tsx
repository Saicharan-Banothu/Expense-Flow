import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface CategoryExpense {
  name: string;
  color: string;
  total: number;
}

interface DailyExpense {
  date: string;
  total: number;
}

interface DashboardMetrics {
  total_expenses: number;
  this_month_expenses: number;
  active_categories: number;
  budget_used_percentage: number;
  expenses_by_category: CategoryExpense[];
  recent_daily_expenses: DailyExpense[];
}

const CHART_COLORS = [
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

export default function Dashboard() {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["dashboardMetrics"],
    queryFn: async () => {
      const response = await api.get("/dashboard");
      return response.data;
    },
  });

  if (isLoading || !metrics) {
    return <div className="flex h-[50vh] items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-5xl font-black tracking-tight text-gradient">Dashboard</h2>
        <p className="text-xl text-muted-foreground font-medium">
          Welcome back, <span className="text-primary">{user?.name}</span>. Here's your financial pulse.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass shadow-xl border-t-4 border-t-violet-500 hover:-translate-y-1 transition-transform">
          <CardContent className="p-6">
            <h3 className="tracking-tight text-base font-semibold text-muted-foreground uppercase">Total Expenses</h3>
            <p className="text-4xl font-black mt-2 text-gradient">₹{metrics.total_expenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="glass shadow-xl border-t-4 border-t-indigo-500 hover:-translate-y-1 transition-transform">
          <CardContent className="p-6">
            <h3 className="tracking-tight text-base font-semibold text-muted-foreground uppercase">This Month</h3>
            <p className="text-4xl font-black mt-2">₹{metrics.this_month_expenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="glass shadow-xl border-t-4 border-t-emerald-500 hover:-translate-y-1 transition-transform">
          <CardContent className="p-6">
            <h3 className="tracking-tight text-base font-semibold text-muted-foreground uppercase">Active Categories</h3>
            <p className="text-4xl font-black mt-2">{metrics.active_categories}</p>
          </CardContent>
        </Card>
        <Card className="glass shadow-xl border-t-4 border-t-rose-500 hover:-translate-y-1 transition-transform">
          <CardContent className="p-6">
            <h3 className="tracking-tight text-base font-semibold text-muted-foreground uppercase">Budget Used (Monthly)</h3>
            <p className={`text-4xl font-black mt-2 ${metrics.budget_used_percentage > 90 ? 'text-rose-500' : ''}`}>
              {metrics.budget_used_percentage}%
            </p>
            <div className="mt-4 h-3 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full ${metrics.budget_used_percentage > 90 ? 'bg-rose-500' : 'primary-gradient'}`} 
                style={{ width: `${Math.min(100, metrics.budget_used_percentage)}%` }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass shadow-xl border-none">
          <CardHeader className="bg-muted/30 pb-6 rounded-t-xl">
            <CardTitle className="text-2xl">Spending Overview</CardTitle>
            <CardDescription className="text-base">Your expenses over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.recent_daily_expenses}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: 'short' })}
                  fontSize={14}
                  fontWeight={500}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                  fontSize={14}
                  fontWeight={500}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    color: 'hsl(var(--foreground))', 
                    borderRadius: '12px', 
                    border: '1px solid hsl(var(--border))', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Total']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {metrics.recent_daily_expenses.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#colorBar-${index % CHART_COLORS.length})`} />
                  ))}
                </Bar>
                <defs>
                  {CHART_COLORS.map((color, index) => (
                    <linearGradient key={`grad-${index}`} id={`colorBar-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0.4}/>
                    </linearGradient>
                  ))}
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 glass shadow-xl border-none">
          <CardHeader className="bg-muted/30 pb-6 rounded-t-xl">
            <CardTitle className="text-2xl">Expenses by Category</CardTitle>
            <CardDescription className="text-base">This month's distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pt-6">
            {metrics.expenses_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.expenses_by_category}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="total"
                    stroke="none"
                  >
                    {metrics.expenses_by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} className="drop-shadow-sm hover:opacity-80 transition-opacity duration-300" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      color: 'hsl(var(--foreground))', 
                      borderRadius: '12px', 
                      border: '1px solid hsl(var(--border))', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
