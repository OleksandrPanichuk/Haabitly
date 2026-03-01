import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import { db } from "@/db";
import { auth } from "@/lib/auth";

const createTRPCContextInner = async (opts?: FetchCreateContextFnOptions) => {
    const requestHeaders = opts?.req?.headers ?? (await headers());

    const normalizedHeaders = new Headers(requestHeaders);

    const authSession = await auth.api.getSession({
        headers: normalizedHeaders,
    });

    return {
        db,
        user: authSession?.user ?? null,
    };
};

export const createTRPCContext = async (opts?: FetchCreateContextFnOptions) =>
    createTRPCContextInner(opts);

export const createTRPCContextForRSC = cache(async () =>
    createTRPCContextInner(),
);

type TContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TContext>().create({
    transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user?.id) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource.",
        });
    }

    return next({
        ctx: {
            user: ctx.user,
        },
    });
});
