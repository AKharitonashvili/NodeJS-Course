CREATE TABLE review (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  userId INT,
  vinylId INT,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (vinylId) REFERENCES vinyl(id) ON DELETE CASCADE
);
