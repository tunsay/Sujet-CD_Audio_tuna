const puppeteer = require("puppeteer");

describe("Test E2E - Home", () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(15000);
    page.setDefaultTimeout(15000);
  });

  afterAll(async () => {
    await browser.close();
  });

  // Test 1: Afficher le titre de la page d'accueil
  it("devrait afficher le titre de la page d'accueil", async () => {
    await page.goto("http://localhost:5173");
    
    try {
      await page.waitForSelector("h1", { timeout: 5000 });
      const title = await page.$eval("h1", el => el.textContent);
      expect(title).toMatch(/Gestion des CD/);
      console.log("Succès: Titre de la page correctement affiché");
    } catch (e) {
      console.log("Échec: Titre de la page non trouvé");
      throw e;
    }
  }, 10000);

  // Test 2: Ajouter un CD
  it("devrait ajouter un CD", async () => {
    await page.goto("http://localhost:5173", { waitUntil: 'networkidle2' });
    
    try {
      // Saisir le titre
      await page.waitForSelector("#cd-title", { timeout: 5000 });
      await page.type("#cd-title", "Nouveau CD");
      
      // Saisir l'artiste
      try {
        await page.waitForSelector("#cd-artist", { timeout: 2000 });
        await page.type("#cd-artist", "Artiste Test");
      } catch (e) {
        console.log("Champ artiste non trouvé, test continue");
      }
      
      // Saisir l'année
      try {
        await page.waitForSelector("#cd-year", { timeout: 2000 });
        await page.type("#cd-year", "2025");
      } catch (e) {
        console.log("Champ année non trouvé, test continue");
      }
      
      // Cliquer sur le bouton ajouter
      await page.click("#add-cd");
      
      // Vérifier l'ajout
      await page.waitForFunction(
        () => {
          const items = document.querySelectorAll(".cd-item");
          return Array.from(items).some(item => item.textContent.includes("Nouveau CD"));
        },
        { timeout: 5000 }
      );
      
      const cdExists = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".cd-item"))
          .some(item => item.textContent.includes("Nouveau CD"));
      });
      
      expect(cdExists).toBe(true);
      console.log("Succès: CD ajouté correctement");
    } catch (e) {
      console.log("Échec: Impossible d'ajouter le CD");
      await page.screenshot({ path: 'debug-add-cd-failure.png' });
      throw e;
    }
  }, 15000);

  // Test 3: Afficher les CDs
  it("devrait afficher les CDs", async () => {
    try {
      const cdsVisible = await page.evaluate(() => {
        const items = document.querySelectorAll(".cd-item");
        return items.length > 0;
      });
      
      expect(cdsVisible).toBe(true);
      console.log("Succès: CDs affichés correctement");
    } catch (e) {
      console.log("Échec: Impossible d'afficher les CDs");
      throw e;
    }
  }, 10000);

  // Test 4: Supprimer un CD
  it("devrait supprimer un CD", async () => {
    try {
      // Cliquer sur le bouton de suppression
      await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll(".cd-item"));
        const target = items.find(item => item.textContent.includes("Nouveau CD"));
        if (target) {
          const deleteButton = target.querySelector(".delete-cd");
          if (deleteButton) {
            deleteButton.click();
          } else {
            throw new Error("Bouton de suppression non trouvé");
          }
        } else {
          throw new Error("CD 'Nouveau CD' non trouvé");
        }
      });
      
      // Vérifier que le CD a été supprimé
      await page.waitForFunction(
        () => {
          const items = document.querySelectorAll(".cd-item");
          return !Array.from(items).some(item => item.textContent.includes("Nouveau CD"));
        },
        { timeout: 5000 }
      );
      
      const cdStillExists = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".cd-item"))
          .some(item => item.textContent.includes("Nouveau CD"));
      });
      
      expect(cdStillExists).toBe(false);
      console.log("Succès: CD supprimé correctement");
    } catch (e) {
      console.log("Échec: Impossible de supprimer le CD");
      await page.screenshot({ path: 'debug-delete-cd-failure.png' });
      throw e;
    }
  }, 15000);
});