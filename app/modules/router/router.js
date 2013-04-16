define(['sandbox', 'async', 'app-data'], function(sandbox, async, Data) {

  function getAuth() {
    return function (callback) {
      $.get('/api/authenticated', function(data) {
          callback(null, data);    
      });
    };
  }

  function getSketch(sketch_id) {
    return function(callback) {
      var sketch = new Data.Sketch();
      sketch.id = sketch_id;
      sketch.fetch({
        success: function(data, resp) {
            callback(null, data);
        }
      });
    };
  }


  function getBookSections(book_id) {
    return function(callback) {
      var book = new Data.TableOfContents();
      book.id = book_id;
      book.fetch({
        success: function(collection, resp) {
            callback(null, collection);
        }
      });
    };
  }

  function getBooks() {
    return function(callback) {
      var fn = new Data.Books().fetch({
        success: function(collection, resp) {
            callback(null, collection);
        }
      });
    };
  }

  function getBook(book_id) {
    return function(callback) {
      var book = new Data.Book();
      book.id = book_id;
      book.fetch({
        success: function(collection, resp) {
            callback(null, collection);
        }
      });
    };
  }

  function getSection(section_id) {
    return function(callback) {
      var s = new Data.Section();
      s.id = section_id;
      s.fetch({
        success: function(collection, resp) {
            callback(null, collection);
        },
        error: function(e) {
          callback(e);
        }
      });
    };
  }

  function getContent(content_id) {
    return function(callback) {
      var s = new Data.Content();
      s.id = content_id;
      s.fetch({
        success: function(collection, resp) {
            callback(null, collection);
        },
        error: function(e) {
          callback(e);
        }
      });
    };
  }


  var Router = sandbox.mvc.Router({
    routes: {
      "": "index",

      "latex":"newsketch",
      "sketch/:sketch_id":"sketch",
      "sketch/:sketch_id/embed":"embed",
      "sketch/:sketch_id/edit":"editSketch",


      "about":"about",
      "auth":"auth",

      "books":"books",
      "books/:book_id":"book",
      "books/:book_id/edit":"editBook",

      "books/:book_id/sections/:section_id":"section",
      "books/:book_id/sections/:section_id/:content_id":"content",
      "books/:book_id/sections/:section_id/subsections/:subsection_id":"subsection",
      "books/:book_id/sections/:section_id/subsections/:subsection_id/:content_id":"subcontent",

      "books/:book_id/sections/:section_id/edit":"editSection",
      "books/:book_id/sections/:section_id/:content_id/edit":"editContent",
      "books/:book_id/sections/:section_id/subsections/:subsection_id/edit":"editSubsection",
      "books/:book_id/sections/:section_id/subsections/:subsection_id/:content_id/edit":"editSubcontent"

    
    },

    go: function(route, args) {


      try {
          _gaq.push(['_trackPageview',window.location.pathname]);
      } catch(e) {}


      var ags = ['render:' + route, 'router'];
      ags.push.apply(ags, args);
      //console.log(ags);
      sandbox.publish.apply({}, ags);
    },
    edit: function(route, args) {

      try {
          _gaq.push(['_trackPageview',window.location.pathname]);
      } catch(e) {}


      var ags = ['edit:' + route, 'router'];
      ags.push.apply(ags, args);
      //console.log(ags);
      sandbox.publish.apply({}, ags);
    },

    index: function() {
      this.go('home', arguments);
    },

    auth: function() {
      this.go('auth', arguments);
    },

    latex: function() {
      this.go('latex', arguments);
    },

    about: function() {
      this.go('about', arguments);
    },
    books: function() {
      var self = this;
      async.series({
        auth: getAuth(),
        books: getBooks()
      }, function results(err, res) {
          if (!err) {
            self.go('books', [res.auth, res.books]);
          }
      });

    },

    sketch: function(sketch_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sketch: getSketch(sketch_id)
      }, function results(err, res) {
        if (!err) {
          self.go('sketch', [res.auth, res.sketch]);
        }
      });

    },


    embed: function(sketch_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sketch: getSketch(sketch_id)
      }, function results(err, res) {
        if (!err) {
          self.go('embed', [res.auth, res.sketch]);
        }
      });

    },

    newsketch: function() {
      var self = this;
      async.series({
        auth: getAuth()
      }, function results(err, res) {
        if (!err) {
          self.edit('newsketch', [res.auth]);
        }
      });

    },
    editSketch: function(sketch_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sketch: getSketch(sketch_id)
      }, function results(err, res) {
        if (!err) {
          self.edit('sketch', [res.auth, res.sketch]);
        }
      });

    },


    book: function(book_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.go('book', [res.auth, res.sections, res.book]);
        }
      });

    },
    section: function(book_id, section_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        section: getSection(section_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.go('section', [res.auth, res.book, res.sections, res.section]);
        }
      });
    },
    content: function(book_id, section_id, content_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        section: getSection(section_id),
        content: getContent(content_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.go('content', [res.auth, res.book, res.sections, res.section, res.content]);
        }
      });
    },
    subsection: function(book_id, section_id, subsection_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        section: getSection(section_id),
        subsection: getSection(subsection_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.go('subsection', [res.auth, res.book, res.sections, res.section, res.subsection]);
        }
      });
    },
    subcontent: function(book_id, section_id, subsection_id, content_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        section: getSection(section_id),
        subsection: getSection(subsection_id),
        content: getContent(content_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.go('subcontent', [res.auth, res.book, res.sections, res.section, res.subsection, res.content]);
        }
      });
    },



    editBook: function(book_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.edit('book', [res.auth, res.sections, res.book]);
        }
      });

    },
    editSection: function(book_id, section_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        section: getSection(section_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.edit('section', [res.auth, res.book, res.sections, res.section]);
        }
      });
    },
    editContent: function(book_id, section_id, content_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        section: getSection(section_id),
        content: getContent(content_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.edit('content', [res.auth, res.book, res.sections, res.section, res.content]);
        }
      });
    },
    editSubsection: function(book_id, section_id, subsection_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        section: getSection(section_id),
        subsection: getSection(subsection_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.edit('subsection', [res.auth, res.book, res.sections, res.section, res.subsection]);
        }
      });
    },
    editSubcontent: function(book_id, section_id, subsection_id, content_id) {
      var self = this;
      async.series({
        auth: getAuth(),
        sections: getBookSections(book_id),
        section: getSection(section_id),
        subsection: getSection(subsection_id),
        content: getContent(content_id),
        book: getBook(book_id)
      }, function results(err, res) {
        if (!err) {
          self.edit('subcontent', [res.auth, res.book, res.sections, res.section, res.subsection, res.content]);
        }
      });
    }


  });

  return {

    start: function() {

      var router = new Router();

      Backbone.history.start({ pushState: true, root: '/' });

      $(document).on("click", "a:not([data-bypass])", function(evt) {

        var href = $(this).attr("href");

        if (href && href.match(/^http/)) {
          $(this).attr('target', '_blank');
        } else {
          evt.preventDefault();

          Backbone.history.navigate(href, true);          
        }

      });

    }

  };

});
