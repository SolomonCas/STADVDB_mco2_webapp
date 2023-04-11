const express = require('express');
const bodyParser = require('body-parser');
const mysqlConnection = require('./mysql');
const exphbs = require('express-handlebars');
const hostname = '172.16.3.128'; // for node2

const app = express();
var operator;
var attribute;
var input;

app.engine("hbs", exphbs.engine({ extname: 'hbs', partialsDir: __dirname + '/views/partial/' }));
app.set('view engine', 'hbs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
	res.redirect("/1");
});

app.get('/:page', (req, res) => {
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page

    // Retrieve the total number of records in the database table
    mysqlConnection.query('SELECT COUNT(*) AS total FROM movies', (err, result) => {
        if (err) throw err;
        const totalRecords = result[0].total;

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        // Calculate the offset for the SQL query based on the current page
        const offset = (page - 1) * recordsPerPage;

        // Retrieve the data for the current page
        mysqlConnection.query('SELECT * FROM movies LIMIT ? OFFSET ?', [recordsPerPage, offset], (err, results) => {
            if (err) throw err;
            res.render('index', { movies: results, current_page: page, total_pages: totalPages});
        });
    });
});

app.get('/filter/:page', (req, res) => {
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page
    // Retrieve the total number of records in the database table
    mysqlConnection.query(`SELECT COUNT(*) AS total FROM movies WHERE ${attribute} ${operator} ${input}`, (err, result) => {
        if (err) throw err;
        const totalRecords = result[0].total;

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        // Calculate the offset for the SQL query based on the current page
        const offset = (page - 1) * recordsPerPage;

        // Retrieve the data for the current page
        mysqlConnection.query(`SELECT * FROM movies WHERE ${attribute} ${operator} ${input} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
            if (err) throw err;
            res.render('index', { movies: results, current_page: page, total_pages: totalPages});
        });
    });
});


app.post('/filter/:page', (req, res) => {
	const filter = req.body;
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page
	operator = filter.operator;
	attribute = filter.attribute;
	input = filter.filter_input;
    // Retrieve the total number of records in the database table
    mysqlConnection.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter.attribute} ${filter.operator} ${filter.filter_input}`, (err, result) => {
        if (err) throw err;
        const totalRecords = result[0].total;

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        // Calculate the offset for the SQL query based on the current page
        const offset = (page - 1) * recordsPerPage;

        // Retrieve the data for the current page
        mysqlConnection.query(`SELECT * FROM movies WHERE ${filter.attribute} ${filter.operator} ${filter.filter_input} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
            if (err) throw err;
            res.render('index', { movies: results, current_page: page, total_pages: totalPages});
        });
    });
});

app.post('/insert', (req, res) => {
	const { name, year, rank, genre, director_first_name, director_last_name } = req.body;

	mysqlConnection.query(`SELECT max(id) + 1 AS new FROM movies`, (err, resp) => {
		if (err) {
			console.error('Error querying MySQL database: ' + err.stack);
			res.status(500).send('Error querying MySQL database');
			return;
		}
		else {
			new_id = resp[0].new;
			console.log("new_id: " + new_id);
			mysqlConnection.query(`INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name) VALUES (${new_id}, '${name}', ${year}, ${rank}, '${genre}', '${director_first_name}', '${director_last_name}')`, (err, results) => {
				if (err) {
					console.error('Error querying MySQL database: ' + err.stack);
					res.status(500).send('Error querying MySQL database');
					return;
				}
				else {
					console.log("Successfully Inserted Data");
					res.redirect('/');
				}
			})
		}
	});
	
});

app.post('/update', async (req, res) => {

	const movie = req.body;
	const statement = `UPDATE movies SET name = COALESCE(NULLIF(?, ''), name), year = COALESCE(NULLIF(?, ''), year), \`rank\` = COALESCE(NULLIF(?, ''), \`rank\`), genre = COALESCE(NULLIF(?, ''), genre), director_first_name = COALESCE(NULLIF(?, ''), director_first_name), director_last_name = COALESCE(NULLIF(?, ''), director_last_name) WHERE id = ?`;
	if(movie.update_id == ''){
		res.redirect('/');
	}
	else{
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
	}
	
});

app.post('/delete', (req, res) => {

	const id = req.body.selectedrow;
	console.log(id);


	mysqlConnection.query(`DELETE FROM movies WHERE id = ${id}`, (err, rows, fields) => {
		if (err) {
			console.error('Error querying MySQL database: ' + err.stack);
			res.status(500).send('Error querying MySQL database');
			return;
		}
		console.log('Successful Deletion');
		res.redirect('/');
	})

});
app.listen(80, () => {
	console.log('Node.js server running on port 80');
});
