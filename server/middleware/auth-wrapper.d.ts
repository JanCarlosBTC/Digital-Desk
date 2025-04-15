import { Request, Response, NextFunction } from 'express';

declare type RouteHandler = (req: Request, res: Response, next: NextFunction) => void;

export function withAuth(handler: RouteHandler): RouteHandler;
export function withAuthAndUser(handler: RouteHandler): RouteHandler;
export function withDevAuth(userId?: number): RouteHandler;