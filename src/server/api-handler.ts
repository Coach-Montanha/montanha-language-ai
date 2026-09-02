import {
  registerUser,
  loginUser,
  resetUserPin,
  saveUserDataOnServer,
  getUserDataFromServer,
} from "./user-store";

export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const jsonHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: jsonHeaders });
  }

  try {
    // 1. REGISTRO DE USUÁRIO
    if (path === "/api/auth/register" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { username, pin, displayName } = body;
      const result = registerUser(username, pin, displayName);

      if (!result.success) {
        return new Response(JSON.stringify({ success: false, error: result.error }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      return new Response(JSON.stringify({ success: true, user: result.user }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 2. LOGIN DE USUÁRIO
    if (path === "/api/auth/login" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { username, pin } = body;
      const result = loginUser(username, pin);

      if (!result.success) {
        return new Response(JSON.stringify({ success: false, error: result.error }), {
          status: 401,
          headers: jsonHeaders,
        });
      }

      return new Response(JSON.stringify({ success: true, user: result.user }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 3. RESET DE SENHA (PIN DE 4 NÚMEROS)
    if (path === "/api/auth/reset-pin" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { username, newPin } = body;
      const result = resetUserPin(username, newPin);

      if (!result.success) {
        return new Response(JSON.stringify({ success: false, error: result.error }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Senha redefinida com sucesso! Você já pode entrar com o novo PIN.",
        }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // 4. SALVAR DADOS DO USUÁRIO NO ARQUIVO DO SERVIDOR
    if (path === "/api/user/save" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { username, progress, chatHistory, customCards } = body;

      const result = saveUserDataOnServer(username, { progress, chatHistory, customCards });
      if (!result.success) {
        return new Response(JSON.stringify({ success: false, error: result.error }), {
          status: 400,
          headers: jsonHeaders,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    // 5. CARREGAR DADOS DO USUÁRIO DO ARQUIVO DO SERVIDOR
    if (path === "/api/user/data" && method === "GET") {
      const username = url.searchParams.get("username") || "";
      const result = getUserDataFromServer(username);

      if (!result.success) {
        return new Response(JSON.stringify({ success: false, error: result.error }), {
          status: 404,
          headers: jsonHeaders,
        });
      }

      return new Response(JSON.stringify({ success: true, user: result.user }), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint não encontrado" }), {
      status: 404,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("Erro na API de autenticação/usuários:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro interno no servidor." }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
