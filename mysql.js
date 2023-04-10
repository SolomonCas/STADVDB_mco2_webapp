const dotenv = require('dotenv');
const mysql = require('mysql2');
dotenv.config();

const connection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

connection.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL server: ' + err.stack);
    return;
  }

  console.log('Connected to MySQL server with id ' + connection.threadId);
});

module.exports = connection;
