export function isValidIATA(code) {
  return /^[A-Z]{3}$/.test(code);
}
