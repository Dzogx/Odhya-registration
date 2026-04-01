import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Download, Search, Trash2, Edit2, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  approved: "موافق عليه",
  rejected: "مرفوض",
  completed: "مكتمل",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: registrations = [], isLoading: isLoadingList } = trpc.registrations.list.useQuery({
    search: searchTerm,
    status: statusFilter || undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  const { data: stats } = trpc.registrations.stats.useQuery();
  const updateMutation = trpc.registrations.update.useMutation();
  const deleteMutation = trpc.registrations.delete.useMutation();

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">وصول مرفوض</h2>
            <p className="text-gray-600 mb-6">أنت لا تملك صلاحيات الوصول إلى لوحة التحكم</p>
            <Button onClick={() => setLocation("/")} className="w-full">
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = (id: number, currentStatus: string, currentNotes: string) => {
    setEditingId(id);
    setEditStatus(currentStatus);
    setEditNotes(currentNotes || "");
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        status: editStatus as any,
        notes: editNotes,
      });
      toast.success("تم تحديث الطلب بنجاح");
      setIsDialogOpen(false);
      setEditingId(null);
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("تم حذف الطلب بنجاح");
      } catch (error) {
        toast.error("حدث خطأ أثناء الحذف");
      }
    }
  };

  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const headers = ["الرقم", "الاسم الكامل", "رقم الهاتف", "العنوان", "عدد الأضاحي", "الحالة", "التاريخ"];
    const rows = registrations.map((reg: any) => [
      reg.id,
      reg.fullName,
      reg.phoneNumber,
      reg.address,
      reg.ramCount,
      statusLabels[reg.status],
      new Date(reg.createdAt).toLocaleDateString("ar-SA"),
    ]);

    const csv = [headers, ...rows].map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `طلبات_الأضاحي_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success("تم تصدير البيانات بنجاح");
  };

  const filteredRegistrations = useMemo(() => {
    return registrations || [];
  }, [registrations]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
          <p className="text-gray-600">إدارة طلبات الأضاحي</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <BarChart3 className="w-4 h-4 ml-2" />
                إجمالي الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <BarChart3 className="w-4 h-4 ml-2" />
                إجمالي الأضاحي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.totalRams || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <BarChart3 className="w-4 h-4 ml-2" />
                قيد الانتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats?.byStatus?.find((s: any) => s.status === 'pending')?.totalCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن الاسم أو الهاتف أو العنوان..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  dir="rtl"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="فلتر حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="من التاريخ"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-40"
              />

              <Input
                type="date"
                placeholder="إلى التاريخ"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-40"
              />

              <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                <Download className="w-4 h-4 ml-2" />
                تصدير البيانات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلبات</CardTitle>
            <CardDescription>
              {isLoadingList ? "جاري التحميل..." : `عدد الطلبات: ${filteredRegistrations.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingList ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد طلبات للعرض
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الرقم</TableHead>
                      <TableHead className="text-right">الاسم الكامل</TableHead>
                      <TableHead className="text-right">رقم الهاتف</TableHead>
                      <TableHead className="text-right">العنوان</TableHead>
                      <TableHead className="text-right">الأضاحي</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg: any) => (
                      <TableRow key={reg.id}>
                        <TableCell>{reg.id}</TableCell>
                        <TableCell className="font-medium">{reg.fullName}</TableCell>
                        <TableCell>{reg.phoneNumber}</TableCell>
                        <TableCell className="max-w-xs truncate">{reg.address}</TableCell>
                        <TableCell className="text-center">{reg.ramCount}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[reg.status]}>
                            {statusLabels[reg.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(reg.createdAt).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(reg.id, reg.status, reg.notes || "")}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(reg.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الطلب</DialogTitle>
            <DialogDescription>
              قم بتحديث حالة الطلب والملاحظات
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">الحالة</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">الملاحظات</label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="أضف ملاحظات حول هذا الطلب"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
