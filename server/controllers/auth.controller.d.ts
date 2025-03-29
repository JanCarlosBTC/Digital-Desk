import { Request, Response } from 'express';

export function register(req: Request, res: Response): Promise<void>;
export function login(req: Request, res: Response): Promise<void>;
export function getProfile(req: Request, res: Response): Promise<void>;
export function updateProfile(req: Request, res: Response): Promise<void>; 