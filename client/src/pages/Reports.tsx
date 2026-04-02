import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, BarChart3, TrendingUp, Users } from "lucide-react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { useLocation } from "wouter";

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

export default function Reports() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect non-admin users
  if (user && user.role !== 'admin') {
    setLocation('/');
    return null;
  }

  const { data: stats, isLoading } = trpc.registrations.stats.useQuery();
  const { data: registrations = [] } = trpc.registrations.list.useQuery({});

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Prepare data for pie chart
  const pieData = stats?.byStatus?.map((item: any) => ({
    name: getStatusLabel(item.status),
    value: Number(item.totalCount) || 0,
  })) || [];

  // Prepare data for monthly chart
  const monthlyData = prepareMonthlyData(registrations);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">التقارير والإحصائيات</h1>
          <p className="text-gray-600">تحليل شامل لطلبات الأضاحي</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                إجمالي الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats?.total || 0}</p>
              <p className="text-sm text-gray-600 mt-2">طلب تسجيل</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                إجمالي الأضاحي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats?.totalRams || 0}</p>
              <p className="text-sm text-gray-600 mt-2">رأس أضحية</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                متوسط لكل طلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.total ? (stats.totalRams / stats.total).toFixed(1) : 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">أضحية لكل طلب</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Status Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
              <CardDescription>نسبة الطلبات في كل حالة</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">لا توجد بيانات</p>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart - Monthly Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>توزيع الطلبات حسب الشهر</CardTitle>
              <CardDescription>عدد الطلبات والأضاحي شهرياً</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="عدد الطلبات" />
                    <Bar dataKey="rams" fill="#10b981" name="عدد الأضاحي" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">لا توجد بيانات</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle>تفصيل الطلبات حسب الحالة</CardTitle>
            <CardDescription>إحصائيات مفصلة لكل حالة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats?.byStatus?.map((item: any) => (
                <div key={item.status} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-2">{getStatusLabel(item.status)}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{Number(item.totalCount) || 0}</p>
                  <p className="text-xs text-gray-500">
                    {Number(item.totalRams) || 0} أضحية
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "قيد الانتظار",
    approved: "موافق عليه",
    rejected: "مرفوض",
    completed: "مكتمل",
  };
  return labels[status] || status;
}

function prepareMonthlyData(registrations: any[]): any[] {
  const monthlyMap: Record<string, { count: number; rams: number }> = {};

  registrations.forEach((reg: any) => {
    const date = new Date(reg.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { count: 0, rams: 0 };
    }
    
    monthlyMap[monthKey].count += 1;
    monthlyMap[monthKey].rams += reg.ramCount || 0;
  });

  return Object.entries(monthlyMap)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([month, data]) => ({
      month: formatMonth(month),
      ...data,
    }));
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}
