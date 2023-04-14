const dotenv = require('dotenv');
const mysql = require('mysql2');
dotenv.config();

const connection = mysql.createPool({
	host: process.env.HOST,
	port: process.env.PORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE
});

connection.getConnection((err, connection) => {
	if (err) {
		console.error('Error connecting to MySQL server: ' + err.stack);
		return;
	}

	console.log('Connected to MySQL server with id ' + connection.threadId);
});

module.exports = connection;
