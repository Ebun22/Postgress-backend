import crypto from 'crypto';

export const generateToken = () => {
    const buffer = crypto.randomBytes(2);
    const randomValue = buffer.readUInt16BE(0);
    return 1000 + (randomValue % 9000)
}