import { Request, Response, NextFunction } from 'express';

interface CsrfOptions {
  cookieName?: string;
  headerName?: string;
  ignorePaths?: string[];
}

export default function csrfProtection(options?: CsrfOptions): 
  (req: Request, res: Response, next: NextFunction) => void;