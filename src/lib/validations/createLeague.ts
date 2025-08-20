import * as z from 'zod'

export const CreateLeagueSchema = z.object({
  league_name: z.string().min(2, 'League name must be at least 2 characters'),
  description: z.string().max(240, 'Description must be at most 240 characters').optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
})
export type CreateLeagueFormData = z.infer<typeof CreateLeagueSchema>