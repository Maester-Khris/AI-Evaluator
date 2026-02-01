import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
	readonly statusCode: number;
	readonly errors?: string[]| undefined;

	constructor(message: string, statusCode = 500, errors?: string[]) {
		super(message);
		this.statusCode = statusCode;
		this.errors = errors;
	}
}

// Express error handler middleware
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
	const isAppError = err instanceof AppError;
	const status = isAppError ? err.statusCode : 500;
	const payload: any = { message: isAppError ? err.message : 'Internal Server Error' };
	if (isAppError && err.errors) payload.errors = err.errors;
	// Optional: include stack in dev environments
	if (!isAppError && process.env.NODE_ENV !== 'production') payload.stack = err?.stack;
	res.status(status).json(payload);
}
