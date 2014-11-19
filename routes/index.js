var crawler = require('../crawler');

module.exports = function(app) {
    app.get('/',getHomePage);
    app.get('/beginCraw',beginCraw);
};

function getHomePage(req,res) {
    res.render('index', { title: 'Express' });
}

function beginCraw(req,res) {
    crawler.craw();
    res.render('index', { title: 'Express' });
}