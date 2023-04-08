const dotenv = require('dotenv');
const mysql = require('mysql2');
dotenv.config();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ""
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server: ' + err.stack);
    return;
  }

  console.log('Connected to MySQL server with id ' + connection.threadId);
});

module.exports = connection;