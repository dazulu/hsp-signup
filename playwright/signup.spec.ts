import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.HSP_EMAIL || !process.env.HSP_PASSWORD) {
  throw "Missing login credentials";
}

test("Book Hurling und Camogie course", async ({ context, page }) => {
  await page.goto(
    "https://www.hochschulsport.uni-hamburg.de/sportcampus/vona-z.html",
  );

  // Switch sport depending on SELECTED_SPORT from workflow trigger
  switch (process.env.SELECTED_SPORT) {
    case "football":
      await page.click('a:has-text("Gaelic Football")');
      break;
    default:
      await page.click('a:has-text("Hurling und Camogie")');
      break;
  }

  // Click "Vormerkliste" and wait for new tab to load
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    page.click('input[type="submit"][value="Vormerkliste"]'),
  ]);
  await newPage.waitForLoadState("networkidle");

  // Click "buchen" and wait for registration page
  await Promise.all([
    newPage.waitForResponse(
      (response) =>
        response.url().includes("anmeldung.fcgi") && response.status() === 200,
    ),
    newPage.click('input[type="submit"][value="buchen"]'),
  ]);
  await newPage.waitForLoadState("networkidle");

  // Trigger log in UI
  // Note: had to hook into their js function "toggle_pwa" to trigger this form
  await newPage.waitForSelector("#bs_pw_anmlink", { state: "attached" });
  await newPage.evaluate(() => {
    // @ts-expect-error
    if (typeof toggle_pwa === "function") {
      // @ts-expect-error
      toggle_pwa();
    } else {
      console.error("toggle_pwa function not found");
    }
  });

  // Log in — use evaluate to avoid credentials appearing in report step titles
  await newPage.waitForSelector("#bs_pw_anm", { state: "visible" });
  await newPage.evaluate(
    ({ email, password }) => {
      const emailInput = document.querySelector(
        'input[name="pw_email"]',
      ) as HTMLInputElement;
      const passwordInput = document.querySelector(
        'input[type="password"]',
      ) as HTMLInputElement;
      for (const [input, value] of [
        [emailInput, email],
        [passwordInput, password],
      ] as const) {
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    {
      email: process.env.HSP_EMAIL || "",
      password: process.env.HSP_PASSWORD || "",
    },
  );

  await newPage.click('input[type="submit"][value="weiter zur Buchung"]');
  await newPage.waitForLoadState("networkidle");

  // If the login prompt text is still visible, credentials were rejected
  const loginPromptVisible = await newPage
    .locator("text=Ich habe ein Passwort und möchte mich damit anmelden.")
    .isVisible();

  if (loginPromptVisible) {
    mkdirSync("test-results", { recursive: true });
    writeFileSync("test-results/auth-failed", "");
    expect(false, "Login credentials were rejected by HSP").toBeTruthy();
  }

  // If this text is visible, the user's HSP membership is not active for this semester
  const noMembershipVisible = await newPage
    .locator("text=vorher eines folgender Angebote gebucht haben")
    .isVisible();

  if (noMembershipVisible) {
    mkdirSync("test-results", { recursive: true });
    writeFileSync("test-results/no-membership", "");
    expect(
      false,
      "HSP membership is not active for this semester",
    ).toBeTruthy();
  }

  // Select Terms & Conditions checkbox and continue
  await newPage.check('input[name="tnbed"]');
  await newPage.click("#bs_submit");

  // Click book button
  await newPage.click('input[type="submit"][value="verbindlich buchen"]');

  // Wait for page to update after booking
  await newPage.waitForLoadState("networkidle");

  // If this text is visible, the user is already signed up for this session
  // (this page appears after the final booking step, not after login)
  const alreadyBookedVisible = await newPage
    .locator("text=Sie sind für dieses Angebot bereits seit")
    .isVisible();

  if (alreadyBookedVisible) {
    mkdirSync("test-results", { recursive: true });
    writeFileSync("test-results/already-booked", "");
    expect(false, "User is already signed up for this session").toBeTruthy();
  }

  // Capture booking result
  await newPage.screenshot({
    path: "test-results/booking-result.png",
    fullPage: true,
  });

  // Verify successful booking
  await expect(
    newPage.locator("text=You have made a confirmed registration for offer"),
  ).toBeVisible();
});
