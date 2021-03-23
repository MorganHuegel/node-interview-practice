// app.use(express.json()); // for parsing application/json

// app
//   .route("/v1/orders")
//   .get((req, res, next) => {
//     const knexInstance = req.app.get("db");
//     OrderService.getOrders(knexInstance)
//       .then((list) => {
//         let serializedList = list.map((order) => serializeOrder(order));
//         return res.json(serializedList);
//       })
//       .catch(() => {
//         return next();
//       });
//   })
//   .post((req, res, next) => {
//     // body has keys {customer_name, width, lenght, height, payment_amount}
//     // must include `app.use(expores.json())` in order to parse the JSON body though
//     const newOrder = req.body;
//     if (
//       !newOrder.customer_name ||
//       !newOrder.width ||
//       !newOrder.height ||
//       !newOrder.length ||
//       !newOrder.payment_amount
//     ) {
//       return res.status(400).json({ error: "Missing a required field." });
//     }
//     const knexInstance = req.app.get("db");
//     OrderService.insertOrder(knexInstance, newOrder)
//       .then((order) => {
//         return res
//           .status(201)
//           .location(`/v1/orders/${order.id}`)
//           .json(serializeOrder(order));
//       })
//       .catch(() => {
//         return next();
//       });
//   });
