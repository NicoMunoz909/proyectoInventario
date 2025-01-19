const { Inventario } = require("../models");
const { Op } = require("sequelize");


const reporte = async (req, res) => {
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


module.exports = { reporte }