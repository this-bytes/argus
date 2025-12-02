// Encoding/Decoding utilities

// Base64 encode
export function base64Encode(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return null;
  }
}

// Base64 decode
export function base64Decode(str) {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return null;
  }
}

// URL encode
export function urlEncode(str) {
  try {
    return encodeURIComponent(str);
  } catch {
    return null;
  }
}

// URL decode
export function urlDecode(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return null;
  }
}

// Hex encode
export function hexEncode(str) {
  try {
    return Array.from(str)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return null;
  }
}

// Hex decode
export function hexDecode(str) {
  try {
    const hex = str.replace(/\s/g, '');
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
      result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return result;
  } catch {
    return null;
  }
}

// ROT13 encode/decode (symmetric)
export function rot13(str) {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// Detect encoding type
export function detectEncoding(str) {
  const trimmed = str.trim();
  
  // Check if it looks like base64
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length % 4 === 0) {
    return 'base64';
  }
  
  // Check if it looks like hex
  if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0) {
    return 'hex';
  }
  
  // Check if it looks like URL encoded
  if (/%[0-9A-Fa-f]{2}/.test(trimmed)) {
    return 'url';
  }
  
  return 'text';
}
