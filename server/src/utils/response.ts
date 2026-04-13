import type { Response } from 'express';
import type { PaginationMeta } from '../types/common.js';
import { HTTP_STATUS } from '../constants/http-status.js';

export function sendSuccess<T>(res: Response, data: T, statusCode: number = HTTP_STATUS.OK): void {
  res.status(statusCode).json({ success: true, data });
}

export function sendCreated<T>(res: Response, data: T): void {
  res.status(HTTP_STATUS.CREATED).json({ success: true, data });
}

export function sendPaginated<T>(res: Response, data: T[], pagination: PaginationMeta): void {
  res.status(HTTP_STATUS.OK).json({ success: true, data, pagination });
}

export function sendDeleted(res: Response, message: string): void {
  res.status(HTTP_STATUS.OK).json({ success: true, message });
}
