import { NextRequest } from "next/server";
import { getBackendApiUrl } from "@/lib/server-env";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

async function proxyRequest(req: NextRequest, path: string[]) {
  const backendUrl = getBackendApiUrl();
  const urlPath = path.join("/");
  const searchParams = req.nextUrl.search;
  
  const targetUrl = `${backendUrl}/api/admin/${urlPath}${searchParams}`;
  
  // Keep a strict allowlist; forwarding all client headers can break undici (for example: Expect).
  const headers = new Headers();
  const authorization = req.headers.get("authorization");
  const contentType = req.headers.get("content-type");
  const cookie = req.headers.get("cookie");

  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);

  try {
    let body: any = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        body = JSON.stringify(await req.json());
      } else {
        body = await req.text();
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseData = await response.text();
    let json;
    try {
      json = JSON.parse(responseData);
    } catch (e) {
      json = { success: false, error: "Invalid JSON from backend", raw: responseData };
    }

    return Response.json(json, { status: response.status });
  } catch (error: any) {
    console.error(`Proxy error for ${targetUrl}:`, error);
    
    if (error.name === "AbortError") {
      return Response.json(
        { success: false, error: "Backend request timed out" },
        { status: 504 }
      );
    }

    return Response.json(
      { success: false, error: error.message || "Backend communication failed" },
      { status: 502 }
    );
  }
}
