import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Users, BarChart3, FileText, Award } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">منصة تسجيل أضاحي العيد</h1>
              <p className="text-xl text-blue-100">بلدية العالية - ولاية توڨرت</p>
            </div>
             <Award className="w-16 h-16 opacity-80" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            نظام إلكتروني متكامل لإدارة طلبات الأضاحي
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            منصة موثوقة وآمنة لتسجيل طلبات الأضاحي والتواصل مع إدارة البلدية
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 text-lg">
                  تسجيل طلب جديد
                </Button>
              </Link>
              <a href={getLoginUrl()}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 text-lg">
                  دخول الإدارة
                </Button>
              </a>
            </div>
          ) : user?.role === 'admin' ? (
            <Link href="/admin">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 text-lg">
                الذهاب إلى لوحة التحكم
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 text-lg">
                تسجيل طلب جديد
              </Button>
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>نموذج تسجيل بسيط</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                نموذج سهل الاستخدام يتطلب معلومات أساسية فقط
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>إحصائيات فورية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                متابعة إجمالي الطلبات والأضاحي المطلوبة بشكل مباشر
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>إدارة متقدمة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                لوحة تحكم شاملة للبحث والفلترة وتعديل الطلبات
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="w-8 h-8 text-orange-600 mb-2" />
              <CardTitle>تصدير البيانات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                تصدير الطلبات بصيغة CSV للمعالجة والتحليل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">كيفية الاستخدام</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">ملء النموذج</h4>
              <p className="text-gray-600">
                أدخل بياناتك الشخصية وعدد الأضاحي المطلوبة
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">التأكيد</h4>
              <p className="text-gray-600">
                سيتم التواصل معك للتأكيد من البيانات
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">الموافقة</h4>
              <p className="text-gray-600">
                سيتم الموافقة على طلبك وتسليم الأضاحي
              </p>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">معلومات مهمة</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 ml-3 font-bold">•</span>
              <span>تأكد من صحة جميع البيانات قبل التسجيل</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 ml-3 font-bold">•</span>
              <span>سيتم التواصل معك عبر رقم الهاتف المسجل</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 ml-3 font-bold">•</span>
              <span>جميع الطلبات تخضع للموافقة من قبل إدارة البلدية</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 ml-3 font-bold">•</span>
              <span>يمكنك متابعة حالة طلبك من خلال لوحة التحكم</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2">منصة تسجيل أضاحي العيد - بلدية العالية</p>
          <p className="text-gray-400 text-sm">جميع الحقوق محفوظة © 2026</p>
        </div>
      </footer>
    </div>
  );
}
