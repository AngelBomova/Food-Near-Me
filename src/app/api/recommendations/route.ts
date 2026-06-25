import { searchGooglePlaces } from "@/lib/googlePlaces";
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

    const places = await searchGooglePlaces(parsed.data);

    return Response.json({
      success: true,
      resultCount: places.length,
      places,
    });
  } catch (error) {
    console.error("Recommendation route error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "The restaurant search failed.",
      },
      {
        status: 500,
      },
    );
  }
}