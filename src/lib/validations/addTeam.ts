import * as z from 'zod';

export const addTeamSchema = z.object({
    clubId: z.string().min(1, 'Club ID is required'),
    clubName: z.string().min(1, 'Club name is required'),
    logo: z.string().url().optional().or(z.literal('')),
})

export type AddTeamFormData = z.infer<typeof addTeamSchema>