import { Request, Response, NextFunction } from 'express';

export function login(req: Request, res: Response): Promise<Response>;
export function authenticate(req: Request, res: Response, next: NextFunction): void | Response;
export function getProfile(req: Request, res: Response): Promise<Response>;