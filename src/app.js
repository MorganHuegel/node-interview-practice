require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const errorHandler = require("./middleware/error-handler");
const OrderService = require("./order/order-service");
const xss = require("xss");
const jsonParser = express.json();
const path = require("path");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(
  morgan(morganOption, {
    skip: () => NODE_ENV === "test",
  })
);
app.use(cors());
app.use(helmet());

app.use(express.static("public"));

const serializeOrder = (order) => ({
  id: order.id,
  customer_name: xss(order.customer_name),
  width: order.width,
  length: order.length,
  height: order.height,
  payment_amount: order.payment_amount.toFixed(2),
  completed: order.completed,
  submitted_ts: order.submitted_ts,
});

// app.route("/v1/orders").get(/* Your code here */).post(/* Your code here */);

app
  .route("/v1/orders/:order_id")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.order_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` },
      });
    }
    OrderService.getOrderById(req.app.get("db"), req.params.order_id)
      .then((order) => {
        if (!order) {
          return res.status(404).json({
            error: { message: `Order doesn't exist` },
          });
        }
        res.order = order;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeOrder(res.order));
  })
  .delete((req, res, next) => {
    OrderService.deleteOrder(req.app.get("db"), req.params.order_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { customer_name, completed = false } = req.body;
    const orderToUpdate = { customer_name, completed };

    const numberOfValues = Object.values(orderToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'customer_name' or 'completed'`,
        },
      });

    OrderService.updateOrder(
      req.app.get("db"),
      req.params.order_id,
      orderToUpdate
    )
      .then((updatedOrder) => {
        res.status(200).json(serializeOrder(updatedOrder[0]));
      })
      .catch(next);
  });

app.use(errorHandler);

module.exports = app;
