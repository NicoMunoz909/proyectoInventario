const { Inventario } = require("../models");
const { Op } = require("sequelize");

const consultaInventario = async (req, res) => {
  const filters = req.query;
  const soloStock = req.query.soloStock === "true";
  const soloBackups = req.query.isBackup ==="true";
  const soloDemos = req.query.isDemo ==="true";

  try {
    const queryOptions = {
      where: {},
    };

    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== "soloStock") {
        if (key !== "isBackup" && key !== "isDemo") {
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
    if (soloBackups) {
      queryOptions.where.isBackup = { [Op.is]: true};
    }
    if (soloDemos) {
      queryOptions.where.isDemo = { [Op.is]: true};
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
    const serialNumbers = entrada.map((item) => item.serialNumber);
    const existingItems = await Inventario.findAll({
      where: {
        serialNumber: serialNumbers,
      },
      attributes: ["serialNumber"],
    });

    // Create a Set of existing serial numbers for quick lookup
    const existingSerialNumbers = new Set(
      existingItems
        .map((item) => item.serialNumber)
        .filter((serialNumber) => serialNumber !== "S/N") // Exclude "S/N"
    );
    const duplicates = entrada.filter(
      (item) => item.serialNumber !== "S/N" && existingSerialNumbers.has(item.serialNumber)
    );
    if (duplicates.length > 0) {
      return res.status(409).json({
        message: "Los siguientes seriales ya existen en la base de datos",
        duplicates: duplicates.map((item) => item.serialNumber),
      });
    }
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
  const seriales = req.body.series || [];
  const partNumbers = req.body.partNumbers || [];

  try {
    // Fetch records by serial numbers
    const serialRecords = await Inventario.findAll({
      where: {
        serialNumber: {
          [Op.in]: seriales,
        },
      },
    });

    // Fetch records by part numbers
    const partNumberRecords = []
    const retrievedIds = []

    for (let index = 0; index < partNumbers.length; index++) {
      const partNumber = partNumbers[index];

      const fetchedPartNumber = await Inventario.findOne({
        where: {
          [Op.and]: [
            { partNumber },
            { id: { [Op.notIn]: retrievedIds } },
          ],
        },
      })
      if (fetchedPartNumber) {
        retrievedIds.push(fetchedPartNumber.get("id"));
        partNumberRecords.push(fetchedPartNumber);
      } else {
          return res.status(404).send({
            error: "No hay suficiente stock o no se encuentra alguno de los part number",
            information: partNumber,
          });
      }
    }
    
    // Extract serial numbers from fetched records
    const fetchedSerialNumbers = new Set(serialRecords.map((record) => record.serialNumber));

    // Find serial numbers that were not found in the database
    const notFoundSerialNumbers = seriales.filter((serialNumber) => !fetchedSerialNumbers.has(serialNumber));

    if (notFoundSerialNumbers.length > 0) {
      return res.status(404).send({
        error: "No se encuentran los siguientes seriales",
        information: notFoundSerialNumbers,
      });
    }

    // Combine serial and part number records for updating
    const allRecords = [...serialRecords, ...partNumberRecords];

    // Extract IDs to update
    const allIdsToUpdate = allRecords.map((record) => record.id);


    const salida = await Inventario.update(
      { destino, facturaVenta, fechaSalida },
      {
        where: {
          id: {
            [Op.in]: allIdsToUpdate,
          },
        },
      }
    );
    res.send({ ok: true, msg: "Salida Registrada", ids: allIdsToUpdate });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

const reporteInventario = async (req, res) => {
  try {

    const groupField = req.query.q;
    const reportType = req.query.reportType;

    let whereCondition = {};

    if (reportType === 'venta') {
      // Items for sale: both isBackup and isDemo should be false
      whereCondition = { isBackup: false, isDemo: false };
    } else if (reportType === 'backups') {
      // Items for backup: isBackup should be true, isDemo should be false
      whereCondition = { isBackup: true, isDemo: false };
    } else if (reportType === 'demos') {
      // Items for demos: isDemo should be true, isBackup should be false
      whereCondition = { isBackup: false, isDemo: true };
    } else {
      return res.status(400).json({ error: 'Invalid report type. Valid options are "venta", "backups", or "demos".' });
    }

    const reporte = await Inventario.count({
      group: [req.query.q],
      where: whereCondition,
    });
    res.json(reporte);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

module.exports = { entradaInventario, salidaInventario, consultaInventario, reporteInventario };
