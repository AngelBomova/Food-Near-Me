import type { RecommendedPlace } from "@/lib/googlePlaces";
import RestaurantCard from "@/components/RestaurantCard";

type RestaurantListProps = {
  places: RecommendedPlace[];
};

export default function RestaurantList({ places }: RestaurantListProps) {
  if (places.length === 0) {
    return (
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-300">
        No restaurants matched those filters. Try widening the distance, budget,
        or food type.
      </section>
    );
  }

  return (
    <section aria-labelledby="recommendations-heading" className="space-y-4">
      <div>
        <h2
          className="text-2xl font-semibold text-white"
          id="recommendations-heading"
        >
          Recommendations
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Sorted by rating, review count, then distance.
        </p>
      </div>

      <div className="space-y-4">
        {places.map((place) => (
          <RestaurantCard key={place.id} place={place} />
        ))}
      </div>
    </section>
  );
}
