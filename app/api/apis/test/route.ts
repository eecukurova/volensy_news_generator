import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiId, endpointUrl, httpMethod, apiKey } = body;

    let api;
    
    // If apiId is provided, fetch from database
    if (apiId && apiId !== "temp") {
      api = await prisma.api.findUnique({
        where: { id: apiId },
      });

      if (!api) {
        return NextResponse.json(
          { error: "API not found" },
          { status: 404 }
        );
      }
    } else if (endpointUrl) {
      // Use provided endpoint data for testing before saving
      api = {
        endpointUrl,
        httpMethod: httpMethod || "GET",
        apiKey: apiKey || null,
      } as any;
    } else {
      return NextResponse.json(
        { error: "API ID or endpoint URL is required" },
        { status: 400 }
      );
    }

    // Test the API endpoint
    let testResult;
    try {
      // Build URL with API key if provided
      let url = api.endpointUrl;
      if (api.apiKey) {
        const separator = url.includes("?") ? "&" : "?";
        url = `${url}${separator}api_key=${api.apiKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

      const response = await fetch(url, {
        method: api.httpMethod,
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      testResult = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        available: response.ok,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      testResult = {
        status: 0,
        statusText: error.message || "Connection failed",
        ok: false,
        available: false,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }

    return NextResponse.json(testResult);
  } catch (error) {
    console.error("Error testing API:", error);
    return NextResponse.json(
      { error: "Failed to test API" },
      { status: 500 }
    );
  }
}
