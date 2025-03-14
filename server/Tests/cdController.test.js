const { getAllCDs, addCD, deleteCD } = require("../Controllers/cdController");
const pool = require("../configs/db");

jest.mock("../configs/db", () => ({
  query: jest.fn()
}));

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("cdController tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCDs", () => {
    it("devrait retourner tous les CD", async () => {
      const req = {}; 
      const res = createResponse();
      const fakeData = { rows: [{ id: 1, title: "Test", artist: "TestArtist", year: 2020 }] };
      pool.query.mockResolvedValue(fakeData);
      await getAllCDs(req, res);
      expect(pool.query).toHaveBeenCalledWith("SELECT * FROM cds ORDER BY id ASC");
      expect(res.json).toHaveBeenCalledWith(fakeData.rows);
    });

    it("devrait gérer l'erreur", async () => {
      const req = {};
      const res = createResponse();
      const errorMessage = "DB error";
      pool.query.mockRejectedValue(new Error(errorMessage));
      await getAllCDs(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe("addCD", () => {
    it("devrait ajouter un CD et retourner le nouveau CD", async () => {
      const req = { body: { title: "Nouveau Album", artist: "Nouvel Artiste", year: 2021 }};
      const res = createResponse();
      const fakeResult = { rows: [{ id: 2, title: "Nouveau Album", artist: "Nouvel Artiste", year: 2021 }] };
      pool.query.mockResolvedValue(fakeResult);
      await addCD(req, res);
      expect(pool.query).toHaveBeenCalledWith(
        "INSERT INTO cds (title, artist, year) VALUES ($1, $2, $3) RETURNING *",
        [req.body.title, req.body.artist, req.body.year]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeResult.rows[0]);
    });

    it("devrait gérer l'erreur lors de l'ajout d'un CD", async () => {
      const req = { body: { title: "Nouveau Album", artist: "Nouvel Artist", year: 2021 }};
      const res = createResponse();
      const errorMessage = "Insertion error";
      pool.query.mockRejectedValue(new Error(errorMessage));
      await addCD(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe("deleteCD", () => {
    it("devrait supprimer un CD", async () => {
      const req = { params: { id: 1 } };
      const res = createResponse();
      pool.query.mockResolvedValue({});
      await deleteCD(req, res);
      expect(pool.query).toHaveBeenCalledWith("DELETE FROM cds WHERE id = $1", [1]);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("devrait gérer l'erreur lors de la suppression d'un CD", async () => {
      const req = { params: { id: 1 } };
      const res = createResponse();
      const errorMessage = "Deletion error";
      pool.query.mockRejectedValue(new Error(errorMessage));
      await deleteCD(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
