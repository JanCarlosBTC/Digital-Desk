import { Request, Response, NextFunction } from 'express';

export function setCsrfToken(req: Request, res: Response, next: NextFunction): void;
export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void;
export function csrfProtection(): [
  (req: Request, res: Response, next: NextFunction) => void,
  (req: Request, res: Response, next: NextFunction) => void
];