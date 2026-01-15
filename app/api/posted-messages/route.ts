import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const platform = searchParams.get("platform");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (platform) {
      where.platform = platform;
    }

    // Get total count
    const total = await prisma.postedMessage.count({ where });

    // Get messages
    const messages = await prisma.postedMessage.findMany({
      where,
      orderBy: {
        postedAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posted messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch posted messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postedAt, platform, messageText, keywords, apiResponse } = body;

    if (!platform || !messageText) {
      return NextResponse.json(
        { error: "Platform and messageText are required" },
        { status: 400 }
      );
    }

    const message = await prisma.postedMessage.create({
      data: {
        postedAt: postedAt ? new Date(postedAt) : new Date(),
        platform,
        messageText,
        keywords: typeof keywords === "string" ? keywords : JSON.stringify(keywords || []),
        apiResponse: typeof apiResponse === "string" ? apiResponse : JSON.stringify(apiResponse || {}),
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("Error creating posted message:", error);
    return NextResponse.json(
      { 
        error: "Failed to create posted message",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
