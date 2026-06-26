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

export type RecommendedPlace = GooglePlace & {
  distanceMiles: number | null;
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

function getDistanceMiles(
  origin: FoodSearchRequest["location"],
  destination: GooglePlace["location"],
): number | null {
  if (
    destination?.latitude === undefined ||
    destination.longitude === undefined
  ) {
    return null;
  }

  const earthRadiusMiles = 3958.8;
  const degreesToRadians = Math.PI / 180;
  const originLatitude = origin.latitude * degreesToRadians;
  const destinationLatitude = destination.latitude * degreesToRadians;
  const latitudeDelta =
    (destination.latitude - origin.latitude) * degreesToRadians;
  const longitudeDelta =
    (destination.longitude - origin.longitude) * degreesToRadians;

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    earthRadiusMiles *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export async function searchGooglePlaces(
  search: FoodSearchRequest,
): Promise<RecommendedPlace[]> {
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

  return (data.places ?? [])
    .map((place) => ({
      ...place,
      distanceMiles: getDistanceMiles(search.location, place.location),
    }))
    .filter((place) => {
      if (place.distanceMiles === null) {
        return false;
      }

      return (
        place.distanceMiles >= search.distance.minMiles &&
        place.distanceMiles <= search.distance.maxMiles
      );
    })
    .sort((first, second) => {
      const ratingDelta = (second.rating ?? 0) - (first.rating ?? 0);

      if (ratingDelta !== 0) {
        return ratingDelta;
      }

      const reviewDelta =
        (second.userRatingCount ?? 0) - (first.userRatingCount ?? 0);

      if (reviewDelta !== 0) {
        return reviewDelta;
      }

      return (first.distanceMiles ?? Infinity) - (second.distanceMiles ?? Infinity);
    });
}
