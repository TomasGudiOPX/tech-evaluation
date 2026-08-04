export function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, maxChars)}\n…(truncated)`;
}

export function loadDotEnvIfPresent(): void {
  const load = (process as { loadEnvFile?: () => void }).loadEnvFile;
  if (load) {
    try {
      load.call(process);
    } catch {
      // No .env file in the working directory; rely on the process environment.
    }
  }
}
