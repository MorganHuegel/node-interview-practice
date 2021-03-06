CREATE TABLE orders (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  customer_name VARCHAR NOT NULL,
  width DECIMAL NOT NULL,
  length DECIMAL NOT NULL,
  height DECIMAL NOT NULL,
  payment_amount INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  submitted_ts TIMESTAMP DEFAULT NOW(),
  completed_ts TIMESTAMP DEFAULT NULL
);