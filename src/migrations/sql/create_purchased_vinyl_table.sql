CREATE TABLE purchased_vinyl (
  vinylId INT,
  userId INT,
  amount INT NOT NULL,
  moneySpent DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (vinylId, userId),
  FOREIGN KEY (vinylId) REFERENCES vinyl(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);
