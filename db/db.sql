CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  nationalid VARCHAR(255),
  country VARCHAR(255),
  lastname VARCHAR(255),
  email VARCHAR(255) NOT NULL
); 

CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  isRecurrent BOOLEAN NOT NULL,
  isActive BOOLEAN NOT NULL,
  isPaid BOOLEAN NOT NULL,
  peoplenumber INT NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL
);