import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const apis = await prisma.api.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(apis);
  } catch (error) {
    console.error("Error fetching APIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch APIs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, apiKey, endpointUrl, httpMethod, description } = body;

    if (!name || !endpointUrl) {
      return NextResponse.json(
        { error: "Name and Endpoint URL are required" },
        { status: 400 }
      );
    }

    const api = await prisma.api.create({
      data: {
        name,
        apiKey: apiKey || null,
        endpointUrl,
        httpMethod: httpMethod || "GET",
        description: description || null,
      },
    });

    return NextResponse.json(api, { status: 201 });
  } catch (error) {
    console.error("Error creating API:", error);
    return NextResponse.json(
      { error: "Failed to create API" },
      { status: 500 }
    );
  }
}
