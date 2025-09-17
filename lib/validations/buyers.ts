import { z } from 'zod'

export const CITIES = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'] as const
export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'] as const
export const BHK_OPTIONS = ['1', '2', '3', '4', 'Studio'] as const
export const PURPOSES = ['Buy', 'Rent'] as const
export const TIMELINES = ['0-3m', '3-6m', '>6m', 'Exploring'] as const
export const SOURCES = ['Website', 'Referral', 'Walk-in', 'Call', 'Other'] as const
export const STATUSES = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'] as const

//Main buyer schema
export const buyerSchema = z.object({
    fullName: z.string().min(2, 'Name must be atleast two characters long'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string()
        .regex(/^\d{10,15}$/, 'Phone must be 10-15 digits')
        .min(10, 'Phone must be atleast 10 characters long')
        .max(15, 'Phoen must not exceed 15 digits'),
    city: z.enum(CITIES),
    propertyType: z.enum(PROPERTY_TYPES).optional().nullable(),
    bhk: z.enum(BHK_OPTIONS),
    purposes: z.enum(PURPOSES),
    budgetMin: z.number().int().positive().optional().nullable(),
    budgetMax: z.number().int().positive().optional().nullable(),
    timeline: z.enum(TIMELINES).optional().nullable(),
    source: z.enum(SOURCES),
    status: z.enum(STATUSES).default('New'),
    notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional().nullable(),
    tags: z.array(z.string()).default([])
}).refine((data) => {
    if ((data.propertyType === 'Apartment' || data.propertyType === 'Villa') && !data.bhk) {
        return false
    }
    return true
}, {
    message: "Bhk is required for Appartment and Villa property types"
}).refine((data) => {
    if ((data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin)) {
        return false
    }
    return true
}, {
    message: "Budget max must be greater than or equal to budget min",
    path: ["budgetMax"],
})

export type BuyerInput = z.infer<typeof buyerSchema>

// Csv  import schema

export const buyerCSVScchema = z.object({
    fullName: z.string().min(2).max(80),
    email: z.string().optional(),
    phone: z.string(),
    city: z.string(),
    propertyType: z.string(),
    bhk: z.string().optional(),
    purpose: z.string(),
    budgetMin: z.string().optional(),
    budgetMax: z.string().optional(),
    timeline: z.string(),
    source: z.string(),
    status: z.string().optional(),
    notes: z.string().optional(),
    tags: z.string().optional(),
})
