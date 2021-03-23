const OrderService = {
  getOrders(db) {
    return db.from("orders").select("orders.*");
  },
  getOrderById(db, order_id) {
    return db
      .from("orders")
      .select("orders.*")
      .where("orders.id", order_id)
      .first();
  },
  insertOrder(db, newOrder) {
    return db
      .insert(newOrder)
      .into("orders")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  deleteOrder(db, order_id) {
    return db("orders").where({ id: order_id }).delete();
  },
  updateOrder(db, order_id, newOrder) {
    return db("orders")
      .where({ id: order_id })
      .update(newOrder, (returning = true))
      .returning("*");
  },
};

module.exports = OrderService;
