import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

const registrationSchema = z.object({
  fullName: z.string().min(3, "الاسم الكامل يجب أن يكون 3 أحرف على الأقل"),
  phoneNumber: z.string().regex(/^[0-9+\-\s()]+$/, "رقم الهاتف غير صحيح"),
  address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  ramCount: z.number().int().min(1, "عدد الأضاحي يجب أن يكون 1 على الأقل").max(100, "عدد الأضاحي لا يمكن أن يتجاوز 100"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function Register() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createRegistration = trpc.registrations.create.useMutation();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      ramCount: 1,
    },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    try {
      await createRegistration.mutateAsync(values);
      setIsSubmitted(true);
      form.reset();
      toast.success("تم التسجيل بنجاح!");
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      toast.error("حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-12 pb-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تم التسجيل بنجاح!</h2>
            <p className="text-gray-600 mb-6">شكراً لك على التسجيل. سيتم التواصل معك قريباً للتأكيد.</p>
            <Button onClick={() => setIsSubmitted(false)} className="w-full">
              تسجيل طلب آخر
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">منصة تسجيل أضاحي العيد</h1>
          <p className="text-lg text-gray-600">بلدية العالية - ولاية توڨرت</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">نموذج التسجيل</CardTitle>
            <CardDescription className="text-blue-100">
              يرجى ملء البيانات التالية للتسجيل في برنامج الأضاحي
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل اسمك الكامل"
                          {...field}
                          className="border-gray-300 focus:border-blue-500"
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل رقم هاتفك"
                          {...field}
                          className="border-gray-300 focus:border-blue-500"
                          dir="ltr"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">العنوان</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أدخل عنوانك بالتفصيل"
                          {...field}
                          className="border-gray-300 focus:border-blue-500 resize-none"
                          rows={3}
                          dir="rtl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ramCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-semibold">عدد الأضاحي المطلوبة</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={createRegistration.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 text-lg"
                >
                  {createRegistration.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    "تسجيل الطلب"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">معلومات مهمة:</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start">
              <span className="text-blue-600 ml-3">•</span>
              <span>يجب التأكد من صحة البيانات المدخلة قبل التسجيل</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 ml-3">•</span>
              <span>سيتم التواصل معك عبر رقم الهاتف المسجل للتأكيد</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 ml-3">•</span>
              <span>الطلبات تخضع للموافقة من قبل إدارة البلدية</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
