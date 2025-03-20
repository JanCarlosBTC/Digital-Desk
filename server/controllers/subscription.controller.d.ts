import { Request, Response } from 'express';

export function createCheckoutSession(req: Request, res: Response): Promise<void>;
export function handleWebhook(req: Request, res: Response): Promise<void>; 