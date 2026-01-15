import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.api.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API:", error);
    return NextResponse.json(
      { error: "Failed to delete API" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, apiKey, endpointUrl, httpMethod, description } = body;

    const api = await prisma.api.update({
      where: { id },
      data: {
        name,
        apiKey: apiKey || null,
        endpointUrl,
        httpMethod: httpMethod || "GET",
        description: description || null,
      },
    });

    return NextResponse.json(api);
  } catch (error) {
    console.error("Error updating API:", error);
    return NextResponse.json(
      { error: "Failed to update API" },
      { status: 500 }
    );
  }
}
