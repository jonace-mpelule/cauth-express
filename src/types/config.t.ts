import type ms from 'ms';
import z from 'zod';
import type { DbProvider } from './database.contract.t.ts';

// RUN TIME CHECK FOR DATABASE PROVIDER
const DbProviderSchema = z.custom<DbProvider>((_) => true, {
	message: 'Invalid DbProvider: must implement DbProvider interface',
});

const MS = z.custom<ms.StringValue>();

export const ConfigSchema = z.object({
	DbProvider: DbProviderSchema,
	RefreshTokenSecret: z.string(),
	AccessTokenSecret: z.string(),
	Roles: z.string().array().min(1),
	JwtConfig: z
		.object({
			AccessTokenLifeSpan: MS.optional(),
			RefreshTokenLifeSpan: MS.optional(),
		})
		.optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
