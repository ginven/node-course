const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
// const expressHbs = require('express-handlebars');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./util/path')

const app = express();

// EJS
app.set('view engine', 'ejs');
app.set('views', 'views');


// HANDLEBARS
// app.engine('hbs', expressHbs({layoutsDir: 'views/layouts', defaultLayout: 'main-layout', extname: 'hbs'}));
// app.set('view engine', 'hbs');
// app.set('views', 'views');

// PUG
// app.set('view engine', 'pug');
// app.set('views', 'views');

app.use(bodyParser.urlencoded());
app.use(express.static(path.join(rootDir, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use('/', (req, res, next) => {
    res.status(404).render('not-found', {docTitle: '404 - Page not found!'});
})
app.listen(3001)