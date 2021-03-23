const knex = require("knex");
const app = require("../src/app");

describe("Todo API:", function () {
  let db;
  let orders = [
    {
      customer_name: "Morgan",
      width: 10,
      length: 8,
      height: 2,
      payment_amount: 75,
    },
    {
      customer_name: "Wes",
      width: 12,
      length: 14,
      height: 2.5,
      payment_amount: 85,
    },
    {
      customer_name: "Austin Powers",
      width: 4,
      length: 6,
      height: 1.25,
      payment_amount: 43,
    },
    ,
    {
      customer_name: "Dr. Evil",
      width: 14,
      length: 12,
      height: 2.33,
      payment_amount: 115,
    },
    {
      customer_name: "Mini Me",
      width: 4,
      length: 5,
      height: 1,
      payment_amount: 25,
    },
  ];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  before("cleanup", () => db.raw("TRUNCATE TABLE orders RESTART IDENTITY;"));

  afterEach("cleanup", () => db.raw("TRUNCATE TABLE orders RESTART IDENTITY;"));

  after("disconnect from the database", () => db.destroy());

  describe("GET /v1/orders", () => {
    beforeEach("insert some orders", () => {
      return db("orders").insert(orders);
    });

    it("should respond to GET `/v1/orders` with an array of orders and status 200", function () {
      return supertest(app)
        .get("/v1/orders")
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.a("array");
          expect(res.body).to.have.length(orders.length);
          res.body.forEach((item) => {
            expect(item).to.be.a("object");
            expect(item).to.include.keys(
              "id",
              "customer_name",
              "width",
              "height",
              "length",
              "payment_amount",
              "completed",
              "submitted_ts"
            );
          });
        });
    });
  });

  describe("GET /v1/orders/:id", () => {
    beforeEach("insert some orders", () => {
      return db("orders").insert(orders);
    });

    it("should return correct order when given an id", () => {
      let doc;
      return db("orders")
        .first()
        .then((_doc) => {
          doc = _doc;
          return supertest(app).get(`/v1/orders/${doc.id}`).expect(200);
        })
        .then((res) => {
          expect(res.body).to.be.an("object");
          expect(res.body).to.include.keys(
            "id",
            "customer_name",
            "width",
            "height",
            "length",
            "payment_amount",
            "completed",
            "submitted_ts"
          );
          expect(res.body.id).to.equal(doc.id);
          expect(res.body.customer_name).to.equal(doc.customer_name);
          expect(res.body.completed).to.equal(doc.completed);
        });
    });

    it("should respond with a 404 when given an invalid id", () => {
      return supertest(app).get("/v1/orders/aaaaaaaaaaaa").expect(404);
    });
  });

  describe("POST /v1/orders", function () {
    it("should create and return a new order when provided valid data", function () {
      const newItem = {
        customer_name: "Fat Bastard",
        width: 20,
        length: 22,
        height: 3.5,
        payment_amount: 130,
      };

      return supertest(app)
        .post("/v1/orders")
        .send(newItem)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.be.a("object");
          expect(res.body).to.include.keys(
            "id",
            "customer_name",
            "width",
            "height",
            "length",
            "payment_amount",
            "completed",
            "submitted_ts"
          );
          expect(res.body.customer_name).to.equal(newItem.customer_name);
          expect(res.body.completed).to.be.false;
          expect(res.headers.location).to.equal(`/v1/orders/${res.body.id}`);
        });
    });

    it("should respond with 400 status when given bad data", function () {
      const badItem = {
        foobar: "broken item",
      };
      return supertest(app).post("/v1/orders").send(badItem).expect(400);
    });
  });

  describe("PATCH /v1/orders/:id", () => {
    beforeEach("insert some orders", () => {
      return db("orders").insert(orders);
    });

    it("should update item when given valid data and an id", function () {
      const item = {
        customer_name: "Austin Powers Fasshha",
        completed: true,
      };

      let doc;
      return db("orders")
        .first()
        .then((_doc) => {
          doc = _doc;
          return supertest(app)
            .patch(`/v1/orders/${doc.id}`)
            .send(item)
            .expect(200);
        })
        .then((res) => {
          expect(res.body).to.be.a("object");
          expect(res.body).to.include.keys(
            "id",
            "customer_name",
            "width",
            "height",
            "length",
            "payment_amount",
            "completed",
            "submitted_ts"
          );
          expect(res.body.customer_name).to.equal(item.customer_name);
          expect(res.body.completed).to.be.true;
        });
    });

    it("should respond with 400 status when given bad data", function () {
      const badItem = {
        foobar: "broken item",
      };

      return db("orders")
        .first()
        .then((doc) => {
          return supertest(app)
            .patch(`/v1/orders/${doc.id}`)
            .send(badItem)
            .expect(400);
        });
    });

    it("should respond with a 404 for an invalid id", () => {
      const item = {
        customer_name: "Buy New Dishes",
      };
      return supertest(app)
        .patch("/v1/orders/aaaaaaaaaaaaaaaaaaaaaaaa")
        .send(item)
        .expect(404);
    });
  });

  describe("DELETE /v1/orders/:id", () => {
    beforeEach("insert some orders", () => {
      return db("orders").insert(orders);
    });

    it("should delete an item by id", () => {
      return db("orders")
        .first()
        .then((doc) => {
          return supertest(app).delete(`/v1/orders/${doc.id}`).expect(204);
        });
    });

    it("should respond with a 404 for an invalid id", function () {
      return supertest(app)
        .delete("/v1/orders/aaaaaaaaaaaaaaaaaaaaaaaa")
        .expect(404);
    });
  });
});
