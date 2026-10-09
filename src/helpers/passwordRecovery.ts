// An OTP must not be put in a Web URL, browser history or persistent storage.
let recovery: {email: string; otp: string} | null = null;
export const passwordRecovery = {
  set(value: {email: string; otp: string}) { recovery = {...value}; },
  get() { return recovery ? {...recovery} : null; },
  clear() { recovery = null; },
};
