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

    if (!prisma || !prisma.socialMediaConfig) {
      console.error("Prisma client is not properly initialized");
      return NextResponse.json(
        { 
          success: false,
          error: "Database connection error",
          message: "Prisma client is not initialized"
        },
        { status: 500 }
      );
    }

    console.log("Fetching config for platform:", platform);
    const config = await prisma.socialMediaConfig.findUnique({
      where: { platform },
    });

    if (!config) {
      return NextResponse.json(
        { 
          success: false,
          message: "Configuration not found. Please save the configuration first.",
          error: "Configuration not found"
        },
        { status: 404 }
      );
    }

    let testResult: any = {
      success: false,
      message: "",
      timestamp: new Date().toISOString(),
    };

    if (platform === "telegram") {
      // Test Telegram Bot API
      if (!config.telegramBotToken) {
        testResult.message = "Bot Token is required";
        return NextResponse.json(testResult);
      }

      try {
        // Get bot info
        const botInfoResponse = await fetch(
          `https://api.telegram.org/bot${config.telegramBotToken}/getMe`,
          {
            method: "GET",
            signal: AbortSignal.timeout(10000),
          }
        );

        if (!botInfoResponse.ok) {
          let errorMessage = botInfoResponse.statusText;
          try {
            const errorData = await botInfoResponse.json();
            errorMessage = errorData.description || errorData.error_code || errorMessage;
          } catch {
            // If JSON parsing fails, use status text
          }
          testResult.message = `Failed to connect: ${errorMessage}`;
          return NextResponse.json(testResult);
        }

        const botInfo = await botInfoResponse.json();
        
        if (!botInfo.ok) {
          testResult.message = `Bot API error: ${botInfo.description || "Unknown error"}`;
          return NextResponse.json(testResult);
        }

        // Try to send a test message if channel ID is provided
        if (config.telegramChannelId) {
          const testMessage = "🧪 Test message from Volensy News Generator";
          const sendMessageResponse = await fetch(
            `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chat_id: config.telegramChannelId,
                text: testMessage,
              }),
              signal: AbortSignal.timeout(10000),
            }
          );

          if (sendMessageResponse.ok) {
            const sendResult = await sendMessageResponse.json();
            if (sendResult.ok) {
              const channelInfo = config.telegramChannelUsername
                ? ` | Channel: ${config.telegramChannelUsername}`
                : "";
              testResult.success = true;
              testResult.message = `Bot: @${botInfo.result.username}${channelInfo}`;
            } else {
              testResult.message = `Bot verified but failed to send message: ${sendResult.description || "Unknown error"}`;
            }
          } else {
            let errorMessage = sendMessageResponse.statusText;
            try {
              const errorData = await sendMessageResponse.json();
              errorMessage = errorData.description || errorData.error_code || errorMessage;
            } catch {
              // If JSON parsing fails, use status text
            }
            testResult.message = `Bot verified but failed to send message: ${errorMessage}`;
          }
        } else {
          testResult.success = true;
          testResult.message = `Bot: @${botInfo.result.username}`;
        }
      } catch (error: any) {
        testResult.message = `Connection failed: ${error.message}`;
        return NextResponse.json(testResult);
      }
    } else if (platform === "twitter") {
      // Test Twitter API
      if (!config.twitterBearerToken && !config.twitterAccessToken) {
        testResult.message = "Bearer Token or Access Token is required";
        return NextResponse.json(testResult);
      }

      try {
        // Prefer Bearer Token for Twitter API v2
        const token = config.twitterBearerToken || config.twitterAccessToken;
        if (!token) {
          testResult.message = "No valid token found";
          return NextResponse.json(testResult);
        }

        const authHeader = `Bearer ${token}`;

        // Test by getting user info (Twitter API v2)
        const userResponse = await fetch(
          "https://api.twitter.com/2/users/me?user.fields=username",
          {
            method: "GET",
            headers: {
              Authorization: authHeader,
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          let errorMessage = `HTTP ${userResponse.status}: ${userResponse.statusText}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.detail || errorData.title || errorMessage;
          } catch {
            // Use default error message
          }
          testResult.message = `Failed to connect: ${errorMessage}`;
          return NextResponse.json(testResult);
        }

        const userData = await userResponse.json();
        testResult.success = true;
        testResult.message = `Connected as: @${userData.data?.username || "User"}`;
      } catch (error: any) {
        testResult.message = `Connection failed: ${error.message}`;
        return NextResponse.json(testResult);
      }
    } else if (platform === "instagram") {
      // Instagram test (placeholder)
      testResult.message = "Instagram API testing not yet implemented";
      return NextResponse.json(testResult);
    }

    // Update last test result in database
    await prisma.socialMediaConfig.update({
      where: { platform },
      data: {
        lastTestResult: JSON.stringify(testResult),
        lastTestTimestamp: new Date(),
      },
    });

    return NextResponse.json(testResult);
  } catch (error: any) {
    console.error("Error testing social media API:", error);
    return NextResponse.json(
      { 
        error: "Failed to test API", 
        success: false,
        message: error.message || "An unexpected error occurred",
        details: error.stack
      },
      { status: 500 }
    );
  }
}
