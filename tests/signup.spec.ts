import { test } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.HSP_EMAIL || !process.env.HSP_PASSWORD) {
  throw "Missing login credentials";
}

test("Book Hurling und Camogie course", async ({ context, page }) => {
  await page.goto(
    "https://www.hochschulsport.uni-hamburg.de/sportcampus/vona-z.html"
  );

  // Switch sport depending on SELECTED_SPORT from workflow trigger
  switch (process.env.SELECTED_SPORT) {
    case "football":
      await page.click('a:has-text("Gaelic Football")');
      break;
    case "hurling":
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
        response.url().includes("anmeldung.fcgi") && response.status() === 200
    ),
    newPage.click('input[type="submit"][value="buchen"]'),
  ]);
  await newPage.waitForLoadState("networkidle");

  // Trigger log in UI
  // Note: had to hook into their js function "toggle_pwa" to trigger this form
  await newPage.waitForSelector("#bs_pw_anmlink", { state: "attached" });
  await newPage.evaluate(() => {
    // @ts-ignore
    if (typeof toggle_pwa === "function") {
      // @ts-ignore
      toggle_pwa();
    } else {
      console.error("toggle_pwa function not found");
    }
  });

  // Log in
  await newPage.waitForSelector("#bs_pw_anm", { state: "visible" });
  await newPage.fill('input[name="pw_email"]', process.env.HSP_EMAIL || "");
  await newPage.fill('input[type="password"]', process.env.HSP_PASSWORD || "");
  await newPage.click('input[type="submit"][value="weiter zur Buchung"]');

  // Select Terms & Conditions checkbox and continue
  await newPage.check('input[name="tnbed"]');
  await newPage.click("#bs_submit");

  // Confirm booking
  await newPage.click('input[type="submit"][value="verbindlich buchen"]');
});
