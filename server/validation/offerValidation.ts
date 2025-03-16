import { body, param } from 'express-validator';

/**
 * Validation rules for creating a new offer
 */
export const createOfferValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number')
    .custom((value) => {
      return value >= 0;
    }).withMessage('Price must be a positive number'),
  
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['active', 'sold', 'archived']).withMessage('Status must be active, sold, or archived'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isString().withMessage('Category must be a string'),
  
  body('images')
    .isArray().withMessage('Images must be an array')
    .optional(),
  
  body('notes')
    .isString().withMessage('Notes must be a string')
    .optional(),
  
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt().withMessage('User ID must be an integer')
];

/**
 * Validation rules for updating an existing offer
 */
export const updateOfferValidation = [
  param('id')
    .isInt().withMessage('ID must be an integer'),
  
  body('title')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters')
    .optional(),
  
  body('description')
    .isString().withMessage('Description must be a string')
    .optional(),
  
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .custom((value) => {
      return value >= 0;
    }).withMessage('Price must be a positive number')
    .optional(),
  
  body('status')
    .isIn(['active', 'sold', 'archived']).withMessage('Status must be active, sold, or archived')
    .optional(),
  
  body('category')
    .isString().withMessage('Category must be a string')
    .optional(),
  
  body('images')
    .isArray().withMessage('Images must be an array')
    .optional(),
  
  body('notes')
    .isString().withMessage('Notes must be a string')
    .optional()
];