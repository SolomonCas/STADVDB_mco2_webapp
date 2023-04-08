const express = require('express');
const mysqlConnection = require('./mysql');

const app = express();

app.get('/api/data', (req, res) => {
  mysqlConnection.query('SELECT * FROM sakila.actor', (err, rows, fields) => {
    if (err) {
      console.error('Error querying MySQL database: ' + err.stack);
      res.status(500).send('Error querying MySQL database');
      return;
    }

    res.send(rows);
  });
});

app.listen(3000, () => {
  console.log('Node.js server running on port 3000');
});
