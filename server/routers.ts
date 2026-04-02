import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createRegistration,
  getRegistrations,
  getRegistrationStats,
  updateRegistration,
  deleteRegistration,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  registrations: router({
    create: publicProcedure
      .input(z.object({
        fullName: z.string().min(1, "الاسم الكامل مطلوب"),
        phoneNumber: z.string().min(1, "رقم الهاتف مطلوب"),
        email: z.string().email().optional().or(z.literal("")),
        address: z.string().min(1, "العنوان مطلوب"),
        ramCount: z.number().int().min(1, "عدد الأضاحي يجب أن يكون 1 على الأقل"),
      }))
      .mutation(async ({ input }) => {
        return createRegistration({
          fullName: input.fullName,
          phoneNumber: input.phoneNumber,
          email: input.email || null,
          address: input.address,
          ramCount: input.ramCount,
        });
      }),

    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return getRegistrations(input);
      }),

    stats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        const stats = await getRegistrationStats();
        const total = stats.reduce((sum, s) => sum + (Number(s.totalCount) || 0), 0);
        const totalRams = stats.reduce((sum, s) => sum + (Number(s.totalRams) || 0), 0);
        return { total, totalRams, byStatus: stats };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return updateRegistration(input.id, {
          status: input.status,
          notes: input.notes,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return deleteRegistration(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
