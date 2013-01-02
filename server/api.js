module.exports = function(app, routes) {

	var middleWare = function(req, res, next) {
	  req.models = app.schema.models;
	  req.schema = app.schema;
	  next();
	};

	// validate that ids are numeric
	app.param('id', Number);
	app.param('section_id', Number);
	app.param('subsection_id', Number);
	app.param('book_id', Number);

	app.post('/sketch', middleWare, routes.api['contents'].SKETCH); // read
	app.get('/sketch', middleWare, routes.api['contents'].RANDOM); // read


	app.get('/api/contents', middleWare, routes.api['contents'].GET); // read
	app.get('/api/contents/:id', middleWare, routes.api['contents'].GET); // read
	app.put('/api/contents/:id', middleWare, routes.api['contents'].PUT); 


	// book
	app.post('/api/books', middleWare, routes.api['books'].CREATE);
	app.post('/api/books/:id/rename', middleWare, routes.api['books'].RENAME);
	app.post('/api/books/:id/public', middleWare, routes.api['books'].PUBLIC);

	app.post('/api/books/:id', middleWare, routes.api['sections'].CREATE);
	app.post('/api/books/:id/:section_id/rename', middleWare, routes.api['sections'].RENAME);
	app.post('/api/books/:id/:section_id', middleWare, routes.api['sections'].PROCREATE);
	app.post('/api/books/:id/:section_id/content', middleWare, routes.api['contents'].CREATE);
	app.post('/api/books/:id/:section_id/:subsection_id/content', middleWare, routes.api['contents'].PROCREATE);
	app.post('/api/books/:id/:section_id/:subsection_id/rename', middleWare, routes.api['sections'].SUBNAME);


	// references
	app.post('/api/books/:id/ref', middleWare, routes.api['books'].REF); // read
	app.get('/books/:id/bib', middleWare, routes.api['books'].REFS); // read


	app.get('/api/books', middleWare, routes.api['books'].INDEX); // read
	app.get('/api/books/:id', middleWare, routes.api['books'].GET); // read
	app.get('/api/books/:id/toc', middleWare, routes.api['books'].TOC); // read
	app.get('/api/books/:id/sections', middleWare, routes.api['books'].SECTIONS); // read
	app.get('/api/books/:id/sections/:section_id/subsections', middleWare, routes.api['books'].CHILDREN); // read
	app.get('/api/books/:id/sections/:section_id', middleWare, routes.api['sections'].CONTENT); // read
	app.get('/api/books/:id/sections/:section_id/content', middleWare, routes.api['sections'].CONTENT); // read
	app.get('/api/sections/:section_id/content', middleWare, routes.api['sections'].CONTENT); // read
	app.get('/api/sections/:section_id', middleWare, routes.api['sections'].CONTENT); // read

	app.get('/api/authenticated', function (req, res) {

		if (req.session.user) {
			res.send({
				data: true,
				author: req.session.user.author,
				user_id: req.session.user.id,
				read: req.session.user.read,
				write: req.session.user.write
			});
		} else {
			res.send({
				data: false,
				author: false,
				user_id: 0,
				read: [],
				write: []
			})
		}

	});

	app.get('/references/:book_id/:reference', middleWare, routes.api['books'].REFERENCE);

	app.get('/books/:id/tex', middleWare, routes.api['sections'].TEX);


};