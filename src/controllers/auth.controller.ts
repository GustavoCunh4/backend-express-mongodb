import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { logger, maskEmail } from '../utils/logger';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser(name, email, password);
    logger.info(`Usuario registrado: ${maskEmail(email)}`);
    return res.status(201).json({ message: 'Usuario criado', user: result });
  } catch (err: any) {
    logger.warn(`Falha no registro: ${err.message}`);
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    logger.info(`Login bem-sucedido: ${maskEmail(email)}`);
    return res.status(200).json({ message: 'Autenticado', ...result });
  } catch (err: any) {
    logger.warn(`Falha no login: ${err.message}`);
    next(err);
  }
}


