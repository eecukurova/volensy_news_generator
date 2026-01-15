import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    const config = await prisma.socialMediaConfig.findUnique({
      where: { platform },
    });

    if (!config) {
      return NextResponse.json({ success: true, message: "Already cleared" });
    }

    // Clear all fields but keep the record
    await prisma.socialMediaConfig.update({
      where: { platform },
      data: {
        enabled: false,
        twitterApiKey: null,
        twitterApiSecret: null,
        twitterAccessToken: null,
        twitterAccessTokenSecret: null,
        twitterBearerToken: null,
        telegramBotToken: null,
        telegramChannelId: null,
        telegramChannelUsername: null,
        instagramAccessToken: null,
        instagramAppId: null,
        instagramAppSecret: null,
        lastTestResult: null,
        lastTestTimestamp: null,
      },
    });

    return NextResponse.json({ success: true, message: "Configuration cleared" });
  } catch (error) {
    console.error("Error clearing social media config:", error);
    return NextResponse.json(
      { error: "Failed to clear configuration" },
      { status: 500 }
    );
  }
}
