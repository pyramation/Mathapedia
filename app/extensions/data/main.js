define(['sandbox', 'async'], function(sandbox, async) {

	var Data = {};

		Data.Book = sandbox.mvc.Model({
			url: function() {
				if (this.id) return '/api/books/' + this.id;
				else return '/api/books';
			}
		});
		
		Data.Section = sandbox.mvc.Model({
			url: function() {
				// return '/api/books/' + this.options.book_id + '/sections/' + this.id;
				return '/api/sections/' + this.id;

			}
		});

		Data.Content = sandbox.mvc.Model({
			url: function() {
				return '/api/contents/' + this.id;
			}
		});

		Data.Contents = sandbox.mvc.Collection({
			model: Data.Content
		});

		Data.Subsections = sandbox.mvc.Collection({
			model: Data.Section
			// url set in router? 
		});

		Data.TableOfContents = sandbox.mvc.Collection({
			model: Data.Section,
			url: function() {
				if (this.id) return '/api/books/' + this.id + '/toc'
				else return '/api/books';
			}
		});

		Data.Sections = sandbox.mvc.Collection({
			model: Data.Section,
			url: function() {
				if (this.id) return '/api/books/' + this.id + '/sections'
				else return '/api/books';
			}
		});

		Data.Books = sandbox.mvc.Collection({
			// model: function() {

			// 	if (this.id) return Data.Section;
			// 	else return Data.Book;

			// },
			model: Data.Book,
			url: function() {
				if (this.id) return '/api/books/' + this.id;
				else return '/api/books';
			}
		});

	window.Data = Data;

	return Data;
});