const express = require('express');
const mysqlConnection = require('./mysql');
const exphbs = require('express-handlebars');
const hostname = '172.16.3.128'; // for node2

const app = express();


app.engine("hbs", exphbs.engine({extname: 'hbs', partialsDir: __dirname + '/views/partial/'}));
app.set('view engine', 'hbs');

app.use(express.static('public'));

app.get('/', (req, res) => {
  mysqlConnection.query('SELECT * FROM movies WHERE id < 10', (err, rows, fields) => {
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

app.listen(38028, hostname, () => {
  console.log('Node.js server running on port ccscloud3.dlsu.edu.ph:38028');
});
