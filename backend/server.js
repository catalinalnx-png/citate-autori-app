const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");

const app = express();
app.use(cors());
app.use(express.json());

const JSON_SERVER_URL = "http://localhost:3000/quotes";

// 1. Definitie Middleware Validare ID
const validateId = (req, res, next) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    next();
};

// 2. Schema Joi
const quoteSchema = Joi.object({
    author: Joi.string().min(2).required(),
    quote: Joi.string().min(5).required(),
});

// Deserveste imagini static
app.use("/images", express.static(path.join(__dirname, "images")));

// Rute
app.get("/", (req, res) => {
    res.send("Printing Quotes API is running...");
});

// GET all quotes
// GET /api/quotes?search=termen
// Dacă parametrul 'search' există în query string, filtrăm rezultatele.
// Căutarea este case-insensitive și caută atât în author cât și în quote.
app.get("/api/quotes", async (req, res) => {
  try {
    const response = await fetch(JSON_SERVER_URL);
    const data = await response.json();

    const { search } = req.query; // req.query conține parametrii din URL
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();

      // Filtrăm array-ul - includem citatul dacă termenul apare
      // în numele autorului SAU în textul citatului
      const filtered = data.filter(q =>
        q.author.toLowerCase().includes(term) ||
        q.quote.toLowerCase().includes(term)
      );

      return res.status(200).json(filtered);
    }

    // Fără parametru search -> returnăm toate citatele
    res.status(200).json(data);
  } catch (error) {
    console.error("Eroare la preluarea citatelor:", error.message);
    res.status(500).json({ error: "Nu s-au putut prelua citatele." });
  }
});

// POST new quote
app.post("/api/quotes", async (req, res) => {
    const { error } = quoteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const response = await fetch(JSON_SERVER_URL);
        const quotes = await response.json();
        const newId = quotes.length > 0 ? Math.max(...quotes.map(q => Number(q.id))) + 1 : 1;

        const newQuote = { id: newId.toString(), ...req.body };
        const postResponse = await fetch(JSON_SERVER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newQuote),
        });
        const data = await postResponse.json();
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to add quote" });
    }
});

// PUT update quote
app.put("/api/quotes/:id", validateId, async (req, res) => {
    const { error } = quoteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const quoteId = req.params.id;
        const updatedQuote = { id: quoteId, ...req.body };
        const response = await fetch(`${JSON_SERVER_URL}/${quoteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedQuote),
        });

        if (!response.ok) return res.status(404).json({ error: "Quote not found" });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to update quote" });
    }
});

// DELETE quote
app.delete("/api/quotes/:id", validateId, async (req, res) => {
    try {
        const quoteId = req.params.id;
        const check = await fetch(`${JSON_SERVER_URL}/${quoteId}`);
        if (!check.ok) return res.status(404).json({ error: "Quote not found" });

        await fetch(`${JSON_SERVER_URL}/${quoteId}`, { method: "DELETE" });
        res.json({ message: "Quote deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete quote" });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});