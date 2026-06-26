import { z } from "zod";

export const FoodSearchSchema = z.object({
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),

  distance: z
    .object({
      minMiles: z.number().min(0).max(50),
      maxMiles: z.number().min(0).max(50),
    })
    .refine(
      (distance) => distance.minMiles <= distance.maxMiles,
      {
        message:
          "Minimum distance cannot exceed maximum distance.",
      },
    ),

  budget: z
    .object({
      maxUsd: z.number().min(1),
    })
    .strict(),

  cuisine: z.string().trim().min(1).max(100),

  foodType: z.string().trim().min(1).max(100),

  serviceStyles: z
    .array(
      z.enum([
        "drive_through",
        "fast_food",
        "takeout",
        "sit_down",
      ]),
    )
    .max(4),

  extraNotes: z.string().trim().max(500).nullable(),
});

export type FoodSearchRequest = z.infer<
  typeof FoodSearchSchema
>;
