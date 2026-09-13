import { test as base, Page } from "@playwright/test";

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/");
    
    // Auto-login se na tela de login
    const isLoginScreen = await page.getByTestId("input-username").isVisible().catch(() => false);
    if (isLoginScreen) {
      const uniqueUser = `user_${Date.now()}`;
      await page.getByTestId("tab-register").click();
      await page.getByTestId("input-display-name").fill("Estudante Teste");
      await page.getByTestId("input-username").fill(uniqueUser);
      await page.getByTestId("input-pin").fill("1234");
      await page.getByTestId("btn-submit-auth").click();
      await page.waitForTimeout(1000);
    }
    
    await use(page);
  },
});

export { expect } from "@playwright/test";
