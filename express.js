var express = require('express')
  , mongoskin = require('mongoskin')
  , bodyParser = require('body-parser')
  , cors = require('cors');

var app = express();
app.use(bodyParser());
app.use(cors());

var db = mongoskin.db('mongodb://@localhost:27017/peopledatabase', {safe:true});

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName);
  return next()
});

app.get('/', function(req, res, next) {
  res.send('please select a collection, e.g., /collections/messages')
});

app.get('/:collectionName', function(req, res, next) {
  req.collection.find({} ,{limit:500, sort: [['_id',-1]]}).toArray(function(e, results){
    if (e) return next(e);
    res.send(results)
  })
});

app.post('/:collectionName', function(req, res, next) {
  req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e);
    res.send(results)
  })
});

app.get('/:collectionName/:id', function(req, res, next) {
  req.collection.findById(req.params.id, function(e, result){
    if (e) return next(e);
    res.send(result)
  })
});

app.put('/:collectionName/:id', function(req, res, next) {
  req.collection.updateById(req.params.id, {$set:req.body}, {safe:true, multi:false}, function(e, result){
    if (e) return next(e);
    res.send((result===1)?{msg:'success'}:{msg:'error'})
  })
});

app.del('/:collectionName/:id', function(req, res, next) {
  req.collection.remove({'id':parseInt(req.params.id)}, function(e, result){
    if (e) return next(e);
    res.send((result===1)?{msg:'success'}:{msg:'error'})
  })
});

app.listen(3000);
