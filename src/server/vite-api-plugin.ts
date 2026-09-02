import type { Plugin, ViteDevServer, PreviewServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleApiRequest } from "./api-handler";

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    // Se o corpo já foi pré-processado por outro middleware
    const anyReq = req as unknown as { body?: unknown };
    if (anyReq.body) {
      if (typeof anyReq.body === "string") return resolve(anyReq.body);
      try {
        return resolve(JSON.stringify(anyReq.body));
      } catch {
        // continua
      }
    }

    if (req.readableEnded) {
      return resolve("");
    }

    let body = "";
    req.on("data", (chunk: Buffer | string) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      resolve(body);
    });

    req.on("error", () => {
      resolve("");
    });

    // Timeout de segurança para evitar qualquer travamento
    setTimeout(() => {
      resolve(body);
    }, 1500);
  });
}

function createApiMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url || !req.url.startsWith("/api/")) {
      return next();
    }

    try {
      const protocol = (req.headers["x-forwarded-proto"] as string) || "http";
      const host = req.headers.host || "localhost:3000";
      const fullUrl = `${protocol}://${host}${req.url}`;

      let bodyString: string | undefined;
      if (req.method !== "GET" && req.method !== "HEAD") {
        bodyString = await readRequestBody(req);
      }

      const requestInit: RequestInit = {
        method: req.method || "GET",
        headers: req.headers as HeadersInit,
      };

      if (bodyString) {
        requestInit.body = bodyString;
      }

      const webRequest = new Request(fullUrl, requestInit);
      const webResponse = await handleApiRequest(webRequest);

      res.statusCode = webResponse.status;
      webResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const responseText = await webResponse.text();
      res.end(responseText);
    } catch (err) {
      console.error("Erro no middleware de API do Vite:", err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Erro interno no servidor de API" }));
    }
  };
}

export function viteApiMiddlewarePlugin(): Plugin {
  const middleware = createApiMiddleware();

  return {
    name: "smart-language-api-middleware",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(middleware);
    },
  };
}
