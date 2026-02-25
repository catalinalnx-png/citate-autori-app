const express =require("express");
const cors =require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Deserveste imaginile static
app.use("/images", express.static(path.join(__dirname, "images")));

// Ruta de test
app.get("/", (req, res) => {
  res.json({
    message: "Printing Quotes API is running...",
    endpoints: {
      quotes: "/api/quotes",
      health: "/api/health"
    }
  });
});

let quotes = [
  { id: 1, author: "Socrates", quote: "The only true wisdom is in knowing you know nothing." },
  { id: 2, author: "Albert Einstein", quote: "Life is like riding a bicycle. To keep your balance you must keep moving." }
];

app.get('/api/quotes', (req, res) => {
  res.status(200).json(quotes);
});

app.post('/api/quotes', (req, res) => {
  const { author, quote } = req.body;
  const newQuote = {
    id: quotes.length + 1, // Generăm un ID unic
    author,
    quote
  };

  quotes.push(newQuote);
  res.status(201).json(newQuote);
});

// PUT /api/quotes/:id - Actualizează citatul cu ID-ul specificat în URL
app.put('/api/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { author, quote } = req.body;

  const index = quotes.findIndex(q => q.id === id);

  if (index === -1) {
    // Dacă nu-l găsește, trimite eroare 404
    return res.status(404).json({ message: "Citatul nu a fost găsit!" });
  }

  // Actualizăm elementul direct din memorie
  quotes[index] = { id, author, quote };
  res.status(200).json(quotes[index]);
});

// DELETE /api/quotes/:id - Șterge citatul cu ID-ul specificat din array
app.delete('/api/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = quotes.findIndex(q => q.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Citatul nu a fost găsit!" });
  }

  quotes.splice(index, 1);
  res.status(200).json({ message: "Citatul a fost șters cu succes!" });
});

// Pornim serverul pe portul 5000
const PORT = process.env.port || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Serving static images from: ${path.join(__dirname, "images")}`);
});

