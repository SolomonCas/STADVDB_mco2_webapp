const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const {node_1, node_2, node_3} = require('./mysql');
const exphbs = require('express-handlebars');
dotenv.config();

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

// function delay(){
// 	return new Promise((resolve) => setTimeout(resolve, 8000));
// }

app.use(async function(req, res, loadpage) {
	console.log(req.url);
	node_1.query(`SET GLOBAL TRANSACTION ISOLATION LEVEL ${process.env.ISOLATIONLEVEL}`, function(err){
		if(err){
			console.log(err);
		}
	});
	node_2.query(`SET GLOBAL TRANSACTION ISOLATION LEVEL ${process.env.ISOLATIONLEVEL}`, function(err){
		if(err){
			console.log(err);
		}
	});
	node_3.query(`SET GLOBAL TRANSACTION ISOLATION LEVEL ${process.env.ISOLATIONLEVEL}`, function(err){
		if(err){
			console.log(err);
		}
	});
	node_1.query('SELECT @@global.transaction_isolation;', (err, result) => {
		if (err) console.log(err);
		else console.log(result);
	});
	node_2.query('SELECT @@global.transaction_isolation;', (err, result) => {
		if (err) console.log(err);
		else console.log(result);
	});
	node_3.query('SELECT @@global.transaction_isolation;', (err, result) => {
		if (err) console.log(err);
		else console.log(result);
	});
	const promises = [];
	
	promises.push(new Promise ((resolve, reject) => {
		node_1.query(`SELECT * FROM logs`, async function(err, result) {
			if (err) {
			  console.log(err);
			  resolve();
			} else {
			  console.log("Reading Logs from Node 1");
		
			  const promises2 = [];
		
			  for (let log of result) {
				console.log(log.sql_statement);
				if (log.node == 2) {
				
					await new Promise((resolve, reject) => {
						node_2.query(log.sql_statement, function(err) {
							if (err) {
								console.log(err);
								resolve();
							} 
							else {
								node_1.query(`DELETE FROM logs WHERE idlogs=${log.idlogs}`, function(err) {
									if (err) {
										console.log(err);
										resolve();
									} 
									else {
										console.log('SUCCESSFULLY REMOVE LOG IN NODE 1');
										resolve();
									}
								});
							}
						});
				  	})
				} 

				else {

					await new Promise((resolve, reject) => {
						node_3.query(log.sql_statement, function(err) {
							if (err) {
								console.log(err);
								resolve();
							} 
							else {
								node_1.query(`DELETE FROM logs WHERE idlogs=${log.idlogs}`, function(err) {
									if (err) {
										console.log(err);
										resolve();
									} 
									else {
										console.log('SUCCESSFULLY REMOVE LOG IN NODE 1');
										resolve();
									}
								});
							}
						});
					})
				}
			  }
			  
			  resolve();
			}
		});
	}));

	promises.push(new Promise ((resolve, reject) => {
		node_2.query(`SELECT * FROM logs`, async function(err, result) {
			if (err) {
				console.log(err);
				resolve();
			} 
			else {
				console.log("Reading Logs from Node 2");
		
				for (let log of result) {
					await new Promise((resolve, reject) => {
						node_1.query(log.sql_statement, function(err) {
							if (err) {
								console.log(err);
								resolve();
							} 
							else {
								node_2.query(`DELETE FROM logs WHERE idlogs=${log.idlogs}`, function(err) {
									if (err) {
										console.log(err);
										resolve();
									} 
									else {
										console.log('SUCCESSFULLY REMOVE LOG IN NODE 2');
										resolve();
									}
								});
							}
						});
					})
				}
				resolve();
			}	
		});
	}));

	Promise.all(promises)
		.then(() => {
			loadpage();
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('An error occurred');
		});
})

app.get('/', async (req, res) => {
	console.log("@/");
	res.redirect('/1');
});

app.get('/:page', (req, res) => {
	console.log("@/:page");
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
	
    // Start Transaction
	node_1.query('START TRANSACTION', function(err){
		if(err){
			// Start Transaction Node 2
			console.log('NODE 2 transaction started.');
			node_2.query('START TRANSACTION', function(err){
				if(err){
					console.error('Error querying node_2 MySQL database: ' + err.stack);
					res.status(500).send('Error querying MySQL database');
					return;
				}
				else{
					node_2.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, result) => {
						if (err) {
							node_2.query('ROLLBACK', function() {
								console.log('NODE 2 transaction rolled back.');
								throw err;
							});
						}
						else{
							var totalRecords = result[0].total;
							// Calculate the total number of pages
							var totalPages = Math.ceil(totalRecords / recordsPerPage);
							var node_2_total_pages = totalPages;
							// Start Transaction Node 3
							console.log('NODE 3 transaction started.');
							node_3.query('START TRANSACTION', function(err){
								if (err){
									node_2.query('ROLLBACK', function() {
										console.log('NODE 2 transaction rolled back.');
										console.error('Error querying node_3 MySQL database: ' + err.stack);
										res.status(500).send('Error querying MySQL database');
									});
									
								}
								else{
									// Retrieve the data for the current page
									node_3.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, data) => {
										if (err){
											node_2.query('ROLLBACK', function() {
												console.log('NODE 2 transaction rolled back.');
												console.error('Error querying node_3 MySQL database: ' + err.stack);
												res.status(500).send('Error querying MySQL database');
											});
										}
										else{
											node_2.query('COMMIT', function(err){
												if(err){
													node_2.query('ROLLBACK', function() {
														console.log('NODE 2 transaction rolled back.');
														node_3.query('ROLLBACK', function() {
															console.log('NODE 3 transaction rolled back.');
														});
													  throw err;
													});
												}
												else{
													node_3.query('COMMIT', function(err){
														if(err){
															node_3.query('ROLLBACK', function() {
																console.log('NODE 3 transaction rolled back.');
																
															  throw err;
															});
														}
														else{
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
														}
													})
												}
											});
										}
										
										
									});
								}
							});
						}
						
						
						
					});
				}
			});
		}
		else{
			console.log('NODE 1 transaction started.');
			node_1.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, async(err, result) => {
				if (err){
					node_1.query('ROLLBACK', function() {
						console.log('NODE 1 transaction rolled back.');
						throw err;
					});
				}
				else{
					//Sleep
					// console.log("SLEEP 8 seconds");
					// await delay();
					//Commit
					node_1.query('COMMIT', function(err){
						if(err){
							node_1.query('ROLLBACK', function() {
								console.log('NODE 1 transaction rolled back.');
								throw err;
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
				}
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

	// Start Transaction
	node_1.query('START TRANSACTION', function(err){
		if(err){
			// Start Transaction Node 2
			console.log('NODE 2 transaction started.');
			node_2.query('START TRANSACTION', function(err){
				if(err){
					console.error('Error querying node_2 MySQL database: ' + err.stack);
					res.status(500).send('Error querying MySQL database');
					return;
				}
				else{
					node_2.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, result) => {
						if (err) {
							node_2.query('ROLLBACK', function() {
								console.log('NODE 2 transaction rolled back.');
								throw err;
							});
						}
						else{
							var totalRecords = result[0].total;
							// Calculate the total number of pages
							var totalPages = Math.ceil(totalRecords / recordsPerPage);
							var node_2_total_pages = totalPages;
							// Start Transaction Node 3
							console.log('NODE 3 transaction started.');
							node_3.query('START TRANSACTION', function(err){
								if (err){
									node_2.query('ROLLBACK', function() {
										console.log('NODE 2 transaction rolled back.');
										console.error('Error querying node_3 MySQL database: ' + err.stack);
										res.status(500).send('Error querying MySQL database');
									});
									
								}
								else{
									// Retrieve the data for the current page
									node_3.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, (err, data) => {
										if (err){
											node_2.query('ROLLBACK', function() {
												console.log('NODE 2 transaction rolled back.');
												console.error('Error querying node_3 MySQL database: ' + err.stack);
												res.status(500).send('Error querying MySQL database');
											});
										}
										else{
											node_2.query('COMMIT', function(err){
												if(err){
													node_2.query('ROLLBACK', function() {
														console.log('NODE 2 transaction rolled back.');
														node_3.query('ROLLBACK', function() {
															console.log('NODE 3 transaction rolled back.');
														});
													  throw err;
													});
												}
												else{
													node_3.query('COMMIT', function(err){
														if(err){
															node_3.query('ROLLBACK', function() {
																console.log('NODE 3 transaction rolled back.');
																
															  throw err;
															});
														}
														else{
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
														}
													})
												}
											});
										}
										
										
									});
								}
							});
						}
						
						
						
					});
				}
			});
		}
		else{
			console.log('NODE 1 transaction started.');
			node_1.query(`SELECT COUNT(*) AS total FROM movies WHERE ${filter_attribute} ${filter_operator} ${filter_input}`, async(err, result) => {
				if (err){
					node_1.query('ROLLBACK', function() {
						console.log('NODE 1 transaction rolled back.');
						throw err;
					});
				}
				else{
					// //Sleep
					// console.log("SLEEP 8 seconds");
					// await delay();
					//Commit
					node_1.query('COMMIT', function(err){
						if(err){
							node_1.query('ROLLBACK', function() {
								console.log('NODE 1 transaction rolled back.');
								throw err;
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
				}
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

	// Start Transaction
	node_1.query('START TRANSACTION', function(err){
		if(err){
			// Start Transaction Node 2
			console.log('NODE 2 transaction started.');
			node_2.query('START TRANSACTION', function(err){
				if(err) {
					console.error('Error querying node_2 MySQL database: ' + err.stack);
					res.status(500).send('Error querying MySQL database');
					return;
				}
				else{
					// Retrieve the data for the current page
					node_2.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, result) => {
						if (err) {
							node_2.query('ROLLBACK', function() {
								console.log('NODE 2 transaction rolled back.');
								throw err;
							});
						}
						else{
							var totalRecords = result[0].total;
							// Calculate the total number of pages
							var totalPages = Math.ceil(totalRecords / recordsPerPage);
							var node_2_total_pages = totalPages;

							// Start transaction Node 3
							console.log('NODE 3 transaction started.');
							node_3.query('START TRANSACTION', function(err){
								if (err){
									node_2.query('ROLLBACK', function() {
										console.log('NODE 2 transaction rolled back.');
										console.error('Error querying node_3 MySQL database: ' + err.stack);
										res.status(500).send('Error querying MySQL database');
									});
									
								}
								else{
									// Retrieve the data for the current page
									node_3.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, data) => {
										if (err) {
											node_2.query('ROLLBACK', function() {
												console.log('NODE 2 transaction rolled back.');
												node_3.query('ROLLBACK', function() {
													console.log('NODE 3 transaction rolled back.');
												});
											  throw err;
											});
										}
										else{
											node_2.query('COMMIT', function(err){
												if(err){
													node_2.query('ROLLBACK', function() {
														console.log('NODE 2 transaction rolled back.');
														node_3.query('ROLLBACK', function() {
															console.log('NODE 3 transaction rolled back.');
														});
													  throw err;
													});
												}
												else{
													node_3.query('COMMIT', function(err){
														if(err){
															node_3.query('ROLLBACK', function() {
																console.log('NODE 3 transaction rolled back.');
																
															  throw err;
															});
														}
														else{
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
														}
													})
												}
											});
											
										}
										
										
									});
								}
							});
							
						}
						
						
					});
				}
			});
		}
		else{
			console.log('NODE 1 transaction started.');
			node_1.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, async (err, result) => {
				if (err){
					node_1.query('ROLLBACK', function() {
						console.log('NODE 1 transaction rolled back.');
						throw err;
					});
				}
				else{
					//Sleep
					// console.log("SLEEP 8 seconds");
					// await delay();
					node_1.query('COMMIT', function(err){
						if(err){
							node_1.query('ROLLBACK', function() {
								console.log('NODE 1 transaction rolled back.');
								throw err;
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
					
				}
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

	// Start Transaction
	node_1.query('START TRANSACTION', function(err){
		if(err){
			// Start Transaction Node 2
			console.log('NODE 2 transaction started.');
			node_2.query('START TRANSACTION', function(err){
				if(err) {
					console.error('Error querying node_2 MySQL database: ' + err.stack);
					res.status(500).send('Error querying MySQL database');
					return;
				}
				else{
					// Retrieve the data for the current page
					node_2.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, result) => {
						if (err) {
							node_2.query('ROLLBACK', function() {
								console.log('NODE 2 transaction rolled back.');
								throw err;
							});
						}
						else{
							var totalRecords = result[0].total;
							// Calculate the total number of pages
							var totalPages = Math.ceil(totalRecords / recordsPerPage);
							var node_2_total_pages = totalPages;

							// Start transaction Node 3
							console.log('NODE 3 transaction started.');
							node_3.query('START TRANSACTION', function(err){
								if (err){
									node_2.query('ROLLBACK', function() {
										console.log('NODE 2 transaction rolled back.');
										console.error('Error querying node_3 MySQL database: ' + err.stack);
										res.status(500).send('Error querying MySQL database');
									});
									
								}
								else{
									// Retrieve the data for the current page
									node_3.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, (err, data) => {
										if (err) {
											node_2.query('ROLLBACK', function() {
												console.log('NODE 2 transaction rolled back.');
												node_3.query('ROLLBACK', function() {
													console.log('NODE 3 transaction rolled back.');
												});
											  throw err;
											});
										}
										else{
											node_2.query('COMMIT', function(err){
												if(err){
													node_2.query('ROLLBACK', function() {
														console.log('NODE 2 transaction rolled back.');
														node_3.query('ROLLBACK', function() {
															console.log('NODE 3 transaction rolled back.');
														});
													  throw err;
													});
												}
												else{
													node_3.query('COMMIT', function(err){
														if(err){
															node_3.query('ROLLBACK', function() {
																console.log('NODE 3 transaction rolled back.');
																
															  throw err;
															});
														}
														else{
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
														}
													})
												}
											});
											
										}
										
										
									});
								}
							});
							
						}
						
						
					});
				}
			});
		}
		else{
			console.log('NODE 1 transaction started.');
			node_1.query(`SELECT COUNT(*) AS total FROM movies WHERE ${search_attribute} LIKE "%${search_input}%" ORDER BY ${search_attribute}`, async(err, result) => {
				if (err){
					node_1.query('ROLLBACK', function() {
						console.log('NODE 1 transaction rolled back.');
						throw err;
					});
				}
				else{
					//Sleep
					// console.log("SLEEP 8 seconds");
					// await delay();
					node_1.query('COMMIT', function(err){
						if(err){
							node_1.query('ROLLBACK', function() {
								console.log('NODE 1 transaction rolled back.');
								throw err;
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
					
				}
			});
		}
	});
    
});


app.post('/insert', (req, res) => {
	const movie = req.body;
	node_1.query('START TRANSACTION', function(err) {
		if (err) {
			node_2.query(`SELECT max(id) + 1 AS new FROM movies`, (err, resp) => {
				if (err) {
					throw err;
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
							const log_statement = `INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name) VALUES (${max}, \"${movie.name}\", ${movie.year}, COALESCE(NULLIF(\"${movie.rank}\", ''), NULL), COALESCE(NULLIF(\"${movie.genre}\", ''), NULL), COALESCE(NULLIF(\"${movie.director_first_name}\", ''), NULL), COALESCE(NULLIF(\"${movie.director_last_name}\", ''), NULL))`;
							if(movie.year >= 1980){
								node_3.query('START TRANSACTION', function(err) {
									if (err) {
										console.error('Error querying MySQL database: ' + err.stack);
										res.status(500).send('Error querying MySQL database');
										return;
									}
									else {
										node_3.query(statement, values, (err, results) => {
											if (err) {
												console.error('Error querying MySQL database: ' + err.stack);
												res.status(500).send('Error querying MySQL database');
												return;
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
														
														console.log('NODE 3 transaction completed successfully.');
														console.log('Successfully inserted data with id: ' + max);
														
														node_2.query(`INSERT INTO logs (sql_statement, node) VALUES (?,?)`, [log_statement, 1], function(err){
															if (err) throw err;
															console.log('Added log to Node 2');
														});
														
														res.redirect('/');
													}
												  });
											}
										})
									}
								})
							}
							else{
								node_2.query('START TRANSACTION', function(err) {
									if (err) {
										throw err;
									}
									else {
										node_2.query(statement, values, (err, results) => {
											if (err) {
												console.error('Error querying MySQL database: ' + err.stack);
												res.status(500).send('Error querying MySQL database');
												return;
											}
											else {
												node_2.query('COMMIT', function(err) {
													if (err) {
														node_2.query('ROLLBACK', function() {
															console.log('NODE 2 transaction rolled back.');
															throw err;
														  });
													}
													else {
														console.log('NODE 2 transaction completed successfully.');
														console.log('Successfully inserted data with id: ' + max);

														node_2.query(`INSERT INTO logs (sql_statement, node) VALUES (?,?)`, [log_statement, 1], function(err){
															if (err) throw err;
															console.log('Added log to Node 2');
														});
														

														res.redirect('/');
													}
												  });
											}
										})
									}
								})
							}

						}

					})
				}
			});


		}
		else {
			// ---------------------------------------------------------
			console.log('NODE 1 transaction started.');
			node_1.query(`SELECT max(id) + 1 AS new FROM movies`, (err, resp) => {
				if (err) {
					node_1.query('ROLLBACK', function() {
						console.log('NODE 1 transaction rolled back.');
					  throw err;
					});
				}
				else {
					new_id = resp[0].new;
					console.log("new_id: " + new_id);
					
					const values = [new_id, movie.name, movie.year, movie.rank, movie.genre, movie.director_first_name, movie.director_last_name];


					const statement = `INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name) VALUES (?, ?, ?, COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL), COALESCE(NULLIF(?, ''), NULL))`;
					const log_statement = `INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name) VALUES (${new_id}, \"${movie.name}\", ${movie.year}, COALESCE(NULLIF(\"${movie.rank}\", ''), NULL), COALESCE(NULLIF(\"${movie.genre}\", ''), NULL), COALESCE(NULLIF(\"${movie.director_first_name}\", ''), NULL), COALESCE(NULLIF(\"${movie.director_last_name}\", ''), NULL))`;
					node_1.query(statement, values, async (err, results) => {
						if (err) {
							node_1.query('ROLLBACK', function() {
								console.log('NODE 1 transaction rolled back.');
							  	throw err;
							});
						}
						else {
							//Sleep
							// console.log("SLEEP 8 seconds");
							// await delay();
							node_1.query('COMMIT', function(err) {
								if (err) {
									node_1.query('ROLLBACK', function() {
										console.log('NODE 1 transaction rolled back.');
										throw err;
									  });
								}
								else {
									console.log('NODE 1 transaction completed successfully.');
									console.log('Successfully inserted data with id: ' + new_id);


									//INSERT IN EITHER NODE 2 OR NODE 3
									if (movie.year < 1980) {
										node_2.query(statement, values, (err, results) => {
											if (err){
												console.log('Error inserting to node 2');
												
												node_1.query(`INSERT INTO logs (sql_statement, node) VALUES (?, ?)`, [log_statement, 2], function(err){
													if (err) throw err;
													console.log('Added log to Node 1');
												});
											}
											else{
												console.log('Replicated to Slave Nodes');
											}
										})
									}
									else {
										node_3.query(statement, values, (err, results) => {
											if (err){
												console.log('Error inserting to node 3');
												node_1.query(`INSERT INTO logs (sql_statement, node) VALUES (?, ?)`, [log_statement, 3], function(err){
													if (err) throw err;
													console.log('Added log to Node 1');
												});
											}
											else {
												console.log('Replicated to Slave Nodes');
											}
										})
									}
									res.redirect('/');
								}
							  });
						}
					})
				}
			});
		}
	})
	
});

app.post('/update', (req, res) => {

	const movie = req.body;
	const statement = `UPDATE movies SET name = COALESCE(NULLIF(?, ''), name), year = COALESCE(NULLIF(?, ''), year), \`rank\` = COALESCE(NULLIF(?, ''), \`rank\`), genre = COALESCE(NULLIF(?, ''), genre), director_first_name = COALESCE(NULLIF(?, ''), director_first_name), director_last_name = COALESCE(NULLIF(?, ''), director_last_name) WHERE id = ?`;
	const values = [movie.update_name, movie.update_year, movie.update_rank, movie.update_genre, movie.update_director_first_name, movie.update_director_last_name, movie.update_id];
	const move_values = [movie.update_id, movie.update_name, movie.update_year, movie.update_rank, movie.update_genre, movie.update_director_first_name, movie.update_director_last_name];
	const delete_statement = `DELETE FROM movies WHERE id = ?`
	const insert_statement = `INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name)
							  VALUES (?, ?, ?, COALESCE(NULLIF(?, ''), \`rank\`), ?, ?, ?)
							  ON DUPLICATE KEY UPDATE 
							  name = COALESCE(NULLIF(VALUES(name), ''), name), year = COALESCE(NULLIF(VALUES(year), ''), year), \`rank\` = VALUES(\`rank\`), genre = COALESCE(NULLIF(VALUES(genre), ''), genre), director_first_name = COALESCE(NULLIF(VALUES(director_first_name), ''), director_first_name), director_last_name = COALESCE(NULLIF(VALUES(director_last_name), ''), director_last_name)`;
	const log_delete_statement = `DELETE FROM movies WHERE id = ${movie.update_id}`
	const log_insert_statement = `INSERT INTO movies (id, name, year, \`rank\`, genre, director_first_name, director_last_name)
								  VALUES (${movie.update_id}, \"${movie.update_name}\", ${movie.update_year}, COALESCE(NULLIF(\"${movie.update_rank}\", ''), \`rank\`), \"${movie.update_genre}\", \"${movie.update_director_first_name}\", \"${movie.update_director_last_name}\")
								  ON DUPLICATE KEY UPDATE 
								  name = COALESCE(NULLIF(VALUES(name), ''), name), year = COALESCE(NULLIF(VALUES(year), ''), year), \`rank\` = VALUES(\`rank\`), genre = COALESCE(NULLIF(VALUES(genre), ''), genre), director_first_name = COALESCE(NULLIF(VALUES(director_first_name), ''), director_first_name), director_last_name = COALESCE(NULLIF(VALUES(director_last_name), ''), director_last_name)`;
	const log_update_statement = `UPDATE movies SET name = COALESCE(NULLIF(\"${movie.update_name}\", ''), name), year = COALESCE(NULLIF(${movie.update_year}, ''), year), \`rank\` = COALESCE(NULLIF(\"${movie.update_rank}\", ''), \`rank\`), genre = COALESCE(NULLIF(\"${movie.update_genre}\", ''), genre), director_first_name = COALESCE(NULLIF(\"${movie.update_director_first_name}\", ''), director_first_name), director_last_name = COALESCE(NULLIF(\"${movie.update_director_last_name}\", ''), director_last_name) WHERE id = ${movie.update_id}`
	if(movie.update_id == ''){
		res.redirect('/');
	}
	else{
		node_1.query('START TRANSACTION', function(err) {
			if (err) {
				if (movie.update_year < 1980) {
					console.log('NODE 2 transaction started.');
					node_2.query('START TRANSACTION', function(err) {
						if (err) {
							node_2.query('ROLLBACK', function() {
								console.log('NODE 2 transaction rolled back.');
							  throw err;
							});
						}
						else {
							node_3.query('START TRANSACTION', function(err){
								if (err){
									node_2.query('ROLLBACK', function() {
										console.log('NODE 2 transaction rolled back.');
									  throw err;
									});
								}
								else{
									node_3.query(delete_statement, movie.update_id, (err, results) => {
										if (err) {
											node_2.query('ROLLBACK', function() {
												console.log('NODE 2 transaction rolled back.');
												node_3.query('ROLLBACK', function() {
													console.log('NODE 3 transaction rolled back.');
												});
												throw err;
											});
										}
										else {
											node_3.query("COMMIT", function(err){
												if(err){
													node_2.query('ROLLBACK', function() {
														console.log('NODE 2 transaction rolled back.');
														node_3.query('ROLLBACK', function() {
															console.log('NODE 3 transaction rolled back.');
														});
														throw err;
													});
												}
												else{
													node_2.query(insert_statement, move_values, function(err) {
														if (err) {
															node_2.query('ROLLBACK', function() {
																console.log('NODE 2 transaction rolled back.');
																throw err;
															});
														}
														else {
															node_2.query("COMMIT",  function(err){
																if(err) {
																	node_2.query('ROLLBACK', function() {
																		console.log('NODE 2 transaction rolled back.');
																		throw err;
																	});
																}
																else{
																	console.log('NODE 2 transaction completed successfully.');
																	console.log('Successfully updated data with id: ' + movie.update_id);
						
																	node_2.query(`INSERT INTO logs (sql_statement, node) VALUES (?, ?)`, [log_update_statement, 1], function(err){
																		if(err) throw err;
																		console.log('Added log to Node 2');
																	});
						
																	res.redirect('/');
																}
															});
															
														}
													});			
												}
											});
											
										}
									})
								}
							});
							
						}
					})
				}
				else {
					console.log('NODE 3 transaction started.');
					node_3.query('START TRANSACTION', function(err) {
						if (err) {
							node_3.query('ROLLBACK', function() {
								console.log('NODE 2 transaction rolled back.');
							  throw err;
							});
						}
						else {
							node_2.query('START TRANSACTION', function(err){
								if (err){
									node_3.query('ROLLBACK', function() {
										console.log('NODE 2 transaction rolled back.');
									  throw err;
									});
								}
								else{
									node_2.query(delete_statement, movie.update_id, (err, results) => {
										if (err) {
											node_3.query('ROLLBACK', function() {
												console.log('NODE 2 transaction rolled back.');
												node_2.query('ROLLBACK', function() {
													console.log('NODE 3 transaction rolled back.');
												});
												throw err;
											});
										}
										else {
											node_2.query("COMMIT", function(err){
												if(err){
													node_3.query('ROLLBACK', function() {
														console.log('NODE 2 transaction rolled back.');
														node_2.query('ROLLBACK', function() {
															console.log('NODE 3 transaction rolled back.');
														});
														throw err;
													});
												}
												else{
													node_3.query(insert_statement, move_values, function(err) {
														if (err) {
															node_3.query('ROLLBACK', function() {
																console.log('NODE 2 transaction rolled back.');
																throw err;
															});
														}
														else {
															node_3.query("COMMIT",  function(err){
																if(err) {
																	node_3.query('ROLLBACK', function() {
																		console.log('NODE 2 transaction rolled back.');
																		throw err;
																	});
																}
																else{
																	console.log('NODE 2 transaction completed successfully.');
																	console.log('Successfully updated data with id: ' + movie.update_id);
						
																	node_2.query(`INSERT INTO logs (sql_statement, node) VALUES (?, ?)`, [log_update_statement, 1], function(err){
																		if(err) throw err;
																		console.log('Added log to Node 2');
																	});
						
																	res.redirect('/');
																}
															});
															
														}
													});			
												}
											});
											
										}
									})
								}
							});
							
						}
					})
				}
			}
			else {
				// ---------------------------------------------------------
				console.log('NODE 1 transaction started.');
				node_1.query(statement, values, async(err, results) => {
					if (err) {
						node_1.query('ROLLBACK', function() {
							console.log('NODE 1 transaction rolled back.');
						  throw err;
						});
					}
					else {
						//Sleep
						// console.log("SLEEP 8 seconds");
						// await delay();
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
								
								//UPDATE IN EITHER NODE 2 OR NODE 3
								if (movie.update_year < 1980) {
									node_3.query(delete_statement, movie.update_id, (err, results) => {
										if (err) {
											console.log('Error delete statement in Node 3');
											node_1.query(`INSERT INTO logs (sql_statement, node) VALUES (?, ?)`, [log_delete_statement, 3], function(err){
												if (err) throw err;
												console.log('Added delete log to Node 1');
											});
										}
									})
									node_2.query(insert_statement, move_values, (err, results) => {
										if (err) {
											console.log('Error insert statement in Node 2');
											node_1.query(`INSERT INTO logs (sql_statement, node) VALUES (?, ?)`, [log_insert_statement, 2], function(err){
												if (err) throw err;
												console.log('Added update log to Node 1');
											});
										}
									})
									console.log("Updated Slave Nodes");

								}
								else if (movie.update_year >= 1980) {
									node_2.query(delete_statement, movie.update_id, (err, results) => {
										if (err) {
											console.log('Error delete statement in Node 3');
											node_1.query(`INSERT INTO logs (sql_statement, node) VALUES (?, ?)`, [log_delete_statement, 2], function(err){
												if (err) throw err;
												console.log('Added delete log to Node 1');
											});
										}

									})
									node_3.query(insert_statement, move_values, (err, results) => {
										if (err) {
											console.log('Error delete statement in Node 3');
											node_1.query(`INSERT INTO logs (sql_statement, node) VALUES (?, ?)`, [log_insert_statement, 3], function(err){
												if (err) throw err;
												console.log('Added delete log to Node 1');
											});
										}
									})

									console.log("Updated Slave Nodes");
								}
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
	const values = [movie.id];
	const statement = `DELETE FROM movies WHERE id = ?`;
	const log_statement = `DELETE FROM movies WHERE id = ${movie.id}`
	

	node_1.query('START TRANSACTION', function(err) {
		if (err) {
			if (movie.year < 1980) {
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
								node_2.query('ROLLBACK', function() {
									console.log('NODE 2 transaction rolled back.');
									throw err;
								});
							}
							else {
								node_2.query('COMMIT', function(err) {
									if (err) {
										node_2.query('ROLLBACK', function() {
											console.log('NODE 2 transaction rolled back.');
											throw err;
										  });
									}
									else {
										console.log('NODE 2 transaction completed successfully.');
										console.log('Successfully deleted data with id: ' + movie.id);

										node_2.query(`INSERT INTO logs (sql_statement, node) VALUES (?,?)`, [log_statement, 1], function(err){
											if (err) throw err;
											console.log('Added log to Node 2');
										});

										res.status(200).send();
										return;
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
										console.log('NODE 3 transaction completed successfully.');
										console.log('Successfully deleted data with id: ' + movie.id);

										node_2.query(`INSERT INTO logs (sql_statement, node) VALUES (?,?)`, [log_statement, 1], function(err){
											if (err) throw err;
											console.log('Added log to Node 2');
										});
										res.status(200).send();
										return;
									}
								  });
							}
						})
					}
				})
			}
		}
		else {
			// Node 1
			node_1.query(statement, values, async (err, rows, fields) => {
				if (err) {
					node_1.query('ROLLBACK', function() {
						console.log('NODE 1 transaction rolled back.');
						throw err;
					});
				}
				else {
					//Sleep
					// console.log("SLEEP 8 seconds");
					// await delay();
					//Commit
					node_1.query('COMMIT', function(err) {
						if (err) {
							node_1.query('ROLLBACK', function() {
								console.log('NODE 1 transaction rolled back.');
								throw err;
							  });
						}
						else {
							console.log('NODE 1 transaction completed successfully.');
							console.log('Successfully deleted data with id: ' + movie.id);
							if (movie.year < 1980) {
								node_2.query(statement, values, (err, results) => {
									if (err){
										console.log('Error deleting in node 2');
										node_1.query(`INSERT INTO logs (sql_statement, node) VALUES (?,?)`, [log_statement, 2], function(err){
											if (err) throw err;
											console.log('Added log to Node 2');
										});
									}
									else {
										console.log('Replicated to Slave Nodes');
									}
								})
							}
							else {
								node_3.query(statement, values, (err, results) => {
									if (err){
										console.log('Error deleting in node 3');
										node_1.query(`INSERT INTO logs (sql_statement, node) VALUES (?,?)`, [log_statement, 3], function(err){
											if (err) throw err;
											console.log('Added log to Node 3');
										});
									}
									else {
										console.log('Replicated to Slave Nodes');
									}
								})
							}
							res.status(200).send();
							return;
						}
					  });
				}
			});
		}
	})
});

app.listen(80, () => {
 	console.log('Node.js server running on port 80');
});
