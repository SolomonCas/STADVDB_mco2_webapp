const express = require('express');
const bodyParser = require('body-parser');
const mysqlConnection = require('./mysql');
const exphbs = require('express-handlebars');

const app = express();
var filter_operator;
var filter_attribute, search_attribute;
var filter_input, search_input;

app.engine("hbs", exphbs.engine({ extname: 'hbs', partialsDir: __dirname + '/views/partial/' }));
app.set('view engine', 'hbs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
	res.redirect("/1");
});

app.get('/:page', (req, res) => {
	if (req.params.page === 'favicon.ico') {
		res.status(204).end(); // return a "no content" response
	} else {
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
	}
	
});

app.get('/filter/:page', (req, res) => {
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page
    // Retrieve the total number of records in the database table
    mysqlConnection.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, result) => {
        if (err) throw err;
        const totalRecords = result[0].total;

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        // Calculate the offset for the SQL query based on the current page
        const offset = (page - 1) * recordsPerPage;

        // Retrieve the data for the current page
        mysqlConnection.query(`SELECT * FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
            if (err) throw err;
            res.render('index', { movies: results, current_page: page, total_pages: totalPages});
        });
    });
});


app.post('/filter/:page', (req, res) => {
	const filter = req.body;
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page
	filter_operator = filter.operator;
	filter_attribute = filter.attribute;
	filter_input = filter.filter_input;
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

app.get('/search/:page', (req, res) => {
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page
    // Retrieve the total number of records in the database table
    mysqlConnection.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, result) => {
        if (err) throw err;
        const totalRecords = result[0].total;

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        // Calculate the offset for the SQL query based on the current page
        const offset = (page - 1) * recordsPerPage;

        // Retrieve the data for the current page
        mysqlConnection.query(`SELECT * FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
            if (err) throw err;
            res.render('index', { movies: results, current_page: page, total_pages: totalPages});
        });
    });
});

app.post('/search/:page', (req, res) => {
	const search = req.body;
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page
	search_attribute = search.attribute;
	search_input = search.search_input;
    // Retrieve the total number of records in the database table
    mysqlConnection.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search.attribute} LIKE "%${search.search_input}%" ORDER BY ${search.attribute}`, (err, result) => {
        if (err) throw err;
        const totalRecords = result[0].total;

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        // Calculate the offset for the SQL query based on the current page
        const offset = (page - 1) * recordsPerPage;

        // Retrieve the data for the current page
        mysqlConnection.query(`SELECT * FROM movies WHERE ${search.attribute} LIKE "%${search.search_input}%" ORDER BY ${search.attribute} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
            if (err) throw err;
            res.render('index', { movies: results, current_page: page, total_pages: totalPages});
        });
    });
});


app.post('/insert', (req, res) => {
	const movie = req.body;

	mysqlConnection.query(`SELECT max(id) + 1 AS new FROM movies`, (err, resp) => {
		if (err) {
			console.error('Error querying MySQL database: ' + err.stack);
			res.status(500).send('Error querying MySQL database');
			return;
		}
		else {
			new_id = resp[0].new;
			console.log("new_id: " + new_id);
			
			const values = [new_id, movie.name, movie.year, movie.rank, movie.genre, movie.director_first_name, movie.director_last_name];
			const statement = `INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name) VALUES (?, ?, ?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))`;
			
			mysqlConnection.query(statement, values, (err, results) => {
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
