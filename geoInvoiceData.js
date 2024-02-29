const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const verifyToken = require("./verifyToken");

const pool = require("./config");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("", (req, res) => {
  pool.query(`select * from invoicedata`, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching data" });
      console.log("err");
    } else {
      res.status(200).json(results);
      console.log("cool");
    }
  });
});

router.put("/:id", upload.none(), async (req, res) => {
  console.log("hhh");

  try {
    const { val } = req.body;
    const { id } = req.params;

    const updateQuery = `update invoicedata set tax_conversion = ?, tax_number = ? where invoice_number = '${id.toString()}'`;

    pool.query(updateQuery, [1, val], (err, success) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching employee data" });
      } else {
        return res.status(200).send({ message: "updated Successfully" });
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Error fetching employee data" });
  }
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const getInvoiceByIdQuery = `
  SELECT *
  FROM invoicedata
  INNER JOIN customer ON invoicedata.customer_id = customer.id
  WHERE invoicedata.order_number = '${id}';
`;

  pool.query(getInvoiceByIdQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching employee data" });
    } else {
      if (result.length > 0) {
        return res.status(200).json(result[0]);
      } else {
        return res.status(404).json({ error: "Employee not found" });
      }
    }
  });
});

router.get("/proforma/:id", (req, res) => {
  const { id } = req.params;
  const getInvoiceByIdQuery = `
  SELECT *
  FROM invoicedata
  INNER JOIN customer ON invoicedata.customer_id = customer.id
  WHERE invoicedata.invoice_number = '${id}';
`;

  pool.query(getInvoiceByIdQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching employee data" });
    } else {
      if (result.length > 0) {
        return res.status(200).json(result[0]);
      } else {
        return res.status(404).json({ error: "Employee not found" });
      }
    }
  });
});

router.get("/tax/:id", (req, res) => {
  const { id } = req.params;
  const getInvoiceByIdQuery = `
    SELECT *
    FROM invoicedata
    INNER JOIN customer ON invoicedata.customer_id = customer.id
    WHERE invoicedata.invoice_number = '${id}';
  `;

  pool.query(getInvoiceByIdQuery, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching employee data" });
    } else {
      if (result.length > 0) {
        return res.status(200).json(result[0]);
      } else {
        return res.status(404).json({ error: "Employee not found" });
      }
    }
  });
});

function saveOrUpdateCustomer(req, res, id) {
  const customerData = {
    customerId: req.body.customer_id,
    subject: req.body.subject,
    project: req.body.project,
    ref: req.body.ref,
    invoiceNumber: req.body.invoiceNumber,
    orderNumber: req.body.orderNumber,
    orderDate: req.body.orderDate,
    matTest: req.body.matTest,
    discount: req.body.discount,
    transfee: req.body.transfee,
  };

  let sqlQuery;
  let queryValues;

  //   if (id === undefined) {
  sqlQuery = `
      INSERT INTO geoInvoice (
        customer_id,
        subject,
        project,
        ref,
        invoice_number,
        order_number,
        order_date,
        mat_test,
        discount,
        transport_fee
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  queryValues = [
    customerData.customerId,
    customerData.subject,
    customerData.project,
    customerData.ref,
    customerData.invoiceNumber,
    customerData.orderNumber,
    customerData.orderDate,
    customerData.matTest,
    customerData.discount,
    customerData.transfee,
  ];
  //   } else {
  //     sqlQuery = `
  //       UPDATE invoiceData
  //       SET
  //       subject = ?,
  //       project = ?,
  //       ref = ?,
  //       invoice_number = ?,
  //       order_number = ?,
  //       order_date = ?,
  //       mat_test = ?,
  //       discount = ?,
  //       transport_fee = ?
  //       WHERE customer_id = ?`;
  //     queryValues = [
  //       customerData.subject,
  //       customerData.project,
  //       customerData.ref,
  //       customerData.invoiceNumber,
  //       customerData.orderNumber,
  //       customerData.orderDate,
  //       customerData.matTest,
  //       customerData.discount,
  //       customerData.transfee,
  //       id,
  //     ];
  //   }

  pool.query(sqlQuery, queryValues, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error_msg: "Internal server error" });
    } else {
      if (id) {
        res.status(200).json({ message: "Customer data updated successfully" });
      } else {
        res.status(200).json({ message: "Customer data saved successfully" });
      }
    }
  });
}

router.post("/add", upload.none(), (req, res) => {
  saveOrUpdateCustomer(req, res);
});

router.put("/update/:id", upload.none(), (req, res) => {
  const id = req.params.id;
  saveOrUpdateCustomer(req, res, id);
});

router.delete("/delete/:customer_id", (req, res) => {
  const customer_id = req.params.customer_id;
  const deleteCustomerQuery = "DELETE FROM Customer WHERE customer_id = ?";

  pool.query(deleteCustomerQuery, [customer_id], (err, result) => {
    if (err) {
      res.status(500).json({ error_msg: "Internal server error" });
    } else {
      if (result.affectedRows > 0) {
        res
          .status(200)
          .json({ message: "Customer record deleted successfully" });
      } else {
        res.status(404).json({ error_msg: "Customer not found" });
      }
    }
  });
});

module.exports = router;
