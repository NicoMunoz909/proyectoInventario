const { Inventario } = require("../models");
const { Op } = require("sequelize");

const consultaInventario = async (req, res) => {
  const filters = req.query;
  const soloStock = req.query.soloStock === "true";

  try {
    const queryOptions = {
      where: {},
    };

    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== "soloStock") {
        if (key === "serialNumber") {
          // Apply partial matching (wildcard search) for serialNumber
          queryOptions.where[key] = { [Op.like]: `%${value}%` };
        } else {
          // Apply exact matching for other fields
          queryOptions.where[key] = value;
        }
      }
    }

    if (soloStock) {
      queryOptions.where.fechaSalida = { [Op.is]: null };
    }

    // Fetch all records from the table
    const items = await Inventario.findAll(queryOptions);
    const formattedItems = items.map((item) => ({
      ...item.toJSON(),
      fechaEntrada: item.fechaEntrada ? item.fechaEntrada.toLocaleDateString() : null,
      fechaSalida: item.fechaSalida ? item.fechaSalida.toLocaleDateString() : null,
    }));
    res.json(formattedItems);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const entradaInventario = async (req, res) => {
  const fechaEntrada = new Date().toISOString();
  const entrada = req.body.map((item) => {
    return { ...item, fechaEntrada };
  });
  try {
    const items = await Inventario.bulkCreate(entrada);
    res.send("Entrada creada");
  } catch (error) {
    res.status(400).send(error);
  }
};

const salidaInventario = async (req, res) => {
  const fechaSalida = new Date().toISOString();
  const destino = req.body.destino;
  const facturaVenta = req.body.facturaVenta;
  const seriales = req.body.series;

  try {
    const records = await Inventario.findAll({
      where: {
        serialNumber: {
          [Op.in]: seriales,
        },
      },
    });

    // Extract serial numbers from fetched records
    const fetchedSerialNumbers = new Set(records.map((record) => record.serialNumber));

    // Find serial numbers that were not found in the database
    const notFoundSerialNumbers = seriales.filter((serialNumber) => !fetchedSerialNumbers.has(serialNumber));

    if (notFoundSerialNumbers.length > 0) {
      return res.status(404).send({
        error: "No se encuentran los siguientes seriales",
        notFoundSerialNumbers,
      });
    }

    const salida = await Inventario.update(
      { destino, facturaVenta, fechaSalida },
      {
        where: {
          serialNumber: {
            [Op.in]: seriales,
          },
        },
      }
    );
    res.send({ ok: true, msg: "Salida Registrada" });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

module.exports = { entradaInventario, salidaInventario, consultaInventario };
