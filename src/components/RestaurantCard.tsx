import type { RecommendedPlace } from "@/lib/googlePlaces";

type RestaurantCardProps = {
  place: RecommendedPlace;
};

function formatDistance(distanceMiles: number | null): string {
  if (distanceMiles === null) {
    return "Distance unavailable";
  }

  if (distanceMiles < 0.1) {
    return "Less than 0.1 mi";
  }

  return `${distanceMiles.toFixed(1)} mi`;
}

function formatPriceLevel(priceLevel?: string): string | null {
  if (!priceLevel || priceLevel === "PRICE_LEVEL_UNSPECIFIED") {
    return null;
  }

  const priceLabels: Record<string, string> = {
    PRICE_LEVEL_FREE: "Free",
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
  };

  return priceLabels[priceLevel] ?? null;
}

export default function RestaurantCard({ place }: RestaurantCardProps) {
  const name = place.displayName?.text ?? "Unnamed restaurant";
  const priceLevel = formatPriceLevel(place.priceLevel);
  const serviceOptions = [
    place.dineIn ? "Dine-in" : null,
    place.takeout ? "Takeout" : null,
    place.delivery ? "Delivery" : null,
  ].filter(Boolean);

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{name}</h3>

          {place.formattedAddress && (
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {place.formattedAddress}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300">
            {formatDistance(place.distanceMiles)}
          </span>

          {priceLevel && (
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-300">
              {priceLevel}
            </span>
          )}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
        <div>
          <dt className="text-zinc-500">Rating</dt>
          <dd className="mt-1 font-medium">
            {place.rating
              ? `${place.rating.toFixed(1)} (${place.userRatingCount ?? 0})`
              : "Not rated"}
          </dd>
        </div>

        <div>
          <dt className="text-zinc-500">Open now</dt>
          <dd className="mt-1 font-medium">
            {place.currentOpeningHours?.openNow === undefined
              ? "Unknown"
              : place.currentOpeningHours.openNow
                ? "Yes"
                : "No"}
          </dd>
        </div>

        <div>
          <dt className="text-zinc-500">Service</dt>
          <dd className="mt-1 font-medium">
            {serviceOptions.length > 0 ? serviceOptions.join(", ") : "Unknown"}
          </dd>
        </div>
      </dl>

      {(place.googleMapsUri || place.websiteUri) && (
        <div className="mt-5 flex flex-wrap gap-3">
          {place.googleMapsUri && (
            <a
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400"
              href={place.googleMapsUri}
              rel="noreferrer"
              target="_blank"
            >
              View on Maps
            </a>
          )}

          {place.websiteUri && (
            <a
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-orange-500"
              href={place.websiteUri}
              rel="noreferrer"
              target="_blank"
            >
              Website
            </a>
          )}
        </div>
      )}
    </article>
  );
}
