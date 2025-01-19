const { Inventario } = require("../models");
const { Op } = require("sequelize");
const { ERROR_STATUS } = require("../config/constants.js")

const consulta = async (req, res) => {
  const filters = req.query;
  const soloStock = req.query.soloStock === "true";
  const soloBackups = req.query.isBackup ==="true";
  const soloDemos = req.query.isDemo ==="true";

  try {
    const queryOptions = {
      where: {},
    };

    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== "soloStock" && key !== "isBackup" && key !== "isDemo") {
          queryOptions.where[key] = { [Op.like]: `%${value}%` };
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

    // Format items dates
    const formattedItems = items.map((item) => ({
        ...item.toJSON(),
        fechaEntrada: item.fechaEntrada ? item.fechaEntrada.toLocaleDateString() : null,
        fechaSalida: item.fechaSalida ? item.fechaSalida.toLocaleDateString() : null,
      }));
      
    res.json({
      status: ERROR_STATUS.OK,
      message: "Se encontraron las siguiente coincidencias",
      data: formattedItems});
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ status: ERROR_STATUS.SERVER_ERROR, message: "Internal server error" });
  }
};

const entrada = async (req, res) => {
  const fechaEntrada = new Date().toISOString();
  const entrada = req.body.map((item) => {
    return { ...item, fechaEntrada };
  });
  try {
    const items = await Inventario.bulkCreate(entrada);
    res.status(201).json({
      status: ERROR_STATUS.OK,
      message: "Entrada creada con éxito.",
      data: items.map((item) => ({
        partNumber: item.partNumber,
        descripcion: item.descripcion,
        serialNumber: item.serialNumber,
        })),
      });
  } catch (error) {
    console.error("Error creating entry:", error);
    res.status(500).json({ status: ERROR_STATUS.SERVER_ERROR, message: "Internal server error" });
  }
};

const salida = async (req, res) => {
  const fechaSalida = new Date().toISOString();
  const destino = req.body.destino;
  const facturaVenta = req.body.facturaVenta;

  try {
    const salida = await Inventario.update(
      { destino, facturaVenta, fechaSalida },
      {
        where: {
          id: {
            [Op.in]: req.body.ids,
          },
        },
      }
    );
    res.send({ status: ERROR_STATUS.OK, message: "Salida Registrada", data: req.body.ids });
  } catch (error) {
    console.error("Error updating exit:", error);
    res.status(500).json({ status: ERROR_STATUS.SERVER_ERROR, message: "Internal server error" });
  }
};

const actualizar = async (req, res) => {
  try {
    const actualizacion = await Inventario.update({...req.body}, {
      where: { id: req.params.id }
    })
    if (actualizacion == 0) {
      return res.status(400).json({status: ERROR_STATUS.FIELD_ERROR, message: "Hay un error en la información", data: null})
    }
    res.status(201).json({status: ERROR_STATUS.OK, message: "Actualizado con exito", data: actualizacion})
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({status: ERROR_STATUS.SERVER_ERROR, message: "Internal server error", data: error});
  }
}

const eliminar = async (req, res) => {
  try {
    const eliminacion = await Inventario.destroy({
      where: {
        id: req.params.id
      }
    })

    if (eliminacion) {
      return res.status(200).json({status: ERROR_STATUS.OK, message: "Articulo eliminado con éxito", data: eliminacion })
    } else {
      return res.status(400).json({status: ERROR_STATUS.FIELD_ERROR, message: "Hay un error en la información", data: null})
    }
  } 
   catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({status: ERROR_STATUS.SERVER_ERROR, message: "Internal server error", data: error});
  }
}

module.exports = {consulta, entrada, salida, actualizar, eliminar}