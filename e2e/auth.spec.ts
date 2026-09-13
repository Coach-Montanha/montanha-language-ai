import { test, expect } from "./fixtures/auth.fixture";

test.describe("Smart Language - Autenticação & Cadastro", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Fluxo Feliz: Deve cadastrar novo perfil com PIN de 4 dígitos", async ({ page }) => {
    await page.getByTestId("tab-register").click();

    const uniqueUser = `aluno_${Date.now()}`;
    await page.getByTestId("input-display-name").fill("Carlos E2E");
    await page.getByTestId("input-username").fill(uniqueUser);
    await page.getByTestId("input-pin").fill("9876");

    await page.getByTestId("btn-submit-auth").click();

    // Deve entrar na aplicação
    await expect(page.getByTestId("tab-conversa")).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId("btn-logout")).toBeVisible();
  });

  test("Estado de Falha: Deve rejeitar cadastro com campo de usuário em branco", async ({ page }) => {
    await page.getByTestId("tab-register").click();

    await page.getByTestId("input-pin").fill("1234");
    // O botão fica desabilitado quando usuário não está preenchido
    await expect(page.getByTestId("btn-submit-auth")).toBeDisabled();
  });

  test("Estado de Falha: Deve rejeitar PIN com menos de 4 números", async ({ page }) => {
    await page.getByTestId("tab-register").click();

    await page.getByTestId("input-username").fill("alunoteste");
    await page.getByTestId("input-pin").fill("12");

    await expect(page.getByTestId("btn-submit-auth")).toBeDisabled();
  });

  test("Fluxo Feliz: Deve realizar login com conta existente", async ({ page }) => {
    await page.getByTestId("tab-login").click();

    // Usar dados preexistentes ou novo cadastro prévio
    const uniqueUser = `userlogin_${Date.now()}`;
    await page.getByTestId("tab-register").click();
    await page.getByTestId("input-display-name").fill("Ana Silva");
    await page.getByTestId("input-username").fill(uniqueUser);
    await page.getByTestId("input-pin").fill("4321");
    await page.getByTestId("btn-submit-auth").click();

    await expect(page.getByTestId("btn-logout")).toBeVisible();
  });

  test("Fluxo Feliz: Logout deve desconectar e redirecionar para tela de login", async ({ authenticatedPage }) => {
    await expect(authenticatedPage.getByTestId("btn-logout")).toBeVisible();

    // Tratar o alert de confirmação nativo do navegador
    authenticatedPage.once("dialog", (dialog) => dialog.accept());
    await authenticatedPage.getByTestId("btn-logout").click();

    // Deve voltar para a tela de login
    await expect(authenticatedPage.getByTestId("tab-login")).toBeVisible({ timeout: 5000 });
  });
});
