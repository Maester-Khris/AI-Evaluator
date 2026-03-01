import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "./errors.js";

export const isNonEmptyString = (v: any) =>
	typeof v === "string" && v.trim().length > 0;
export const isValidRating = (v: any) =>
	typeof v === "number" && v >= 1 && v <= 5;

// Validator type: return true if valid, or a string error message
type Validator = (v: any) => boolean | string;

/**
 * validate(source, schema)
 * source: 'body' | 'params' | 'query'
 * schema: { fieldName: Validator }
 *
 * Produces Express middleware which will call next() if valid,
 * or next(AppError(400, errors[])) if invalid.
 */
export function validate(
	source: "body" | "params" | "query",
	schema: Record<string, Validator>,
): RequestHandler {
	return (req: Request, _res: Response, next: NextFunction) => {
		const errors: string[] = [];
		const target: any =
			source === "body"
				? req.body
				: source === "params"
					? req.params
					: req.query;

		for (const [key, validator] of Object.entries(schema)) {
			const val = (target as any)[key];
			const result = validator(val);
			if (result === false) errors.push(`${key} is invalid`);
			else if (typeof result === "string") errors.push(result);
			// true/undefined means valid
		}

		if (errors.length > 0)
			return next(new AppError("Validation failed", 400, errors));
		return next();
	};
}
