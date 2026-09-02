import type { Plugin } from "vite";
import { handleApiRequest } from "./api-handler";

export function viteApiMiddlewarePlugin(): Plugin {
  return {
    name: "smart-language-api-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) {
          return next();
        }

        try {
          const protocol = req.headers["x-forwarded-proto"] || "http";
          const host = req.headers.host || "localhost:3000";
          const fullUrl = `${protocol}://${host}${req.url}`;

          let bodyString: string | undefined;
          if (req.method !== "GET" && req.method !== "HEAD") {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
            bodyString = Buffer.concat(chunks).toString("utf-8");
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
          res.end(JSON.stringify({ error: "Erro interno no servidor de desenvolvimento" }));
        }
      });
    },
  };
}
