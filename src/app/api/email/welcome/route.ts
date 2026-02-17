import type { NextRequest } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || !body.email) {
    return new Response(
      JSON.stringify({ error: "Name and email are required" }),
      {
        status: 400,
      },
    );
  }

  try {
    await sendWelcomeEmail(body.email, body.name);
    return new Response(JSON.stringify({ message: "Welcome email sent" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send welcome email" }),
      {
        status: 500,
      },
    );
  }
}
