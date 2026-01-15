import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");

    if (platform) {
      const template = await prisma.template.findUnique({
        where: { platform },
      });
      return NextResponse.json(template || null);
    }

    const templates = await prisma.template.findMany();
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, content } = body;

    if (!platform || !content) {
      return NextResponse.json(
        { error: "Platform and content are required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.upsert({
      where: { platform },
      update: {
        content: content.trim(),
      },
      create: {
        platform,
        content: content.trim(),
      },
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("Error saving template:", error);
    return NextResponse.json(
      { 
        error: "Failed to save template",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
