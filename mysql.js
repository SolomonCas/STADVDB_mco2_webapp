const dotenv = require('dotenv');
const mysql = require('mysql2');
dotenv.config();

const connection = mysql.createConnection({
  host: "172.16.3.127/24",
  user: "root",
  password: "123"
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server: ' + err.stack);
    return;
  }

  console.log('Connected to MySQL server with id ' + connection.threadId);
});

module.exports = connection;
