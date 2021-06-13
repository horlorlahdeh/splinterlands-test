const express = require('express');
const ejs = require('ejs')
const bodyParser = require('body-parser')
const morgan = require('morgan');
const createError = require('http-errors')

// Custom Dependencies
const indexRouter = require('./routes')

// Utilities
const port = process.env.PORT || 4000;
const app = express();


  
app.set('view engine', 'ejs');
app.use(express.json());
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: true}))

app.use('/', indexRouter)
app.use(express.static(__dirname + "/public"));


 
// 404 Errors to forward to handler
app.use((req, res, next) => {
    next(createError(404))
})
 
// Error Handler Function
app.use((err, req, res, next) => {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err: {};

    // Show error page
    res.status(err.status || 500);
    res.render('error')
}) 

app.listen(port, () => {
    console.log("Server started on port " + port)
})  