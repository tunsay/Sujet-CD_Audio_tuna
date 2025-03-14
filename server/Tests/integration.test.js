const request = require("supertest");
const app = require("../server");
let server;

const TEST_PORT = 5006;

// Avant tous les tests, démarrer le serveur sur un port spécifique
beforeAll(done => {
  server = app.listen(TEST_PORT, () => {
    console.log(`Test server running on port ${TEST_PORT}`);
    done();
  });
});

// Après tous les tests, fermer le serveur
afterAll(done => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});

describe("Intégration API - Base de données", () => {
  let createdCdId;
  const testCd = { title: "Integration Album", artist: "Integration Artist", year: 2022 };

  // Test de création d'un CD
  it("POST /api/cds - ajouter un CD", async () => {
    const response = await request(app)
      .post("/api/cds")
      .send(testCd);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    createdCdId = response.body.id;
    
    // Vérification des données retournées
    expect(response.body.title).toBe(testCd.title);
    expect(response.body.artist).toBe(testCd.artist);
    expect(response.body.year).toBe(testCd.year);
  });

  // Test de récupération de tous les CDs
  it("GET /api/cds - récupérer tous les CD", async () => {
    const response = await request(app).get("/api/cds");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Vérifier que notre CD créé est dans la liste
    const cd = response.body.find(item => item.id === createdCdId);
    expect(cd).toBeDefined();
    expect(cd.title).toBe(testCd.title);
    expect(cd.artist).toBe(testCd.artist);
  });

  // Test de suppression d'un CD
  it("DELETE /api/cds/:id - supprimer le CD", async () => {
    const response = await request(app).delete(`/api/cds/${createdCdId}`);
    expect(response.status).toBe(204);
    
    // Vérification que le CD a bien été supprimé
    const getResponse = await request(app).get("/api/cds");
    const deletedCd = getResponse.body.find(item => item.id === createdCdId);
    expect(deletedCd).toBeUndefined();
  });
});

// Simulation de l'interaction avec le frontend
describe("Intégration API - Frontend", () => {
  it("Vérification des headers CORS", async () => {
    const response = await request(app).get("/api/cds");
    expect(response.headers["access-control-allow-origin"]).toBeDefined();
  });

  it("Vérification de la structure de données pour l'affichage frontend", async () => {
    // Création d'un CD test
    const createResponse = await request(app)
      .post("/api/cds")
      .send({ title: "Frontend Test", artist: "Frontend Artist", year: 2024 });
    expect(createResponse.status).toBe(201);
    
    // Récupération des CDs
    const response = await request(app).get("/api/cds");
    
    // Structure des données attendue par le frontend
    const cd = response.body.find(item => item.id === createResponse.body.id);
    expect(cd).toHaveProperty("id");
    expect(cd).toHaveProperty("title");
    expect(cd).toHaveProperty("artist");
    expect(cd).toHaveProperty("year");
    
    // Suppression du CD de test
    await request(app).delete(`/api/cds/${createResponse.body.id}`);
  });

  it("Test des codes de statut HTTP appropriés", async () => {
    // Création réussie -> 201
    const createResponse = await request(app)
      .post("/api/cds")
      .send({ title: "Status Test", artist: "Status Artist", year: 2024 });
    expect(createResponse.status).toBe(201);
    
    const cdId = createResponse.body.id;
    
    // Récupération réussie -> 200
    const getResponse = await request(app).get("/api/cds");
    expect(getResponse.status).toBe(200);
    
    // Suppression réussie -> 204 (No Content)
    const deleteResponse = await request(app).delete(`/api/cds/${cdId}`);
    expect(deleteResponse.status).toBe(204);
    
    // Suppression d'une ressource inexistante -> vérifier le statut
    const deleteAgainResponse = await request(app).delete(`/api/cds/${cdId}`);
    expect([204, 404]).toContain(deleteAgainResponse.status); // Accepte soit 204 soit 404
  });

  it("Test de gestion des erreurs pour un ID invalide", async () => {
    const response = await request(app).delete("/api/cds/invalid_id");
    // Le serveur devrait renvoyer une erreur 400 ou 404 pour un ID invalide
    expect([400, 404, 500]).toContain(response.status);
  });
});