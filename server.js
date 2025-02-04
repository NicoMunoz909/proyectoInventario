require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const { checkExistingSerials, validateIds, validateNotAlreadySold, validateFields, validateId } = require("./validations/inventario");
const { validateToken } = require("./validations/auth")
const { consulta, entrada, salida, actualizar, eliminar } = require("./controllers/inventario");
const { register, login } = require("./controllers/auth");
const { reporte } = require("./controllers/reportes");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://id-automation-inventario.vercel.app"], // Allow frontend origin
    credentials: true, // Allow sending cookies
  })
);

//Use Routes
app.get("/inventario", validateToken, validateFields, consulta);
app.post("/inventario", validateToken, checkExistingSerials, entrada);
app.put("/inventario", validateToken,validateIds, validateNotAlreadySold, salida);
app.patch("/inventario/:id", validateToken, validateId, validateFields, actualizar)
app.delete("/inventario/:id", validateToken, validateId, eliminar)
app.get("/reporte", validateToken, reporte);
// app.post("/auth/register", register);
app.post("/auth/login", login);

const port = process.env.PORT || 4001;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
