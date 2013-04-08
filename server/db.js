var Schema = require('jugglingdb').Schema;

var schema = new Schema('mysql', {
    "driver": "mysql",
    "username": "latex2html5",
    "password": "skateboard321",
    "host": "localhost",
    "port": 3306,
    "database": "latex2html5_db",
    "debug": false
});


/**
* DB
*/

var Book = schema.define('Book', {
    name:               String,
    subtitle:           String,
    abstract:           Schema.Text,
    public:             {type:Boolean, default: false}
});

var Section = schema.define('Section', {
    name:               String,
    weight:             Number
});
Section.belongsTo(Section, {as: 'parent', foreignKey: 'parent_id'});
Section.belongsTo(Book, {as: 'book', foreignKey: 'book_id'});

var Content = schema.define('Content', {
    name:               String,
    text:               Schema.Text,
    weight:             Number,
    created:            {type: Date, default: Date.now}
});
Content.belongsTo(Section, {as: 'section', foreignKey: 'section_id'});

var User = schema.define('User', {
    email:              String,
    first:              String,
    last:               String,
    password:           String,
    verified:           {type: Boolean, default: false},
    author:             {type: Boolean, default: false},
    last_login:         Date,
    created:            {type: Date, default: Date.now}
});

var Reference = schema.define('Reference', {
    name:               String,
    text:               Schema.Text
});
Reference.belongsTo(Book, {as: 'reference', foreignKey: 'book_id'});

var Data = schema.define('Data', {
    name:               String,
    text:               Schema.Text
});
Data.belongsTo(Book, {as: 'data', foreignKey: 'book_id'});

var Authorship = schema.define('Authorship', {
    user_id:            Number,
    book_id:            Number,
    created:            {type: Date, default: Date.now}
});

var Readership = schema.define('Readership', {
    user_id:            Number,
    book_id:            Number,
    created:            {type: Date, default: Date.now}
});

var Sketch = schema.define('Sketch', {
    text:               Schema.Text,
    user_id:            Number,
    created:            {type: Date, default: Date.now}
});

module.exports =  schema; 
