var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({extended:false});
var pg = require('pg');
var conString = "postgres://jan:foobar@localhost/medialib";
var device = require('express-device');

app.use('/assets', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser());
app.use(device.capture());

app.get('/:category', function(req, res) {

    if(req.params.category !== 'porn' && req.params.category !== 'movie') {
        return res.send('Error: Category not defined');
    }

    pg.connect(conString, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        var sql = "select * from mediaitem where category = '"+req.params.category+"' and active = 1";
        var order = req.query.order;
        if(order) {
            sql += " order by " + (order === 'added' ? "created desc" : "views desc");
            if(order !== 'added' && order !== 'views')
                return res.send('Error: invalid order param');
        } else {
            sql += " order by created desc";
        }
        client.query(sql, function(err, result) {
            //call `done()` to release the client back to the pool
            done();

            if(err) {
                return console.error('error running query', err);
            }
            console.log('loaded '+result.rows.length+' movies');

            var numItemsPerRow = 6;
            if(req.device.type === 'phone')
                numItemsPerRow = 1;
            var _movies = [];
            var j=0;
            var i=0;

            result.rows.forEach(function(movie) {
                if(!_movies[i])
                    _movies[i] = [];
                if(j == numItemsPerRow) {
                    i++;
                    j=0;
                } else {
                    _movies[i].push(movie);
                    j++;
                }
            });

            res.render('index', {mode:'select',category:req.params.category,movies:_movies});
        });
    });
});

app.get('/:category/:id', function(req, res) {

    if(req.params.category !== 'porn' && req.params.category !== 'movie') {
        return res.send('Error: Category not defined');
    }

    if(!req.params.id)
        return res.send('Error: No media id specified');

    pg.connect(conString, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        client.query("select * from mediaitem where repo_name = '"+req.params.id+"'", function(err, result) {
            //call `done()` to release the client back to the pool
            done();

            if(err) {
                return console.error('error running query', err);
            }

            if(result.rows.length === 0)
                return res.send('Error: Movie couldnt be found');

            console.log('loaded '+result.rows[0].repo_name);

            client.query("update mediaitem set views = views + 1 where repo_name = '"+req.params.id+"'",
                function(err, result) {
                    if(err)
                        console.log('could not increase views');
                    else
                        console.log('views increased by 1');
            });


            res.render('index', {mode:'watch',category:req.params.category,movie:result.rows[0]});
        });
    });
});

app.listen(port);
