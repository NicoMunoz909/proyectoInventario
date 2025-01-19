require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { checkExistingSerials, validateIds, validateNotAlreadySold, validateFields, validateId } = require("./validations/inventario");
const { consulta, entrada, salida, actualizar, eliminar } = require("./controllers/inventario");
const { reporte } = require("./controllers/reportes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

//Use Routes
app.get("/inventario", validateFields, consulta);
app.post("/inventario", checkExistingSerials, entrada);
app.put("/inventario",validateIds, validateNotAlreadySold, salida);
app.patch("/inventario/:id", validateId, validateFields, actualizar)
app.delete("/inventario/:id", validateId, eliminar)
app.get("/reporte", reporte);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
