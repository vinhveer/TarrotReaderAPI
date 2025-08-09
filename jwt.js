/**
 * JWT HS256 Implementation using Web Crypto API
 * Pure JavaScript implementation without external libraries
 */

/**
 * Base64 URL encoding (RFC 4648)
 * @param {Uint8Array} bytes - bytes to encode
 * @returns {string} base64url encoded string
 */
function base64urlEncode(bytes) {
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Base64 URL decoding
 * @param {string} str - base64url encoded string
 * @returns {Uint8Array} decoded bytes
 */
function base64urlDecode(str) {
    // Add padding if needed
    str += '='.repeat((4 - str.length % 4) % 4);
    // Replace URL-safe characters
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    return new Uint8Array([...binaryString].map(char => char.charCodeAt(0)));
}

/**
 * Convert string to Uint8Array
 * @param {string} str - input string
 * @returns {Uint8Array} encoded bytes
 */
function stringToBytes(str) {
    return new TextEncoder().encode(str);
}

/**
 * Convert Uint8Array to string
 * @param {Uint8Array} bytes - input bytes
 * @returns {string} decoded string
 */
function bytesToString(bytes) {
    return new TextDecoder().decode(bytes);
}

/**
 * Create HMAC-SHA256 signature
 * @param {string} data - data to sign
 * @param {string} secret - secret key
 * @returns {Promise<Uint8Array>} signature bytes
 */
async function hmacSha256(data, secret) {
    const key = await crypto.subtle.importKey(
        'raw',
        stringToBytes(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        stringToBytes(data)
    );
    
    return new Uint8Array(signature);
}

/**
 * Verify HMAC-SHA256 signature
 * @param {string} data - original data
 * @param {Uint8Array} signature - signature to verify
 * @param {string} secret - secret key
 * @returns {Promise<boolean>} verification result
 */
async function verifyHmacSha256(data, signature, secret) {
    const key = await crypto.subtle.importKey(
        'raw',
        stringToBytes(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );
    
    return await crypto.subtle.verify(
        'HMAC',
        key,
        signature,
        stringToBytes(data)
    );
}

/**
 * Create JWT token with HS256 algorithm
 * @param {Object} payload - JWT payload
 * @param {string} secret - secret key for signing
 * @returns {Promise<string>} JWT token
 */
async function createJWT(payload, secret) {
    // Create header
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    // Encode header and payload
    const encodedHeader = base64urlEncode(stringToBytes(JSON.stringify(header)));
    const encodedPayload = base64urlEncode(stringToBytes(JSON.stringify(payload)));
    
    // Create signature data
    const signatureData = `${encodedHeader}.${encodedPayload}`;
    
    // Generate signature
    const signature = await hmacSha256(signatureData, secret);
    const encodedSignature = base64urlEncode(signature);
    
    // Return complete JWT
    return `${signatureData}.${encodedSignature}`;
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - secret key for verification
 * @returns {Promise<Object>} decoded payload
 * @throws {Error} if token is invalid
 */
async function verifyJWT(token, secret) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
    }
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Decode header and payload
    let header, payload;
    try {
        header = JSON.parse(bytesToString(base64urlDecode(encodedHeader)));
        payload = JSON.parse(bytesToString(base64urlDecode(encodedPayload)));
    } catch (e) {
        throw new Error('Invalid JWT encoding');
    }
    
    // Check algorithm
    if (header.alg !== 'HS256') {
        throw new Error('Unsupported algorithm');
    }
    
    // Verify signature
    const signatureData = `${encodedHeader}.${encodedPayload}`;
    const signature = base64urlDecode(encodedSignature);
    
    const isValid = await verifyHmacSha256(signatureData, signature, secret);
    if (!isValid) {
        throw new Error('Invalid JWT signature');
    }
    
    return payload;
}
