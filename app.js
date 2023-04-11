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



app.post('/insert', (req, res) => {
  const {name, year, rank, genre, director_first_name, director_last_name} = req.body;

  mysqlConnection.query(`SELECT max(id) + 1 AS new FROM movies`, (err, res) => {
    if (err) {
      console.error('Error querying MySQL database: ' + err.stack);
      res.status(500).send('Error querying MySQL database');
      return;
    }
    else{
      new_id = res[0].new;
      console.log("new_id: " + new_id);
      mysqlConnection.query(`INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name) VALUES (${new_id}, '${name}', ${year}, ${rank}, '${genre}', '${director_first_name}', '${director_last_name}')`, (err, results) => {
        if (err) {
          console.error('Error querying MySQL database: ' + err.stack);
          res.status(500).send('Error querying MySQL database');
          return;
        }
        else{
          console.log("Successfully Inserted Data")
        }
      })
    }
  });

  



  res.redirect('/');

})

app.listen(80, () => {
  console.log('Node.js server running on port 80');
});
