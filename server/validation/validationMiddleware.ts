import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils/responseFormatter.js';

/**
 * Processes validation results and formats error responses
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    for (let validation of validations) {
      const result = await validation.run(req);
      // If validation fails, break early
      if (!result.isEmpty()) break;
    }

    // Format validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Convert errors to grouped format 
    const formattedErrors: Record<string, string[]> = {};
    errors.array().forEach(error => {
      const path = error.type === 'field' ? error.path : error.msg;
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(error.msg);
    });

    // Return standardized validation error response
    return res.status(422).json(validationErrorResponse(formattedErrors));
  };
}