import { Router } from "express";
import pool from "../config/database.js";
import { paymentProofUpload } from "../middleware/payment-upload.middleware.js";

const router = Router();
const phonePattern = /^[6-9]\d{9}$/;
const pinPattern = /^\d{6}$/;

router.post(
  "/orders",
  paymentProofUpload.single("paymentProof"),
  async (request, response, next) => {
    let { customer, address, paymentMethod, transactionId, items } =
        request.body || {};
    try {
      if (typeof customer === "string") customer = JSON.parse(customer);
      if (typeof address === "string") address = JSON.parse(address);
    } catch {
      return response
        .status(400)
        .json({ message: "Checkout details are invalid." });
    }

    if (
      !customer?.fullName ||
      !phonePattern.test(customer.phone) ||
      !customer.email
    ) {
      return response
        .status(400)
        .json({
          message: "Enter a valid name, Indian mobile number, and email.",
        });
    }
    if (
      !address?.houseFlat ||
      !address.street ||
      !address.area ||
      !address.city ||
      !address.state ||
      !pinPattern.test(address.pinCode)
    ) {
      return response
        .status(400)
        .json({
          message: "Enter a complete shipping address with a valid PIN code.",
        });
    }
    let parsedItems = items;
    try {
      if (typeof items === "string") parsedItems = JSON.parse(items);
    } catch {
      parsedItems = [];
    }
    if (
      !["cod", "qr"].includes(paymentMethod) ||
      (paymentMethod === "qr" && (!transactionId || !request.file)) ||
      !Array.isArray(parsedItems) ||
      !parsedItems.length
    ) {
      return response
        .status(400)
        .json({
          message: "A non-empty cart and valid payment method are required.",
        });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const productRows = [];
      for (const item of parsedItems) {
        const [rows] = await connection.query(
          "SELECT id, name, price, stock_quantity FROM products WHERE id = ? AND status = 'active' FOR UPDATE",
          [item.productId],
        );
        if (
          !rows.length ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          rows[0].stock_quantity < item.quantity
        ) {
          await connection.rollback();
          return response
            .status(409)
            .json({
              message: `Product ${item.productId} is unavailable in the requested quantity.`,
            });
        }
        productRows.push({ ...rows[0], quantity: item.quantity });
      }

      const subtotal = productRows.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0,
      );
      const orderNumber = `LHC-${Date.now().toString().slice(-8)}`;
      const paymentStatus =
        paymentMethod === "cod" ? "cod_pending" : "pending_verification";
      const [customerResult] = await connection.query(
        "INSERT INTO customers (full_name, phone, email) VALUES (?, ?, ?)",
        [customer.fullName, customer.phone, customer.email],
      );
      const [orderResult] = await connection.query(
        `INSERT INTO orders (order_number, customer_id, subtotal, total_amount, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          customerResult.insertId,
          subtotal,
          subtotal,
          paymentMethod,
          paymentStatus,
        ],
      );
      await connection.query(
        `INSERT INTO addresses (order_id, house_flat, street, area, landmark, city, state, pin_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          address.houseFlat,
          address.street,
          address.area,
          address.landmark || null,
          address.city,
          address.state,
          address.pinCode,
        ],
      );

      for (const item of productRows) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderResult.insertId,
            item.id,
            item.name,
            item.quantity,
            item.price,
            Number(item.price) * item.quantity,
          ],
        );
        await connection.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [item.quantity, item.id],
        );
      }
      await connection.query(
        "INSERT INTO payments (order_id, payment_method, amount, transaction_id, payment_proof, status) VALUES (?, ?, ?, ?, ?, ?)",
        [
          orderResult.insertId,
          paymentMethod,
          subtotal,
          transactionId || null,
          request.file
            ? `/uploads/payment-proofs/${request.file.filename}`
            : null,
          "pending",
        ],
      );
      await connection.query(
        "INSERT INTO order_status_history (order_id, status) VALUES (?, ?)",
        [orderResult.insertId, "pending"],
      );
      await connection.commit();
      return response
        .status(201)
        .json({
          orderNumber,
          total: subtotal,
          paymentMethod,
          paymentStatus,
          orderStatus: "pending",
        });
    } catch (error) {
      await connection.rollback();
      return next(error);
    } finally {
      connection.release();
    }
  },
);

export default router;
