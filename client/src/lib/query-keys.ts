import { UseQueryOptions } from "@tanstack/react-query";

export const queryKeys = {
  user: ['user'] as const,
  offers: ['offers'] as const,
  decisions: ['decisions'] as const,
  problemTrees: ['problem-trees'] as const,
  draftedPlans: ['drafted-plans'] as const,
  brainDump: ['brain-dump'] as const,
  priorities: ['priorities'] as const,
  weeklyReflections: ['weekly-reflections'] as const,
  monthlyCheckIns: ['monthly-check-ins'] as const,
  clarityLabs: ['clarity-labs'] as const,
  offerNotes: ['offer-notes'] as const,
} as const;

export const defaultQueryConfig: Partial<UseQueryOptions> = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 60, // 1 hour
  refetchOnWindowFocus: false,
  retry: 2,
};

export function getQueryKey(key: keyof typeof queryKeys, id?: number) {
  const baseKey = queryKeys[key];
  return id ? [...baseKey, id] : baseKey;
} 