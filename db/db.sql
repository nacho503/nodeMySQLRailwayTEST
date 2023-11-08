CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  nationalid VARCHAR(255),
  country VARCHAR(255),
  lastname VARCHAR(255),
  email VARCHAR(255) NOT NULL
); 

