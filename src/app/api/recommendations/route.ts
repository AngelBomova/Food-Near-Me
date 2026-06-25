import { FoodSearchSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const parsed = FoodSearchSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: "Invalid search information.",
          details: parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    return Response.json({
      success: true,
      message: "The backend received valid search information.",
      receivedData: parsed.data,
    });
  } catch (error) {
    console.error("Recommendation route error:", error);

    return Response.json(
      {
        success: false,
        error: "The request could not be processed.",
      },
      {
        status: 500,
      },
    );
  }
}