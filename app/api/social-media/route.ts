import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");

    if (platform) {
      const config = await prisma.socialMediaConfig.findUnique({
        where: { platform },
      });
      return NextResponse.json(config || null);
    }

    const configs = await prisma.socialMediaConfig.findMany();
    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching social media config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      platform,
      enabled,
      twitterApiKey,
      twitterApiSecret,
      twitterAccessToken,
      twitterAccessTokenSecret,
      twitterBearerToken,
      telegramBotToken,
      telegramChannelId,
      telegramChannelUsername,
      instagramAccessToken,
      instagramAppId,
      instagramAppSecret,
    } = body;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    // Convert empty strings to null
    const cleanValue = (value: string | null | undefined) => {
      if (!value || typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed !== "" ? trimmed : null;
    };

    console.log("Attempting to save config for platform:", platform);
    console.log("Config data:", {
      platform,
      enabled,
      hasTelegramToken: !!telegramBotToken,
      hasTwitterToken: !!twitterBearerToken || !!twitterAccessToken,
    });

    if (!prisma || !prisma.socialMediaConfig) {
      console.error("Prisma client is not properly initialized");
      return NextResponse.json(
        { 
          error: "Database connection error",
          details: "Prisma client is not initialized"
        },
        { status: 500 }
      );
    }

    const config = await prisma.socialMediaConfig.upsert({
      where: { platform },
      update: {
        enabled: enabled ?? false,
        twitterApiKey: cleanValue(twitterApiKey),
        twitterApiSecret: cleanValue(twitterApiSecret),
        twitterAccessToken: cleanValue(twitterAccessToken),
        twitterAccessTokenSecret: cleanValue(twitterAccessTokenSecret),
        twitterBearerToken: cleanValue(twitterBearerToken),
        telegramBotToken: cleanValue(telegramBotToken),
        telegramChannelId: cleanValue(telegramChannelId),
        telegramChannelUsername: cleanValue(telegramChannelUsername),
        instagramAccessToken: cleanValue(instagramAccessToken),
        instagramAppId: cleanValue(instagramAppId),
        instagramAppSecret: cleanValue(instagramAppSecret),
      },
      create: {
        platform,
        enabled: enabled ?? false,
        twitterApiKey: cleanValue(twitterApiKey),
        twitterApiSecret: cleanValue(twitterApiSecret),
        twitterAccessToken: cleanValue(twitterAccessToken),
        twitterAccessTokenSecret: cleanValue(twitterAccessTokenSecret),
        twitterBearerToken: cleanValue(twitterBearerToken),
        telegramBotToken: cleanValue(telegramBotToken),
        telegramChannelId: cleanValue(telegramChannelId),
        telegramChannelUsername: cleanValue(telegramChannelUsername),
        instagramAccessToken: cleanValue(instagramAccessToken),
        instagramAppId: cleanValue(instagramAppId),
        instagramAppSecret: cleanValue(instagramAppSecret),
      },
    });

    console.log("Config saved successfully:", config.id);
    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Error saving social media config:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: "Failed to save configuration",
        details: error.message || "Unknown error",
        code: error.code || "UNKNOWN"
      },
      { status: 500 }
    );
  }
}
