export function isValidHandle(handle: string): boolean {
  if (!handle || typeof handle !== "string") return false;
  if (handle.trim().length === 0) return false;
  const validHandleRegex = /^[a-zA-Z0-9.-]+$/;
  return validHandleRegex.test(handle);
}
