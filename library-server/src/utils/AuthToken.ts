import { createHmac, timingSafeEqual } from 'crypto';
import { config } from '../config';

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 12;

interface AuthTokenPayload {
    userId: string;
    expiresAt: number;
}

function encode(value: string): string {
    return Buffer.from(value).toString('base64url');
}

function sign(payload: string): string {
    return createHmac('sha256', config.server.authSecret).update(payload).digest('base64url');
}

export function createAuthToken(userId: string): string {
    const payload = encode(JSON.stringify({
        userId,
        expiresAt: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS
    } satisfies AuthTokenPayload));
    return `${payload}.${sign(payload)}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | undefined {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra !== undefined) return undefined;

    const expectedSignature = sign(payload);
    const received = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return undefined;

    try {
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthTokenPayload;
        if (typeof decoded.userId !== 'string' || typeof decoded.expiresAt !== 'number' ||
            decoded.expiresAt <= Math.floor(Date.now() / 1000)) {
            return undefined;
        }
        return decoded;
    } catch {
        return undefined;
    }
}
