const { Inventario } = require("../models");
const { Op } = require("sequelize");
const { ERROR_STATUS } = require("../config/constants.js")

const checkExistingSerials = async (req, res, next) => {
    const serialNumbers = req.body.map(item => item.serialNumber);
  
    try {
      const existingItems = await Inventario.findAll({
        where: {
          serialNumber: {
            [Op.and]: [
              { [Op.in]: serialNumbers },
              { [Op.not]: "S/N" },
            ],
          },
        },
        attributes: ["serialNumber"],
      });
  
      if (existingItems.length > 0) {
        return res.status(409).json({
          status: ERROR_STATUS.EXISTING_SERIALS,
          message: "Los siguientes seriales ya existen en la base de datos",
          data: existingItems.map((item) => item.serialNumber), // Extract serial numbers
        });
      } else {
        next();
      }
    } catch (error) {
      console.error("Ocurrio un error al chequear los seriales:", error);
      res.status(500).json({ status: ERROR_STATUS.SERVER_ERROR, message: "Internal server error" });
    }
};
  
const checkPartNumbersStock = async (req, res, next) => {
  const partNumbers = req.body.partNumbers || []

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
          status: ERROR_STATUS.NO_PN_STOCK,
          message: "No hay suficiente stock o no se encuentra alguno de los part number",
          data: partNumber,
        });
    }
  }

  next();
}

const checkSerialNumberExistence = async (req, res, next) => {

  const seriales = req.body.seriales || [];

  // Fetch records by serial numbers
  const serialRecords = await Inventario.findAll({
    where: {
      serialNumber: {
        [Op.in]: seriales,
      },
    },
  });
  
  // Extract serial numbers from fetched records
  const fetchedSerialNumbers = new Set(serialRecords.map((record) => record.serialNumber));

  // Find serial numbers that were not found in the database
  const notFoundSerialNumbers = seriales.filter((serialNumber) => !fetchedSerialNumbers.has(serialNumber));

  if (notFoundSerialNumbers.length > 0) {
    return res.status(404).send({
      status: ERROR_STATUS.SERIAL_NOT_FOUND,
      message: "No se encuentran los siguientes seriales",
      data: notFoundSerialNumbers,
    });
  } else {
    next ();
  }
}

const validateIds = async (req, res, next) => {
    const existingItems = await Inventario.findAll({
      where: {
        id: {[Op.in]: req.body.ids}
      },
      attributes: ["id"]
    })
    const existingIds = existingItems.map((item) => item.id);
    const missingIds = req.body.ids.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      return res.status(400).json({
        status: ERROR_STATUS.ID_NOT_FOUND,
        message: "No se encuentran los siguientes Ids",
        data: missingIds,
      });
    } else {
      next ();
    }
}

const validateNotAlreadySold = async (req, res, next) => {

  const items = await Inventario.findAll({
    where: {
      id: {[Op.in]: req.body.ids}
    }
  })

  const idsAlreadySold = items.filter((item) => item.fechaSalida != null).map(item => item.id)
  
  if (idsAlreadySold.length > 0) {
    return res.status(400).json({
      status: ERROR_STATUS.ALREADY_SOLD,
      message: "Los siguientes IDs ya cuentan con fecha de salida",
      information: idsAlreadySold
    })
  } else {
    next();
  }
}

const validateFields = async (req, res, next) => {
  const requestFields = Object.keys(req.body)
  const modelAttributes = Inventario.rawAttributes;
  const itemFields = new Set(Object.keys(modelAttributes));

  const wrongFields = requestFields.filter((field) => !itemFields.has(field))

  if (wrongFields.length > 0) {
    return res.status(400).json({status: ERROR_STATUS.FIELD_ERROR, message: "Los siguientes campos no existen", data: wrongFields})
  }

  next();
}

const validateId = async (req, res, next) => {
  const fetch = await Inventario.findByPk(req.params.id)

  if (!fetch) {
    return res.status(400).json({status: ERROR_STATUS.ID_NOT_FOUND, message: "No se encuentra el ID solicitado", data: req.params.id})
  } else {
    next();
  }
}

module.exports = {checkExistingSerials, checkPartNumbersStock, checkSerialNumberExistence, validateIds, validateNotAlreadySold, validateFields, validateId};