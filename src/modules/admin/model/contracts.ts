import { z } from 'zod';
export const idSchema = z.number().int().positive();
export const riasecSchema = z.enum(['R','I','A','S','E','C']);
export const resultSchema = z.object({ topCode:z.string(),scoreR:z.number(),scoreI:z.number(),scoreA:z.number(),scoreS:z.number(),scoreE:z.number(),scoreC:z.number() });
export const identitySchema=z.object({id:idSchema,fullname:z.string(),role:z.literal('ADMIN')});
export const overviewSchema=z.object({counts:z.object({students:z.number().int().nonnegative(),completedTests:z.number().int().nonnegative(),chatSessions:z.number().int().nonnegative(),questions:z.number().int().nonnegative()}),recentAttempts:z.array(z.object({id:idSchema,finishAt:z.string(),user:z.object({id:idSchema,fullname:z.string()}),result:resultSchema}))});
