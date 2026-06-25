import type { FoodSearchRequest } from "@/lib/schemas";

export type GooglePlace = {
  id: string;

  displayName?: {
    text?: string;
  };

  formattedAddress?: string;

  location?: {
    latitude?: number;
    longitude?: number;
  };

  types?: string[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  dineIn?: boolean;
  takeout?: boolean;
  delivery?: boolean;

  currentOpeningHours?: {
    openNow?: boolean;
  };

  googleMapsUri?: string;
  websiteUri?: string;
};

type GoogleTextSearchResponse = {
  places?: GooglePlace[];
};

function buildSearchQuery(search: FoodSearchRequest): string {
  const parts: string[] = [];

  if (
    search.cuisine.trim() &&
    search.cuisine.toLowerCase() !== "any"
  ) {
    parts.push(search.cuisine.trim());
  }

  if (
    search.foodType.trim() &&
    search.foodType.toLowerCase() !== "any"
  ) {
    parts.push(search.foodType.trim());
  }

  if (search.serviceStyles.includes("drive_through")) {
    parts.push("drive through");
  }

  parts.push("restaurant");

  return parts.join(" ");
}

export async function searchGooglePlaces(
  search: FoodSearchRequest,
): Promise<GooglePlace[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY is missing from .env.local.",
    );
  }

  const radiusMeters = Math.max(
    100,
    Math.min(search.distance.maxMiles * 1609.344, 50_000),
  );

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      cache: "no-store",

      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.types",
          "places.rating",
          "places.userRatingCount",
          "places.priceLevel",
          "places.dineIn",
          "places.takeout",
          "places.delivery",
          "places.currentOpeningHours",
          "places.googleMapsUri",
          "places.websiteUri",
        ].join(","),
      },

      body: JSON.stringify({
        textQuery: buildSearchQuery(search),
        pageSize: 20,

        locationBias: {
          circle: {
            center: {
              latitude: search.location.latitude,
              longitude: search.location.longitude,
            },
            radius: radiusMeters,
          },
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Google Places error ${response.status}: ${errorText}`,
    );
  }

  const data =
    (await response.json()) as GoogleTextSearchResponse;

  return data.places ?? [];
}