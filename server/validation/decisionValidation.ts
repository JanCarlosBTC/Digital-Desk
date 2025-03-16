import { body, param } from 'express-validator';

/**
 * Validation rules for creating a new decision
 */
export const createDecisionValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string'),
  
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'completed', 'cancelled']).withMessage('Status must be pending, completed, or cancelled'),
  
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO date'),
  
  body('tags')
    .isArray().withMessage('Tags must be an array')
    .optional(),
  
  body('notes')
    .isString().withMessage('Notes must be a string')
    .optional(),
  
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt().withMessage('User ID must be an integer')
];

/**
 * Validation rules for updating an existing decision
 */
export const updateDecisionValidation = [
  param('id')
    .isInt().withMessage('ID must be an integer'),
  
  body('title')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters')
    .optional(),
  
  body('description')
    .isString().withMessage('Description must be a string')
    .optional(),
  
  body('status')
    .isIn(['pending', 'completed', 'cancelled']).withMessage('Status must be pending, completed, or cancelled')
    .optional(),
  
  body('date')
    .isISO8601().withMessage('Date must be a valid ISO date')
    .optional(),
  
  body('tags')
    .isArray().withMessage('Tags must be an array')
    .optional(),
  
  body('notes')
    .isString().withMessage('Notes must be a string')
    .optional()
];