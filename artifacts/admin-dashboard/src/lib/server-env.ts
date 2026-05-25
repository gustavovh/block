export function getBackendApiUrl(): string {
  const backendUrl = process.env.BACKEND_API_URL;

  if (backendUrl) {
    return backendUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3001";
  }

  throw new Error("BACKEND_API_URL is required in production");
}