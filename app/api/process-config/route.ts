import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let config = await prisma.processConfig.findFirst();

    // If no config exists, create default one
    if (!config) {
      config = await prisma.processConfig.create({
        data: {
          highPriorityKeywords: "bitcoin\nethereum\nfed\ninterest rates\nsec\netf",
          volatilityThreshold: 2.0,
          language: "en",
          newsTimeWindow: 2,
          duplicateThreshold: 80.0,
          cacheDuration: 300,
          platformSettings: JSON.stringify({
            telegram: {
              dailyEnabled: false,
              weeklyEnabled: false,
              dailyPostCount: 5,
              timeRangeStart: "09:00",
              timeRangeEnd: "16:00",
            },
            twitter: {
              dailyEnabled: false,
              weeklyEnabled: false,
              dailyPostCount: 5,
              timeRangeStart: "09:00",
              timeRangeEnd: "16:00",
            },
          }),
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching process config:", error);
    return NextResponse.json(
      { error: "Failed to fetch process configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      highPriorityKeywords,
      volatilityThreshold,
      language,
      newsTimeWindow,
      duplicateThreshold,
      cacheDuration,
      platformSettings,
    } = body;

    let config = await prisma.processConfig.findFirst();

    const configData: any = {
      highPriorityKeywords: highPriorityKeywords || "",
      volatilityThreshold: parseFloat(volatilityThreshold) || 2.0,
      language: language || "en",
      newsTimeWindow: parseInt(newsTimeWindow) || 2,
      duplicateThreshold: parseFloat(duplicateThreshold) || 80.0,
      cacheDuration: parseInt(cacheDuration) || 300,
    };

    if (platformSettings) {
      configData.platformSettings = typeof platformSettings === 'string' 
        ? platformSettings 
        : JSON.stringify(platformSettings);
    }

    if (config) {
      config = await prisma.processConfig.update({
        where: { id: config.id },
        data: configData,
      });
    } else {
      config = await prisma.processConfig.create({
        data: {
          ...configData,
          platformSettings: configData.platformSettings || JSON.stringify({
            telegram: {
              dailyEnabled: false,
              weeklyEnabled: false,
              dailyPostCount: 5,
              timeRangeStart: "09:00",
              timeRangeEnd: "16:00",
            },
            twitter: {
              dailyEnabled: false,
              weeklyEnabled: false,
              dailyPostCount: 5,
              timeRangeStart: "09:00",
              timeRangeEnd: "16:00",
            },
          }),
        },
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Error saving process config:", error);
    return NextResponse.json(
      { 
        error: "Failed to save process configuration",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
