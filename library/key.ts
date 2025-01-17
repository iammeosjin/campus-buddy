export default await crypto.subtle.importKey(
  'jwk',
  {
    'kty': 'oct',
    'k':
      'XmW3OjUdtb3e717Qk7mHWSYojEzD-ET_UcxyeZP3wNcVkYsGNLWukSUommSGtOSrvy3osTBvfZQ2r_PR0uT7rQ',
    'alg': 'HS256',
    'key_ops': ['sign', 'verify'],
    'ext': true,
  },
  { name: 'HMAC', hash: 'SHA-256' },
  true,
  ['sign', 'verify'],
);
