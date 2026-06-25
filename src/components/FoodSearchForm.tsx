"use client";

import { FormEvent, useState } from "react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SearchPayload = {
  location: Coordinates;
  distance: {
    minMiles: number;
    maxMiles: number;
  };
  budget: {
    minUsd: number;
    maxUsd: number;
  };
  cuisine: string;
  foodType: string;
  serviceStyles: string[];
  extraNotes: string | null;
};

function getBrowserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser does not support location services."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission was denied."));
          return;
        }

        reject(new Error("Your location could not be determined."));
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 300_000,
      },
    );
  });
}

export default function FoodSearchForm() {
  const [minMiles, setMinMiles] = useState(0);
  const [maxMiles, setMaxMiles] = useState(10);
  const [notesNotApplicable, setNotesNotApplicable] = useState(false);
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState<SearchPayload | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreview(null);

    const formData = new FormData(event.currentTarget);

    const minBudget = Number(formData.get("minBudget"));
    const maxBudget = Number(formData.get("maxBudget"));

    if (minMiles > maxMiles) {
      setStatus("Minimum distance cannot be greater than maximum distance.");
      return;
    }

    if (minBudget > maxBudget) {
      setStatus("Minimum budget cannot be greater than maximum budget.");
      return;
    }

    try {
      setStatus("Requesting your location...");

      const location = await getBrowserLocation();

      const payload: SearchPayload = {
        location,

        distance: {
          minMiles,
          maxMiles,
        },

        budget: {
          minUsd: minBudget,
          maxUsd: maxBudget,
        },

        cuisine: String(formData.get("cuisine") ?? "").trim(),

        foodType: String(formData.get("foodType") ?? "").trim(),

        serviceStyles: formData
          .getAll("serviceStyle")
          .map((value) => String(value)),

        extraNotes: notesNotApplicable
          ? null
          : String(formData.get("extraNotes") ?? "").trim() || null,
      };

      setStatus("Searching for recommendations...");

const response = await fetch("/api/recommendations", {
  method: "POST",

  headers: {
    "Content-Type": "application/json",
  },

  body: JSON.stringify(payload),
});

const data = await response.json();

if (!response.ok) {
  throw new Error(
    typeof data.error === "string"
      ? data.error
      : "The recommendation request failed.",
  );
}

setPreview(payload);
setStatus("The backend received the search successfully.");

console.log("Backend response:", data);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">
      <form className="space-y-8" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="text-xl font-semibold">Location range</legend>

          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-zinc-300">
                Minimum: {minMiles} miles
              </span>

              <input
                className="w-full accent-orange-500"
                type="range"
                min="0"
                max="50"
                value={minMiles}
                onChange={(event) => setMinMiles(Number(event.target.value))}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-300">
                Maximum: {maxMiles} miles
              </span>

              <input
                className="w-full accent-orange-500"
                type="range"
                min="0"
                max="50"
                value={maxMiles}
                onChange={(event) => setMaxMiles(Number(event.target.value))}
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xl font-semibold">Budget per person</legend>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-zinc-300">
                Minimum budget
              </span>

              <input
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
                type="number"
                name="minBudget"
                min="1"
                step="1"
                defaultValue="10"
                required
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-300">
                Maximum budget
              </span>

              <input
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
                type="number"
                name="maxBudget"
                min="1"
                step="1"
                defaultValue="30"
                required
              />
            </label>
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Cuisine</span>

            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              type="text"
              name="cuisine"
              placeholder="Korean, Italian, Albanian..."
              maxLength={100}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Type of food</span>

            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              type="text"
              name="foodType"
              placeholder="Fried chicken, cookies, sushi..."
              maxLength={100}
              required
            />
          </label>
        </div>

        <fieldset>
          <legend className="text-xl font-semibold">Dining style</legend>
          <p className="mt-1 text-sm text-zinc-400">
            Select all that apply.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["drive_through", "Drive-through"],
              ["fast_food", "Fast food"],
              ["sit_down", "Sit-down"],
            ].map(([value, label]) => (
              <label
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4"
                key={value}
              >
                <input
                  className="h-4 w-4 accent-orange-500"
                  type="checkbox"
                  name="serviceStyle"
                  value={value}
                />

                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          <span className="mb-2 block text-xl font-semibold">Extra notes</span>

          <textarea
            className="min-h-28 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-50"
            name="extraNotes"
            placeholder="Large portions, easy parking, spicy food..."
            maxLength={500}
            disabled={notesNotApplicable}
          />
        </label>

        <button
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:border-orange-500"
          type="button"
          onClick={() => setNotesNotApplicable((current) => !current)}
        >
          {notesNotApplicable ? "Add notes instead" : "N/A"}
        </button>

        <button
          className="w-full rounded-xl bg-orange-500 px-5 py-4 font-semibold text-black hover:bg-orange-400"
          type="submit"
        >
          Test search form
        </button>
      </form>

      {status && (
        <p className="mt-6 rounded-xl bg-zinc-950 p-4 text-sm text-zinc-300">
          {status}
        </p>
      )}

      {preview && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Generated search data</h2>

          <pre className="overflow-x-auto rounded-xl bg-black p-4 text-xs text-green-300">
            {JSON.stringify(preview, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}