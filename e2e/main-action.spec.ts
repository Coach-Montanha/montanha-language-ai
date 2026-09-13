import { test, expect } from "./fixtures/auth.fixture";

test.describe("Smart Language - Ação Principal (Treino & Exercícios de Idioma)", () => {
  test("Fluxo Feliz: Deve navegar entre as abas de aprendizado", async ({ authenticatedPage }) => {
    // Aba Conversa
    await authenticatedPage.getByTestId("tab-conversa").click();
    await expect(authenticatedPage.getByText(/Smart Language/i).first()).toBeVisible();

    // Aba Cartões (Flashcards)
    await authenticatedPage.getByTestId("tab-cartoes").click();
    await expect(authenticatedPage.getByTestId("tab-cartoes")).toBeVisible();

    // Aba Situações
    await authenticatedPage.getByTestId("tab-cenario").click();
    await expect(authenticatedPage.getByTestId("tab-cenario")).toBeVisible();

    // Aba Destrinchar
    await authenticatedPage.getByTestId("tab-destrinchar").click();
    await expect(authenticatedPage.getByTestId("tab-destrinchar")).toBeVisible();
  });
});
