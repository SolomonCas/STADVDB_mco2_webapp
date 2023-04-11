const express = require('express');
const bodyParser = require('body-parser');
const mysqlConnection = require('./mysql');
const exphbs = require('express-handlebars');
const hostname = '172.16.3.128'; // for node2

const app = express();


app.engine("hbs", exphbs.engine({extname: 'hbs', partialsDir: __dirname + '/views/partial/'}));
app.set('view engine', 'hbs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  mysqlConnection.query('SELECT * FROM movies WHERE id LIMIT 10', (err, rows, fields) => {
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

app.post('/update', async (req, res) => {

    const movie = req.body;
    const statement = 'UPDATE movies SET name=?, year=?, `rank`=?, genre=?, director_first_name=?, director_last_name=? WHERE id=?';
    const values = [movie.update_name, movie.update_year, movie.update_rank, movie.update_genre, movie.update_director_first_name, movie.update_director_last_name, movie.update_id];
    
    mysqlConnection.query(statement, values, (err, rows, fields) => {
      if (err) {
        console.error('Error querying MySQL database: ' + err.stack);
        res.status(500).send('Error querying MySQL database');
        return;
      }
      console.log('Successfully Updated Data');
      res.redirect('/');
    });
});

app.listen(80, () => {
  console.log('Node.js server running on port 80');
});