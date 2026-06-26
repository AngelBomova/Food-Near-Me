# Food Near Me

A small Next.js app that helps users find nearby restaurants based on location,
distance, budget, cuisine, food type, and dining style.

The app asks for the user's browser location, sends the search preferences to a
backend route, searches Google Places, filters restaurants by distance, and shows
matching results in the UI.

## Features

- Browser geolocation for nearby restaurant search
- Distance and budget inputs
- Cuisine and food type search fields
- Dining style options for drive-through, fast food, and sit-down
- Google Places restaurant lookup
- Result cards with rating, distance, service options, and links

## Requirements

- Node.js
- npm
- A Google Places API key

## Environment Variables

Create a `.env.local` file in the project root:

```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Useful Commands

```bash
npm run lint
npm run build
```

## Project Structure

```text
src/app/page.tsx                     Home page
src/app/api/recommendations/route.ts Recommendation API route
src/components/FoodSearchForm.tsx    Search form
src/components/RestaurantList.tsx    Results list
src/components/RestaurantCard.tsx    Restaurant result card
src/lib/googlePlaces.ts              Google Places search helper
src/lib/schemas.ts                   Request validation schema
```
