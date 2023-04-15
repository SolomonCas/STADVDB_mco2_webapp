const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const {node_1, node_2, node_3} = require('./mysql');
const exphbs = require('express-handlebars');

const app = express();

app.engine("hbs", exphbs.engine({ extname: 'hbs', partialsDir: __dirname + '/views/partial/' }));
app.set('view engine', 'hbs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Set up session middleware
app.use(session({
	secret: 'supercalifragilisticexpialidocious',
	resave: false,
	saveUninitialized: true
  }));


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
		node_1.query('SELECT COUNT(*) AS total FROM movies', (err, result) => {
			if (err){
				node_2.query('SELECT COUNT(*) AS total FROM movies', (err, result) => {
					if (err) throw err;
					var totalRecords = result[0].total;
					// Calculate the total number of pages
					var totalPages = Math.ceil(totalRecords / recordsPerPage);
					var node_2_total_pages = totalPages;
					// Retrieve the data for the current page
					node_3.query('SELECT COUNT(*) AS total FROM movies', (err, data) => {
						if (err) throw err;
						totalRecords += data[0].total;
					
						// Calculate the total number of pages
						const totalPages = Math.ceil(totalRecords / recordsPerPage);
					
						// Calculate the offset for the SQL query based on the current page
						var offset = (page - 1) * recordsPerPage;
						console.log("node_2_total_pages: " + node_2_total_pages);
						// Retrieve the data for the current page
						if(node_2_total_pages >= page){
							console.log("node_2");
							node_2.query('SELECT * FROM movies LIMIT ? OFFSET ?', [recordsPerPage, offset], (err, results) => {
								if (err) throw err;
								res.render('index', { movies: results, current_page: page, total_pages: totalPages});
							});
						}
						else{
							console.log("node_3");
							offset = (page - 1 - node_2_total_pages) * recordsPerPage;
							node_3.query('SELECT * FROM movies LIMIT ? OFFSET ?', [recordsPerPage, offset], (err, results) => {
								if (err) throw err;
								res.render('index', { movies: results, current_page: page, total_pages: totalPages});
							});
						}
						
					});
					
				});
			}
			else{
				const totalRecords = result[0].total;
			
				// Calculate the total number of pages
				const totalPages = Math.ceil(totalRecords / recordsPerPage);
				
				// Calculate the offset for the SQL query based on the current page
				const offset = (page - 1) * recordsPerPage;
				// Retrieve the data for the current page
				node_1.query('SELECT * FROM movies LIMIT ? OFFSET ?', [recordsPerPage, offset], (err, results) => {
					if (err) throw err;
					res.render('index', { movies: results, current_page: page, total_pages: totalPages});
				});
			}
			
		});	
		
	}
	
});

app.get('/filter/:page', (req, res) => {
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page
	
	// get session variables
	const filter_attribute = req.session.filter_attribute;
	const filter_operator = req.session.filter_operator;
	const filter_input = req.session.filter_input;
	
    //Retrieve the total number of records in the database table'
	node_1.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, result) => {
		if (err) {
			node_2.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, result) => {
				if (err) throw err;
				var totalRecords = result[0].total;
				// Calculate the total number of pages
				var totalPages = Math.ceil(totalRecords / recordsPerPage);
				var node_2_total_pages = totalPages;
				// Retrieve the data for the current page
				node_3.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, data) => {
					if (err) throw err;
					totalRecords += data[0].total;
				
					// Calculate the total number of pages
					const totalPages = Math.ceil(totalRecords / recordsPerPage);
				
					// Calculate the offset for the SQL query based on the current page
					var offset = (page - 1) * recordsPerPage;
					console.log("node_2_total_pages: " + node_2_total_pages);
					// Retrieve the data for the current page
					if(node_2_total_pages >= page){
						console.log("node_2");
						node_2.query(`SELECT * FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
							if (err) throw err;
							res.render('index', { movies: results, current_page: page, total_pages: totalPages});
						});
					}
					else{
						console.log("node_3");
						offset = (page - 1 - node_2_total_pages) * recordsPerPage;
						node_3.query(`SELECT * FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
							if (err) throw err;
							res.render('index', { movies: results, current_page: page, total_pages: totalPages});
						});
					}
					
				});
				
			});
		}
		else{
			const totalRecords = result[0].total;
	
			// Calculate the total number of pages
			const totalPages = Math.ceil(totalRecords / recordsPerPage);
		
			// Calculate the offset for the SQL query based on the current page
			const offset = (page - 1) * recordsPerPage;
		
			// Retrieve the data for the current page
			node_1.query(`SELECT * FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
				if (err) throw err;
				res.render('index', { movies: results, current_page: page, total_pages: totalPages});
			});
		}
		
	});
    
});


app.post('/filter/:page', (req, res) => {
	const filter = req.body;
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page

	// get session variables
	const filter_attribute = req.session.filter_attribute = filter.attribute;
	const filter_operator = req.session.filter_operator = filter.operator;
	const filter_input = req.session.filter_input = filter.filter_input;
	
    // Retrieve the total number of records in the database table
	node_1.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, result) => {
		if (err) {
			node_2.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, result) => {
				if (err) throw err;
				var totalRecords = result[0].total;
				// Calculate the total number of pages
				var totalPages = Math.ceil(totalRecords / recordsPerPage);
				var node_2_total_pages = totalPages;
				// Retrieve the data for the current page
				node_3.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, data) => {
					if (err) throw err;
					totalRecords += data[0].total;
				
					// Calculate the total number of pages
					const totalPages = Math.ceil(totalRecords / recordsPerPage);
				
					// Calculate the offset for the SQL query based on the current page
					var offset = (page - 1) * recordsPerPage;
					console.log("node_2_total_pages: " + node_2_total_pages);
					// Retrieve the data for the current page
					if(node_2_total_pages >= page){
						console.log("node_2");
						node_2.query(`SELECT * FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
							if (err) throw err;
							res.render('index', { movies: results, current_page: page, total_pages: totalPages});
						});
					}
					else{
						console.log("node_3");
						offset = (page - 1 - node_2_total_pages) * recordsPerPage;
						node_3.query(`SELECT * FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
							if (err) throw err;
							res.render('index', { movies: results, current_page: page, total_pages: totalPages});
						});
					}
					
				});
				
			});
		}
		else{
			const totalRecords = result[0].total;
	
			// Calculate the total number of pages
			const totalPages = Math.ceil(totalRecords / recordsPerPage);
		
			// Calculate the offset for the SQL query based on the current page
			const offset = (page - 1) * recordsPerPage;
		
			// Retrieve the data for the current page
			node_1.query(`SELECT * FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
				if (err) throw err;
				res.render('index', { movies: results, current_page: page, total_pages: totalPages});
			});
		}
		
	});
    
});

app.get('/search/:page', (req, res) => {
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page
	
	// get session variables
	const search_attribute = req.session.search_attribute;
	const search_input = req.session.search_input;

    // Retrieve the total number of records in the database table
	node_1.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, result) => {
		if (err) {
			node_2.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, result) => {
				if (err) throw err;
				var totalRecords = result[0].total;
				// Calculate the total number of pages
				var totalPages = Math.ceil(totalRecords / recordsPerPage);
				var node_2_total_pages = totalPages;
				// Retrieve the data for the current page
				node_3.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, data) => {
					if (err) throw err;
					totalRecords += data[0].total;
				
					// Calculate the total number of pages
					const totalPages = Math.ceil(totalRecords / recordsPerPage);
				
					// Calculate the offset for the SQL query based on the current page
					var offset = (page - 1) * recordsPerPage;
					console.log("node_2_total_pages: " + node_2_total_pages);
					// Retrieve the data for the current page
					if(node_2_total_pages >= page){
						console.log("node_2");
						node_2.query(`SELECT * FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
							if (err) throw err;
							res.render('index', { movies: results, current_page: page, total_pages: totalPages});
						});
					}
					else{
						console.log("node_3");
						offset = (page - 1 - node_2_total_pages) * recordsPerPage;
						node_3.query(`SELECT * FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
							if (err) throw err;
							res.render('index', { movies: results, current_page: page, total_pages: totalPages});
						});
					}
					
				});
				
			});
		}
		else{
			const totalRecords = result[0].total;
	
			// Calculate the total number of pages
			const totalPages = Math.ceil(totalRecords / recordsPerPage);
		
			// Calculate the offset for the SQL query based on the current page
			const offset = (page - 1) * recordsPerPage;
		
			// Retrieve the data for the current page
			node_1.query(`SELECT * FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
				if (err) throw err;
				res.render('index', { movies: results, current_page: page, total_pages: totalPages});
			});
		}
		
	});
    
});

app.post('/search/:page', (req, res) => {
	const search = req.body;
	const page = parseInt(req.params.page);
    const recordsPerPage = 10; // Set the number of records per page
	
	// get session variables
	const search_attribute = req.session.search_attribute = search.attribute;
	const search_input = req.session.search_input = search.search_input;

    // Retrieve the total number of records in the database table
	node_1.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, result) => {
		if (err) {
			node_2.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, result) => {
				if (err) throw err;
				var totalRecords = result[0].total;
				// Calculate the total number of pages
				var totalPages = Math.ceil(totalRecords / recordsPerPage);
				var node_2_total_pages = totalPages;
				// Retrieve the data for the current page
				node_3.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, data) => {
					if (err) throw err;
					totalRecords += data[0].total;
				
					// Calculate the total number of pages
					const totalPages = Math.ceil(totalRecords / recordsPerPage);
				
					// Calculate the offset for the SQL query based on the current page
					var offset = (page - 1) * recordsPerPage;
					console.log("node_2_total_pages: " + node_2_total_pages);
					// Retrieve the data for the current page
					if(node_2_total_pages >= page){
						console.log("node_2");
						node_2.query(`SELECT * FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
							if (err) throw err;
							res.render('index', { movies: results, current_page: page, total_pages: totalPages});
						});
					}
					else{
						console.log("node_3");
						offset = (page - 1 - node_2_total_pages) * recordsPerPage;
						node_3.query(`SELECT * FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
							if (err) throw err;
							res.render('index', { movies: results, current_page: page, total_pages: totalPages});
						});
					}
					
				});
				
			});
		}
		else{
			const totalRecords = result[0].total;
	
			// Calculate the total number of pages
			const totalPages = Math.ceil(totalRecords / recordsPerPage);
		
			// Calculate the offset for the SQL query based on the current page
			const offset = (page - 1) * recordsPerPage;
		
			// Retrieve the data for the current page
			node_1.query(`SELECT * FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute} LIMIT ? OFFSET ?`, [recordsPerPage, offset], (err, results) => {
				if (err) throw err;
				res.render('index', { movies: results, current_page: page, total_pages: totalPages});
			});
		}
		
	});
    
});


app.post('/insert', (req, res) => {
	const movie = req.body;
		node_1.query(`SELECT max(id) + 1 AS new FROM movies`, (err, resp) => {
			if (err) {
				node_2.query(`SELECT max(id) + 1 AS new FROM movies`, (err, resp) => {
					if (err) {
						console.error('Error querying node_2 MySQL database: ' + err.stack);
						res.status(500).send('Error querying MySQL database');
						return;
					}
					else {
						new_id1 = resp[0].new;
						console.log("new_id1: " + new_id1);
						
						node_3.query(`SELECT max(id) + 1 AS new FROM movies`, (err,resp) => {
							if (err){
								console.error('Error querying node_2 MySQL database: ' + err.stack);
								res.status(500).send('Error querying MySQL database');
								return;
							}
							else {
								
								var max;
								new_id2 = resp[0].new;
								console.log("new_id2: " + new_id2);
								if(new_id1 > new_id2){
									max = new_id1
								} 
								else{
									max = new_id2
								}
								console.log(max)

								const values = [max, movie.name, movie.year, movie.rank, movie.genre, movie.director_first_name, movie.director_last_name];
								const statement = `INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name) VALUES (?, ?, ?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))`;
								
								if(movie.year >= 1980){
									node_3.query(statement, values, (err, results) => {
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
								else{
									node_2.query(statement, values, (err, results) => {
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

							}

						})

						// const values = [new_id, movie.name, movie.year, movie.rank, movie.genre, movie.director_first_name, movie.director_last_name];
						// const statement = `INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name) VALUES (?, ?, ?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))`;
						
						// node_1.query(statement, values, (err, results) => {
						// 	if (err) {
						// 		console.error('Error querying MySQL database: ' + err.stack);
						// 		res.status(500).send('Error querying MySQL database');
						// 		return;
						// 	}
						// 	else {
						// 		console.log("Successfully Inserted Data");
						// 		res.redirect('/');
						// 	}
						// })
					}
				});
			}
			else {
				new_id = resp[0].new;
				console.log("new_id: " + new_id);
				
				const values = [new_id, movie.name, movie.year, movie.rank, movie.genre, movie.director_first_name, movie.director_last_name];
				const statement = `INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name) VALUES (?, ?, ?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))`;
				
				node_1.query(statement, values, (err, results) => {
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

app.post('/update', (req, res) => {

	const movie = req.body;
	const statement = `UPDATE movies SET name = COALESCE(NULLIF(?, ''), name), year = COALESCE(NULLIF(?, ''), year), \`rank\` = COALESCE(NULLIF(?, ''), \`rank\`), genre = COALESCE(NULLIF(?, ''), genre), director_first_name = COALESCE(NULLIF(?, ''), director_first_name), director_last_name = COALESCE(NULLIF(?, ''), director_last_name) WHERE id = ?`;
	const values = [movie.update_name, movie.update_year, movie.update_rank, movie.update_genre, movie.update_director_first_name, movie.update_director_last_name, movie.update_id];
	if(movie.update_id == ''){
		res.redirect('/');
	}
	else{
		node_1.query('START TRANSACTION', function(err) {
			if (err) {
				if (movie.update_year < 1980) {
					node_2.query('START TRANSACTION', function(err) {
						if (err) {
							node_2.query('ROLLBACK', function() {
								console.log('NODE 2 transaction rolled back.');
							  throw err;
							});
						}
						else {
							node_2.query(statement, values, (err, results) => {
								if (err) {
									node_1.query('ROLLBACK', function() {
										console.log('NODE 2 transaction rolled back.');
									  	throw err;
									});
								}
								else {
									node_2.query('COMMIT', function(err) {
										if (err) {
											node_3.query('ROLLBACK', function() {
												console.log('NODE 2 transaction rolled back.');
												throw err;
											});
										}
										else {
											console.log('NODE 2 transaction completed successfully.');
											console.log('Successfully updated data with id: ' + movie.update_id);
											res.redirect('/');
										}
									});
								}
							})
						}
					})
				}
				else {
					node_3.query('START TRANSACTION', function(err) {
						if (err) {
							node_3.query('ROLLBACK', function() {
								console.log('NODE 3 transaction rolled back.');
							  	throw err;
							});
						}
						else {
							node_3.query(statement, values, (err, results) => {
								if (err) {
									node_3.query('ROLLBACK', function() {
										console.log('NODE 3 transaction rolled back.');
									  throw err;
									});
								}
								else {
									node_3.query('COMMIT', function(err) {
										if (err) {
											node_3.query('ROLLBACK', function() {
												console.log('NODE 3 transaction rolled back.');
												throw err;
											});
										}
										else {
											console.log('Node 3 transaction completed successfully.');
											console.log('Successfully updated data with id: ' + movie.update_id);
											res.redirect('/');
										}
									});
								}
							})
						}
					})
				}
			}
			else {
				console.log('NODE 1 transaction started.');
				node_1.query(statement, values, (err, results) => {
					if (err) {
						node_1.query('ROLLBACK', function() {
							console.log('NODE 1 transaction rolled back.');
						  throw err;
						});
					}
					else {
						node_1.query('COMMIT', function(err) {
							if (err) {
								node_1.query('ROLLBACK', function() {
									console.log('NODE 1 transaction rolled back.');
									throw err;
							  	});
							}
							else {
								console.log('NODE 1 transaction completed successfully.');
								console.log('Successfully updated data with id: ' + movie.update_id);
								res.redirect('/');
							}
						  });
					}
				});
			}
		})
		  
	}
	
});

app.post('/delete', (req, res) => {

	const movie = req.body;
	const statement = `DELETE FROM movies WHERE id = ?`;
	const values = [movie.id];
	node_1.query(statement, values, (err, rows, fields) => {
		if (err) {
			if (movie.year < 1980) {
				node_2.query(statement, values, (err, results) => {
					if (err) throw err;
					console.log('Successfully Deleted Data node2');
					res.status(200).send();
					return;
				})
			}
			else {
				node_3.query(statement, values, (err, results) => {
					if (err) throw err;
					console.log('Successfully Deleted Data node3');
					res.status(200).send();
					return;
				})
			}
		}
		else {
			console.log('Successfully Deleted Data node1');
			res.status(200).send();
			return;
		}
	});
});

app.listen(80, () => {
 	console.log('Node.js server running on port 80');
});
