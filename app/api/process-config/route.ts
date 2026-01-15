import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Verify prisma is initialized
    if (!prisma) {
      console.error("Prisma client is undefined in GET");
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

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
              dailyPostCount: 5,
              dailyTimeRangeStart: "09:00",
              dailyTimeRangeEnd: "16:00",
              weeklyEnabled: false,
              weeklyPostCount: 10,
              weeklyTimeRangeStart: "09:00",
              weeklyTimeRangeEnd: "18:00",
            },
            twitter: {
              dailyEnabled: false,
              dailyPostCount: 5,
              dailyTimeRangeStart: "09:00",
              dailyTimeRangeEnd: "16:00",
              weeklyEnabled: false,
              weeklyPostCount: 10,
              weeklyTimeRangeStart: "09:00",
              weeklyTimeRangeEnd: "18:00",
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
    console.log("POST /api/process-config - Starting save process");
    
    // Basic prisma check
    if (!prisma) {
      console.error("Prisma client is undefined");
      return NextResponse.json(
        { 
          error: "Database connection error",
          details: "Prisma client is not initialized"
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("Received body:", JSON.stringify(body, null, 2));
    
    const {
      highPriorityKeywords,
      volatilityThreshold,
      language,
      newsTimeWindow,
      duplicateThreshold,
      cacheDuration,
      platformSettings,
    } = body;

    // Validate and prepare data
    const configData: any = {
      highPriorityKeywords: highPriorityKeywords !== undefined ? String(highPriorityKeywords) : "",
      volatilityThreshold: volatilityThreshold !== undefined ? parseFloat(String(volatilityThreshold)) : 2.0,
      language: language !== undefined ? String(language) : "en",
      newsTimeWindow: newsTimeWindow !== undefined ? parseInt(String(newsTimeWindow)) : 2,
      duplicateThreshold: duplicateThreshold !== undefined ? parseFloat(String(duplicateThreshold)) : 80.0,
      cacheDuration: cacheDuration !== undefined ? parseInt(String(cacheDuration)) : 300,
    };

    // Handle platformSettings with migration support
    if (platformSettings !== undefined && platformSettings !== null) {
      try {
        let parsedSettings: any;
        
        // If it's already a string, parse it
        if (typeof platformSettings === 'string') {
          parsedSettings = JSON.parse(platformSettings);
        } else {
          parsedSettings = platformSettings;
        }

        // Migrate old format to new format
        const migrateSettings = (settings: any) => {
          if (!settings) return null;
          
          // Check if old format (has timeRangeStart/timeRangeEnd instead of dailyTimeRangeStart)
          if (settings.timeRangeStart && !settings.dailyTimeRangeStart) {
            return {
              dailyEnabled: settings.dailyEnabled || false,
              dailyPostCount: settings.dailyPostCount || 5,
              dailyTimeRangeStart: settings.timeRangeStart || "09:00",
              dailyTimeRangeEnd: settings.timeRangeEnd || "16:00",
              weeklyEnabled: settings.weeklyEnabled || false,
              weeklyPostCount: settings.weeklyPostCount || 10,
              weeklyTimeRangeStart: settings.weeklyTimeRangeStart || "09:00",
              weeklyTimeRangeEnd: settings.weeklyTimeRangeEnd || "18:00",
            };
          }
          
          // Ensure all new fields exist
          return {
            dailyEnabled: settings.dailyEnabled ?? false,
            dailyPostCount: settings.dailyPostCount ?? 5,
            dailyTimeRangeStart: settings.dailyTimeRangeStart || "09:00",
            dailyTimeRangeEnd: settings.dailyTimeRangeEnd || "16:00",
            weeklyEnabled: settings.weeklyEnabled ?? false,
            weeklyPostCount: settings.weeklyPostCount ?? 10,
            weeklyTimeRangeStart: settings.weeklyTimeRangeStart || "09:00",
            weeklyTimeRangeEnd: settings.weeklyTimeRangeEnd || "18:00",
          };
        };

        const migratedSettings = {
          telegram: migrateSettings(parsedSettings.telegram),
          twitter: migrateSettings(parsedSettings.twitter),
        };

        configData.platformSettings = JSON.stringify(migratedSettings);
      } catch (jsonError) {
        console.error("Error parsing platformSettings:", jsonError);
        // Use default if invalid
        configData.platformSettings = JSON.stringify({
          telegram: {
            dailyEnabled: false,
            dailyPostCount: 5,
            dailyTimeRangeStart: "09:00",
            dailyTimeRangeEnd: "16:00",
            weeklyEnabled: false,
            weeklyPostCount: 10,
            weeklyTimeRangeStart: "09:00",
            weeklyTimeRangeEnd: "18:00",
          },
          twitter: {
            dailyEnabled: false,
            dailyPostCount: 5,
            dailyTimeRangeStart: "09:00",
            dailyTimeRangeEnd: "16:00",
            weeklyEnabled: false,
            weeklyPostCount: 10,
            weeklyTimeRangeStart: "09:00",
            weeklyTimeRangeEnd: "18:00",
          },
        });
      }
    } else {
      // Default platform settings if not provided
      configData.platformSettings = JSON.stringify({
            telegram: {
              dailyEnabled: false,
              dailyPostCount: 5,
              dailyTimeRangeStart: "09:00",
              dailyTimeRangeEnd: "16:00",
              weeklyEnabled: false,
              weeklyPostCount: 10,
              weeklyTimeRangeStart: "09:00",
              weeklyTimeRangeEnd: "18:00",
            },
            twitter: {
              dailyEnabled: false,
              dailyPostCount: 5,
              dailyTimeRangeStart: "09:00",
              dailyTimeRangeEnd: "16:00",
              weeklyEnabled: false,
              weeklyPostCount: 10,
              weeklyTimeRangeStart: "09:00",
              weeklyTimeRangeEnd: "18:00",
            },
      });
    }

    console.log("Prepared configData:", JSON.stringify(configData, null, 2));

    // Check if config exists - with error handling
    let existingConfig;
    try {
      existingConfig = await prisma.processConfig.findFirst();
      console.log("Existing config found:", !!existingConfig);
    } catch (prismaError: any) {
      console.error("Error accessing processConfig model:", prismaError);
      console.error("Prisma error code:", prismaError.code);
      console.error("Prisma error message:", prismaError.message);
      return NextResponse.json(
        { 
          error: "Database model error",
          details: prismaError.message || "ProcessConfig model not accessible",
          code: prismaError.code || "MODEL_ERROR"
        },
        { status: 500 }
      );
    }

    let savedConfig;
    try {
      if (existingConfig) {
        console.log("Updating existing config with id:", existingConfig.id);
        savedConfig = await prisma.processConfig.update({
          where: { id: existingConfig.id },
          data: configData,
        });
      } else {
        console.log("Creating new config");
        savedConfig = await prisma.processConfig.create({
          data: configData,
        });
      }

      console.log("Config saved successfully:", savedConfig.id);
      return NextResponse.json(savedConfig);
    } catch (saveError: any) {
      console.error("Error saving to database:", saveError);
      console.error("Save error code:", saveError.code);
      console.error("Save error message:", saveError.message);
      console.error("Save error meta:", saveError.meta);
      return NextResponse.json(
        { 
          error: "Failed to save to database",
          details: saveError.message || "Unknown database error",
          code: saveError.code || "SAVE_ERROR",
          meta: saveError.meta
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error saving process config:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);
    
    return NextResponse.json(
      { 
        error: "Failed to save process configuration",
        details: error.message || "Unknown error",
        code: error.code || "UNKNOWN",
        name: error.name || "Error"
      },
      { status: 500 }
    );
  }
}
