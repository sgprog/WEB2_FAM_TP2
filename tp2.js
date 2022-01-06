const express = require('express');
const app = express();
const mongoose = require('mongoose');

const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

const bcrypt = require('bcryptjs');  // changed with intel

const expressLayouts = require('express-ejs-layouts');
const multer = require('multer');
const upload = multer({ dest: "./uploads/"});
const storage = multer.diskStorage( {
    destination: function(req, file, callback) {
        callback(null, './upload');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname);

    }
});

app.use(upload.any());

const PORT = process.env.PORT || 8000;

let connectionString = 'mongodb+srv://sylvain:dbpass@cluster0.ygdre.mongodb.net/web2_TP1?retryWrites=true&w=majority';
mongoose.connect(connectionString);

app.use(expressLayouts);

app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'web2gagtp1',
    resave: true,
    saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error_passport = req.flash('error');
    next();
});

app.use('/', require('./routes/index'));
app.use('/usagers', require('./routes/users'));
app.use('/livres', require('./routes/books'));
app.use('/css', express.static('./static/css'));
app.use('/img', express.static('./static/img'));
app.use('/js', express.static('./static/js'));


app.set('views', './views');
app.set('layout', 'layout');
app.set('view engine', 'ejs');


let db = mongoose.connection;
db.on('error', (err) => {console.error('erreur de DB', err)});
db.once('open', () => {
    console.log('Connexion à la DB OK!!!!');
});

app.listen(PORT, console.log(`Service sur le port ${PORT}`));