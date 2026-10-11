import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';
import { Prisma } from '@prisma/client';

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
  }
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'The request is invalid.', details: error.flatten() } }, { status: 422 });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return NextResponse.json({ error: { code: 'CONFLICT', message: 'A record with those values already exists.' } }, { status: 409 });
  }
  console.error('Unhandled API error', error);
  return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } }, { status: 500 });
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try { body = await request.json(); } catch { throw new ApiError(400, 'INVALID_JSON', 'The request body must be valid JSON.'); }
  return schema.parse(body);
}

export function created<T>(data: T) { return NextResponse.json({ data }, { status: 201 }); }
export function ok<T>(data: T) { return NextResponse.json({ data }); }
