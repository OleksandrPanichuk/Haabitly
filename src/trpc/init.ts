import { db } from "@/db";
import { auth } from "@/lib/auth";
import { isServer } from "@tanstack/react-query";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

type CreateTRPCContextOptions = {
    headers?: Headers;
    req?: Request;
};

const createTRPCContextInner = async (opts?: CreateTRPCContextOptions) => {
    const requestHeaders =
        opts?.headers ?? opts?.req?.headers ?? (await headers());

    const normalizedHeaders = new Headers(requestHeaders);

    const authSession = await auth.api.getSession({
        headers: normalizedHeaders,
    });

    return {
        db,
        user: authSession?.user ?? null,
    };
};

export const createTRPCContext = async (opts?: CreateTRPCContextOptions) =>
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
