define(['sandbox', 'books-views/books', 'books-views/sections', 'books-views/contents'], function(sandbox, BookViews, SectionViews, Content) {

    var Books = sandbox.Module({

        start: function() {
            sandbox.subscribe('render:books', 'books', this.renderBooks, this);
            sandbox.subscribe('render:book', 'books', this.renderBook, this);
            sandbox.subscribe('render:section', 'books', this.renderSection, this);
            sandbox.subscribe('render:content', 'books', this.renderContent, this);
            sandbox.subscribe('render:subsection', 'books', this.renderSubsection, this);
            sandbox.subscribe('render:subcontent', 'books', this.renderSubcontent, this);
        },
        renderBooks: function(who, auth, books) {
            var v = new BookViews.Books({
                auth: auth,
            collection: books});
            sandbox.publish('render', 'books', v);
        },
        renderBook: function(who, auth, sections, book) {

            if ((
                book.get('public') ||
                _.indexOf(auth.write, book.id) !== -1) ||
                (_.indexOf(auth.read, book.id) !== -1)) {

                auth.can = (_.indexOf(auth.write, book.id) !== -1);

                var v = new SectionViews.BookSections({
                    auth: auth,
                    collection: sections,
                model: book});
                sandbox.publish('render', 'books', v);

            } else {
                Backbone.history.navigate('/auth', true);
            }



        },
        renderSection: function(who, auth, book, sections, section) {

             if ((
                book.get('public') ||
                _.indexOf(auth.write, book.id) !== -1) ||
                (_.indexOf(auth.read, book.id) !== -1)) {
            
                     auth.can = (_.indexOf(auth.write, book.id) !== -1);

                    var v = new Content.Section({
                        auth: auth,
                        book: book,
                        collection: sections,
                        section: section
                    });
                    sandbox.publish('render', 'books', v);

                } else {
                    Backbone.history.navigate('/auth', true);
                }

                
        },
        renderContent: function(who, auth, book, sections, section, content) {

            if ((
                book.get('public') ||
                _.indexOf(auth.write, book.id) !== -1) ||
                (_.indexOf(auth.read, book.id) !== -1)) {

                auth.can = (_.indexOf(auth.write, book.id) !== -1);

                var v = new Content.Content({
                    auth: auth,
                    book: book,
                    collection: sections,
                    section: section,
                    content: content
                });
                sandbox.publish('render', 'books', v);
            } else {
                Backbone.history.navigate('/auth', true);
            }

        },
        renderSubsection: function(who, auth, book, sections, section, subsection) {

              if ((
                 book.get('public') ||
                 _.indexOf(auth.write, book.id) !== -1) ||
                 (_.indexOf(auth.read, book.id) !== -1)) {

                   auth.can = (_.indexOf(auth.write, book.id) !== -1);

                    var v = new Content.Subsection({
                        auth: auth,
                        book: book,
                        collection: sections,
                        section: section,
                        subsection: subsection
                    });
                    sandbox.publish('render', 'books', v);
                } else {
                    Backbone.history.navigate('/auth', true);
                }

                
        },
        renderSubcontent: function(who, auth, book, sections, section, subsection, content) {

           if ((
                book.get('public') ||
                _.indexOf(auth.write, book.id) !== -1) ||
                (_.indexOf(auth.read, book.id) !== -1)) {

                auth.can = (_.indexOf(auth.write, book.id) !== -1);
      
                var v = new Content.Subcontent({
                    auth: auth,
                    book: book,
                    collection: sections,
                    section: section,
                    subsection: subsection,
                    content: content
                });
                sandbox.publish('render', 'books', v);
            } else {
                Backbone.history.navigate('/auth', true);
            }
        }

    });

    return {
        start: function() {
            var books = new Books();
            books.start();
        }
    };

});
