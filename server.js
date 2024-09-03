require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const controller = require("./controllers");

const { entradaInventario, salidaInventario, consultaInventario } = controller;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

//Use Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.get("/inventario", consultaInventario);
app.post("/entradas", entradaInventario);
app.post("/salidas", salidaInventario);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
