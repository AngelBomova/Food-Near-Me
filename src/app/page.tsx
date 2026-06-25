import FoodSearchForm from "@/components/FoodSearchForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-400">
            Food Near Me
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find food that matches exactly what you want
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Enter your distance, budget, cuisine, food type, and dining
            preferences to receive personalized restaurant recommendations.
          </p>
        </header>

        <FoodSearchForm />
      </div>
    </main>
  );
}