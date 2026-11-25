import assert from 'node:assert/strict';
import {
  createSignedUserToken,
  hashOtpCode,
  hashPassword,
  verifyPassword,
  verifySignedUserToken,
} from '../src/lib/server/user-session.ts';
import { generateSixDigitOtp } from '../src/lib/server/gmail-otp.ts';

console.log('Running Test Matrix for User Auth, Password Hash, Signed Token, & Gmail OTP...');

const hashed = hashPassword('pasarku123');
assert.equal(verifyPassword('pasarku123', hashed), true);
assert.equal(verifyPassword('wrongpass', hashed), false);
console.log('✓ TC-USR-01 passed: scrypt password hash & constant-time verification');

const token = createSignedUserToken('usr_test_01', 'warga.test@gmail.com');
const decoded = verifySignedUserToken(token);
assert.ok(decoded);
assert.equal(decoded.userId, 'usr_test_01');
assert.equal(decoded.email, 'warga.test@gmail.com');
assert.equal(verifySignedUserToken(`${token}tampered`), null);
console.log('✓ TC-USR-02 passed: HMAC-SHA256 signed user token verification & tamper rejection');

const otp = generateSixDigitOtp();
assert.match(otp, /^\d{6}$/);
const otpHash1 = hashOtpCode('Warga.Test@gmail.com', otp);
const otpHash2 = hashOtpCode('warga.test@gmail.com', otp);
assert.equal(otpHash1, otpHash2);
assert.notEqual(otpHash1, hashOtpCode('warga.test@gmail.com', '000000'));
console.log('✓ TC-USR-03 passed: 6-digit Gmail OTP generator & case-insensitive HMAC hash');

console.log('All User Auth tests passed 100%!');
