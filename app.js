const express = require('express');
const mysqlConnection = require('./mysql');
const exphbs = require('express-handlebars');

const app = express();


app.engine("hbs", exphbs.engine({extname: 'hbs', partialsDir: __dirname + '/views/partial/'}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  mysqlConnection.query('SELECT * FROM node1.movies', (err, rows, fields) => {
    if (err) {
      console.error('Error querying MySQL database: ' + err.stack);
      res.status(500).send('Error querying MySQL database');
      return;
    }
    res.status(400).render('index',{
        movies:rows
    })
  });
});

app.listen(3000, () => {
  console.log('Node.js server running on port 3000');
});
