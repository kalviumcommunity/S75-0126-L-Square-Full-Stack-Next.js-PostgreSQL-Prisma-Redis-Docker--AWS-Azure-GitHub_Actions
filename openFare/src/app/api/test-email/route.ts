import { sendTemplateEmail } from "@/lib/email-service";
import { welcomeTemplate } from "@/lib/email-templates";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await sendTemplateEmail(
    "thamizhanban2006@gmail.com",
    "Test Email",
    welcomeTemplate("Lakshmi")
  );
  
  return NextResponse.json(result);
}