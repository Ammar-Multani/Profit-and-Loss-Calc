// Simple UUID generator that doesn't rely on crypto.getRandomValues()
export function generateUUID(): string {
  // This is a simple implementation that doesn't rely on crypto.getRandomValues()
  // It's not cryptographically secure but sufficient for most use cases
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);

  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

// Alternative implementation that uses a timestamp-based approach
export function generateTimestampUUID(): string {
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${randomPart}`;
}
