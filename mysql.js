const dotenv = require('dotenv');
const mysql = require('mysql2');
dotenv.config();

const node_1 = mysql.createPool({
	host: process.env.HOST,
	port: process.env.PORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE
});

const node_2 = mysql.createPool({
	host: process.env.HOST2,
	port: process.env.PORT2,
	user: process.env.USER2,
	password: process.env.PASSWORD2,
	database: process.env.DATABASE2
});

const node_3 = mysql.createPool({
	host: process.env.HOST3,
	port: process.env.PORT3,
	user: process.env.USER3,
	password: process.env.PASSWORD3,
	database: process.env.DATABASE3
});

node_1.getConnection((err, conn) => {
	if (err) {
		console.error('Error connecting to MySQL server: ' + err.stack);
	}
	else{
		console.log('Connected to MySQL server node 1 with id ' + conn.threadId);
	}
	
});
node_2.getConnection((err, conn) => {
	if (err) {
		console.error('Error connecting to MySQL server: ' + err.stack);

	}
	else{
		console.log('Connected to MySQL server node 2 with id ' + conn.threadId);
	}

	
});
node_3.getConnection((err, conn) => {
	if (err) {
		console.error('Error connecting to MySQL server: ' + err.stack);
		
	}
	else{
		console.log('Connected to MySQL server node 3 with id ' + conn.threadId);
	}

});

module.exports = {node_1, node_2, node_3};
