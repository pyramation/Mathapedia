
/*
* GET page request.
*/

var async = require('async');
var crypto = require('crypto');

/*
* GET api
*/

function filterContent (content) {

    var lines = content.split('\n');

    var c = [];
    var push = true;
    _.each(lines, function(line) {
        if (line.match(/\\begin\{interactive\}/)) push = false;
        if (push) {
            if (!line.match(/\\begin\{print\}/) && !line.match(/\\end\{print\}/)) {
                if (line.match(/\\begin\{nicebox\}/)) c.push('\\bx{');
                else if (line.match(/\\end\{nicebox\}/)) c.push('}');
                else c.push(line);
            }
        }

        if (line.match(/\\end\{interactive\}/)) push = true;
    });

    return c.join('\n');
}

var s = function(req, res) {
    return function(err, inst) {
        if (err) {
            res.send(err.message, 500);
        } else if (inst) {
            res.send(inst);
        } else {
            res.send(404);
        }
    };
};

var getAll = function(m) {
    return function(req, res) {
        var id = req.params.id;
        var Model = req.models[m];

        if (id) {
            Model.find(id, s(req, res));
        } else {
            Model.all(s(req, res));
        }

    };
};

var get = function(m) {
    return function(req, res) {
        var id = req.params.id;
        var Model = req.models[m];

        if (id) {
            Model.find(id, s(req, res));
        } else {
            res.send(404);
        }

    };
};

var _ = require('underscore');

_.exclude = function(obj) {
    var blacklist = _.flatten([].slice.call(arguments, 1));
    return _.pick(obj, _.difference(_.keys(obj), blacklist));
};

exports.api = {

    books: {
        INDEX: function (req, res) {

            var Book = req.models['Book'];
            var Authorship = req.models['Authorship'];
            var Readership = req.models['Readership'];

            if (!req.session.user) {
                return Book.all({where: {public: true}}, s(req, res));
            }

             async.series({
                read: function (callback) {
                    Book.all({
                          join: {
                            Readership: {
                                assoc: true,
                                where: {
                                    user_id: req.session.user.id
                                }
                            }
                           },
                           where: {
                            public: false
                           }
                    }, callback);
                },
                write: function (callback) {
                    Book.all({
                          join: {
                            Authorship: {
                                assoc: true,
                                where: {
                                    user_id: req.session.user.id
                                }
                            }
                        },
                        where: {
                           public: false
                        }
                    }, callback);
                },
                publ: function (callback) {
                    Book.all({where: {public: true}}, callback);
                }
            
            }, function (error, result) {

                if (error) return res.send(error.message, 500);

                var books = [];
                books.push.apply(books, result.write);
                books.push.apply(books, result.read);
                books.push.apply(books, result.publ);

                res.send(books);

            });


        },

        CREATE: function (req, res) {

            var Book = req.models['Book'];
            var Authorship = req.models['Authorship'];


            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }       

            async.waterfall([

                function createBook (callback) {
                    Book.create({
                        name: req.body.title,
                        public: false
                    }, callback);
                },
                function addPermission (book, callback) {

                    req.session.user.write.push(book.id);

                    Authorship.create({
                        user_id: req.session.user.id,
                        book_id: book.id
                    }, callback)
                }
            ], function (error, results) {
                res.send({
                    status: 200,
                    data: results
                });
            });


        },
        PUBLIC: function (req, res) {

            var Book = req.models['Book'];
            var Section = req.models['Section'];
            var Authorship = req.models['Authorship'];

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

                function checkPermission (callback) {

                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);                    

                },

                function getBook (permission, callback) {
                    if (permission) {
                        Book.find(req.params.id, callback);
                    } else {
                        res.send({
                            status: 500,
                            message: 'sorry'
                        });
                    }

                },
                function modifyBook (book, callback) {
                    book.updateAttribute('public', req.body.value.match(/^true$/), callback);
                }

            ], function (error, results) {
                res.send({
                    status: 200,
                    data: results
                });
            });


        },


        REFS: function (req, res) {

            var Reference = req.models['Reference'];
            var Authorship = req.models['Authorship'];

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

                function checkPermission (callback) {

                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);                    

                },

               function findRef (permission, callback) {
                    if (permission) {

                        Reference.all({where: {book_id: req.params.id}}, callback);   

                    } else {
                        res.send({
                            status: 500,
                            message: 'sorry'
                        });
                    }
                 

                },
                function (refs, callback) {

                    res.setHeader('Content-Type', 'text/plain');
                    res.render('refs.html', {refs: refs});

                }]);
          

        },

        REF: function (req, res) {

            var Reference = req.models['Reference'];
            var Authorship = req.models['Authorship'];

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

                function checkPermission (callback) {

                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);                    

                },

               function findRef (permission, callback) {
                    if (permission) {

                        Reference.findOne({
                            where: {
                                name: req.body.name,
                                book_id: req.params.id
                            }
                        }, callback);   

                    } else {
                        res.send({
                            status: 500,
                            message: 'sorry'
                        });
                    }
                 

                },
                function (ref, callback) {
                    if (! ref) {

                        Reference.create({
                            name: req.body.name,
                            text: req.body.text,
                            book_id: req.params.id
                        }, callback);

                    } else {
                        res.send({
                            status: 500,
                            message: 'you already have a reference of that name!'
                        });
                    }

                }
            ], function (error, results) {
                res.send({
                    status: 200,
                    data: results
                });
            });

        },

        REFERENCE: function (req, res) {

            var Reference = req.models['Reference'];

            async.waterfall([

                function findRef (callback) {

                    Reference.findOne({
                        where: {
                            name: req.params.reference,
                            book_id: req.params.book_id
                        }
                    }, callback);                    

                },
                function checkRef (reference, callback) {
                    if (reference) {

                        res.setHeader('Content-Type', 'text/plain');
                        res.send(reference.text);

                    } else {
                        res.send(404);                        
                    }
                }]);

        },

        RENAME: function (req, res) {

            var Book = req.models['Book'];
            var Section = req.models['Section'];
            var Authorship = req.models['Authorship'];

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

              
                function checkPermission (callback) {

                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);                    

                },

                function getBook (permission, callback) {
                    if (permission) {
                        Book.find(req.params.id, callback);
                    } else {
                        res.send({
                            status: 500,
                            message: 'sorry'
                        });
                    }

                },
                function modifyBook (book, callback) {
                    book.updateAttribute('name', req.body.title, callback);
                }

            ], function (error, results) {
                res.send({
                    status: 200,
                    data: results
                });
            });


        },
         GET: function (req, res) {

            var id = req.params.id;
            var Book = req.models['Book'];
    
            async.waterfall([
                function (callback) {

                    Book.find(id, s(req, res));
                   
                }
            ], function (error, result) {

                if (error) res.send(err.message, 500);

                res.send(result);

            });

        },

        SECTIONS: function(req, res) {
            var id = req.params.id;
            var Section = req.models['Section'];

            Section.all({where: {book_id: id, parent_id: 0}}, s(req, res));
        
        },

        CHILDREN: function(req, res) {
            var id = req.params.id;
            var section_id = req.params.section_id;
            var Section = req.models['Section'];
            Section.all({where: {book_id: id, parent_id: section_id}}, s(req, res));
        },

        TOC: function(req, res) {

            var id = req.params.id;

            var Section = req.models['Section'];

            var obj = {};

            async.waterfall([
                function(callback) {
                    Section.all({
                        where: {book_id: id},
                        order: 'Section.weight ASC, Section.id'
                    }, callback);
                },

                function(sections, callback) {
                    req.schema.adapter.query('select Content.id as id, Content.name as name, Content.section_id as section_id from Content INNER JOIN Section on Section.id = Content.section_id where Section.book_id = ' + id + ' ORDER BY Content.weight ASC', function(err, contents) {
                        callback(null, sections, contents);
                    });
                },

                function(sections, contents, callback) {
                    var parents = _.filter(sections, function(section) {
                        return !section.parent_id;
                    });
                    var children = _.filter(sections, function(section) {
                        return !!section.parent_id;
                    });

                    _.each(contents, function(content) {

                        for(var s in parents) {
                            var section = parents[s];
                            if (section.id === content.section_id) {
                                section.contents = section.contents || [];
                                section.contents.push(content);
                                return;
                            }							
                        }
                        for(var c in children) {
                            var section = children[c];
                            if (section.id === content.section_id) {
                                section.contents = section.contents || [];
                                section.contents.push(content);
                                return;
                            }							
                        }

                    });


                    _.each(children, function(child) {
                        for(var s in parents) {
                            var section = parents[s];
                            if (section.id === child.parent_id) {
                                section.subsections = section.subsections || [];
                                section.subsections.push(child);
                                return;
                            }
                        }
                    });

                    callback(null, parents);
                }	
                ], function(err, result) {

                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }

                });

        }

    },

    sections: {
        GET: get('Section'), 

        TEX: function(req, res) {

            var id = req.params.id;

            var Book = req.models.Book;
            var Section = req.models['Section'];
            var Authorship = req.models.Authorship;

            var obj = {};

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }     


            var book = {};

            async.waterfall([
                
                function (callback) {

                    Book.find(id, callback)
                
                },  

                function (bk, callback) {
                
                    book = bk;
                    Section.all(
                        {
                        where: {book_id: id},
                        order: 'Section.weight ASC, Section.id'
                    }, callback);
                
                },

                function(sections, callback) {
                
                    req.schema.adapter.query('select Content.id as id, Content.name as name, Content.text as text, Content.section_id as section_id from Content INNER JOIN Section on Section.id = Content.section_id where Section.book_id = ' + id+ ' ORDER BY Section.weight ASC, Content.weight ASC', function(err, contents) {
                        callback(null, sections, contents);
                    });
                
                },

                function(sections, contents, callback) {
                
                    var parents = _.filter(sections, function(section) {
                        return !section.parent_id;
                    });
                    var children = _.filter(sections, function(section) {
                        return !!section.parent_id;
                    });

                    _.each(contents, function(content) {

                        content.text = filterContent(content.text);

                        for(var s in parents) {
                            var section = parents[s];
                            if (section.id === content.section_id) {
                                section.contents = section.contents || [];
                                section.contents.push(content);
                                return;
                            }                           
                        }
                        for(var c in children) {
                            var section = children[c];
                            if (section.id === content.section_id) {
                                section.contents = section.contents || [];
                                section.contents.push(content);
                                return;
                            }                           
                        }

                    });


                    _.each(children, function(child) {
                        for(var s in parents) {
                            var section = parents[s];
                            if (section.id === child.parent_id) {
                                section.subsections = section.subsections || [];
                                section.subsections.push(child);
                                return;
                            }
                        }
                    });

                    callback(null, parents);
                }

                ], function(err, result) {


                    res.setHeader('Content-Type', 'text/plain');
                    res.render('tex.html', {sections: result, book: book});

                    // res.setHeader('Content-Type', 'application/json');
                    // res.send({sections: result});


                });

        },

        CREATE: function (req, res) {

            var Book = req.models['Book'];
            var Section = req.models['Section'];
            var Authorship = req.models['Authorship'];

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

                function checkPermission (callback) {

                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);                    

                },

                function createSection (permission, callback) {

                    if (permission) {

                        Section.create({
                            name: req.body.title,
                            parent_id: 0,
                            book_id: req.params.id
                        }, callback);

                    } else {

                        res.send({
                            status: 500,
                            message: 'sorry'
                        });

                    }

                },

                function addWeight (section, callback) {

                    section.updateAttribute('weight', section.id, callback);

                }

            ], function (error, results) {

                res.send({
                    status: 200,
                    data: results
                });
            
            });


        },

        PROCREATE: function (req, res) {

            var Book = req.models['Book'];
            var Section = req.models['Section'];
            var Authorship = req.models['Authorship'];

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

                function checkPermission (callback) {

                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);                    

                },

                function checkSection (permission, callback) {

                    if (permission) {
                        Section.find(req.params.section_id, callback);                       
                    } else {

                        res.send({
                            status: 500,
                            message: 'sorry'
                        });

                    }

                },

                function createSection (section, callback) {

                    if (section && section.book_id === req.params.id && !section.parent_id) {
                        Section.create({
                            name: req.body.title,
                            parent_id: req.params.section_id,
                            book_id: req.params.id
                        }, callback);
                    } else {
                         res.send({
                            status: 500,
                            message: 'sorry'
                        }); 
                    }

                },

                function addWeight (section, callback) {
                
                    section.updateAttribute('weight', section.id, callback);
                
                }

            ], function (error, results) {

                res.send({
                    status: 200,
                    data: results
                });
            
            });


        },

        RENAME: function (req, res) {

            var Book = req.models['Book'];
            var Section = req.models['Section'];
            var Authorship = req.models['Authorship'];

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

                function checkPermission (callback) {

                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);                    

                },

                function checkSection (permission, callback) {
                    if (permission) {
                        Section.find(req.params.section_id, callback);                       
                    } else {

                        res.send({
                            status: 500,
                            message: 'sorry'
                        });

                    }

                },

                function updateSection (section, callback) {

                    if (section && section.book_id === req.params.id && !section.parent_id) {
                
                       section.updateAttribute('name', req.body.title, callback);
                    } else {
                         res.send({
                            status: 500,
                            message: 'sorry'
                        }); 
                    }
                }

            ], function (error, results) {
                res.send({
                    status: 200,
                    data: results
                });
            });


        }, 
        SUBNAME: function (req, res) {

            var Book = req.models['Book'];
            var Section = req.models['Section'];
            var Authorship = req.models['Authorship'];

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

                function checkPermission (callback) {

                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);                    

                },

                function checkSection (permission, callback) {

                    if (permission) {
                        Section.find(req.params.section_id, callback);
                    } else {

                        res.send({
                            status: 500,
                            message: 'sorry'
                        });

                    }

                },

                function checkSubsection (section, callback) {

                    if (section && section.book_id === req.params.id && !section.parent_id) {
                        Section.find(req.params.subsection_id, callback);
                    } else {
                         res.send({
                            status: 500,
                            message: 'sorry'
                        }); 
                    }

                },

                function createContent (section, callback) {
                
                    if (section && section.book_id === req.params.id && section.parent_id === req.params.section_id) {
                       section.updateAttribute('name', req.body.title, callback);
                    } else {
                          res.send({
                            status: 500,
                            message: 'sorry'
                        }); 
                    }
                
                }


            ], function (error, results) {

                res.send({
                    status: 200,
                    data: results
                });

            });


        }, 
        PUT: function(req, res) {
            res.send(200);
        },

        POST: function(req, res) {
            res.send(200);
        },

        DELETE: function(req, res) {
            res.send(200);
        },

        CONTENT: function(req, res) {
            var id = req.params.id;
            var section_id = req.params.section_id;

            var Section = req.models['Section'];
            var Content = req.models['Content'];

            var obj = {};


            async.waterfall([
            
                function(callback) {
                    Section.find(section_id, callback);
                },
            
                function(section, callback) {
                    obj.name = section.name;
                    obj.id = section.id;

                    // get contents!
                    req.schema.adapter.query('select Content.id as id, Content.name as name, Content.text as text, Content.section_id as section_id, Section.name as section_name from Content INNER JOIN Section on Section.id = Content.section_id where Section.parent_id = ' + section_id+ ' ORDER BY Section.weight ASC, Content.weight ASC', callback);
                },
            
                function(subsubsections, callback) {
                    var ss = {};
                    _.each(subsubsections, function(row) {
                        ss[row.section_name] = ss[row.section_name] || [];
                        ss[row.section_name].push(_.exclude(row, 'section_name'));
                    });
                    obj.subsections = [];
                    _.each(ss, function(section, name) {
                        obj.subsections.push({name: name, contents: section});
                    });


                    req.schema.adapter.query('select Content.id as id, Content.name as name, Content.text as text, Content.section_id as section_id from Content INNER JOIN Section on Section.id = Content.section_id where Content.section_id = ' + section_id+ ' ORDER BY Section.weight ASC, Content.weight ASC', callback);
                },
            
                function(sections, callback) {
                    obj.contents = sections;
                    callback(null, obj);
                }

                ], function(err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                }
            );

        }


    },

    contents: {
        GET: get('Content'), 

        CREATE: function (req, res) {

            var Book = req.models['Book'];
            var Section = req.models['Section'];
            var Authorship = req.models['Authorship'];
            var Content = req.models.Content;

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

                function checkPermission (callback) {
                    
                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);    

                },

                function checkSection (permission, callback) {

                    if (permission) {
                        Section.find(req.params.section_id, callback);
                    } else {
                        res.send({
                            status: 500,
                            message: 'sorry'
                        });
                    }

                },

                function createSectionContent (section, callback) {

                    if (section && section.book_id === req.params.id && !section.parent_id) {
                        Content.create({
                            name: req.body.title,
                            section_id: req.params.section_id
                        }, callback);
                    } else {
                         res.send({
                            status: 500,
                            message: 'sorry'
                        }); 
                    }

                },

                function addWeight (content, callback) {

                    content.updateAttribute('weight', content.id, callback);

                }

            ], function (error, results) {
                res.send({
                    status: 200,
                    data: results
                });
            });


        },

        PROCREATE: function (req, res) {

            var Book = req.models['Book'];
            var Section = req.models['Section'];
            var Authorship = req.models['Authorship'];
            var Content = req.models.Content;

            if (!req.session.user) {
                return res.send({
                    status: 500,
                    message: 'sorry but you cannot do that'
                });
            }      

            async.waterfall([

                function checkPermission (callback) {

                    Authorship.findOne({
                        where: {
                            user_id: req.session.user.id,
                            book_id: req.params.id
                        }
                    }, callback);                    

                },

                function checkSection (permission, callback) {

                    if (permission) {
                        Section.find(req.params.section_id, callback);
                    } else {

                        res.send({
                            status: 500,
                            message: 'sorry'
                        });

                    }

                },

                function checkSubsection (section, callback) {

                    if (section && section.book_id === req.params.id && !section.parent_id) {
                        Section.find(req.params.subsection_id, callback);
                    } else {
                         res.send({
                            status: 500,
                            message: 'sorry'
                        }); 
                    }

                },

                function createContent (section, callback) {

                    if (section && section.book_id === req.params.id && section.parent_id === req.params.section_id) {
                        Content.create({
                            name: req.body.title,
                            section_id: req.params.subsection_id
                        }, callback);
                    } else {
                          res.send({
                            status: 500,
                            message: 'sorry'
                        }); 
                    }

                },

                function addWeight (content, callback) {

                    content.updateAttribute('weight', content.id, callback);

                }

            ], function (error, results) {
                res.send({
                    status: 200,
                    data: results
                });
            });


        },
    
        PUT: function(req, res) {

            if (req.session.user && req.session.user.author) {

                var id = req.params.id;

                var Content = req.models['Content'];

                async.waterfall([

                    function(callback) {

                        Content.find(id, callback);

                    },

                    function(content, callback) {

                        content.updateAttributes(req.body, callback);

                    }
      
                    ], function(error, results) {

                        if (error) return res.send(500, error.message);

                        res.send(results);

                    });

            } else {

                res.send(503);

            }

        },

        SKETCH: function (req, res) {

            if (req.body.text && req.body.text.trim().length) {

                var Sketch = req.models['Sketch'];
                if (req.session.user) {
                    Sketch.create({text: req.body.text, user_id: req.session.user.id}, s(req, res));
                } else {
                    Sketch.create({text: req.body.text}, s(req, res));
                }

            } else {
                res.send({data: ''});
            }

        },


        RANDOM: function (req, res) {

            var Sketch = req.models['Sketch'];

                    // get contents!
            req.schema.adapter.query('SELECT text FROM `Sketch` ORDER BY RAND() LIMIT 0,1', function (error, results) {
                res.send({data: results[0]});
            });


        },

        UPDATESKETCH: function (req, res) {

            var Sketch = req.models['Sketch'];

            if (!(req.body.text && req.body.text.trim().length)) {
                return res.send({data: ''});
            }

            if (req.session.user) {

                async.waterfall([
                    function (callback) {
                        Sketch.find(req.params.sketch_id, callback);
                    },
                    function (sketch, callback) {
                        if (sketch.user_id == req.session.user.id) {
                            sketch.updateAttribute('text', req.body.text, callback);
                        } else {
                            Sketch.create({text: req.body.text, user_id: req.session.user.id}, s(req, res));
                        }
                    }
                ], function (err, results) {
                    res.send(results);
                });


            } else {

                var Sketch = req.models['Sketch'];
                if (req.session.user) {
                    Sketch.create({text: req.body.text, user_id: req.session.user.id}, s(req, res));
                } else {
                    Sketch.create({text: req.body.text}, s(req, res));
                }


            }

        },

        READSKETCH: function (req, res) {

            var Sketch = req.models['Sketch'];

            async.waterfall([
                function (callback) {
                    Sketch.find(req.params.sketch_id, callback);
                }
            ], function (err, results) {
                res.send(results);
            });

        },


        POST: function(req, res) {
            res.send(200);
        },

        DELETE: function(req, res) {
            res.send(200);
        }
    }

};
