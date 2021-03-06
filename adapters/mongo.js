
module.exports = function(host) {

  var mongo = require(process.cwd()+"/node_modules/mongoskin")

  var _db = mongo.db(host, {safe:true}),
      db = {};

  db.get = function(bucket, key, done) {
    _db.collection(bucket).findById(key, function(err, obj) {
      if (obj) delete obj._id;
      done(err, obj);
    });
  };

  db.post = function(bucket, value, done) {
    _db.collection(bucket).insert(value, {}, function(err, obj) {
      // Dumb mongo adds the _id property to our value
      var id = value._id;
      delete value._id;

      done(err, id);
    });
  };

  db.put = function(bucket, key, value, done) {
    var objId;
    try {
      objId = mongo.ObjectID.createFromHexString(key);
    }
    catch (e) {
      objId = key;
    }
    value._id = objId;
    _db.collection(bucket).update({_id: objId}, value, {upsert: true}, function(err) {
      delete value._id;
      done(err);
    });
  };

  db.remove = function(bucket, key, done) {
    _db.collection(bucket).removeById(key, {}, function(err) {
      done(err);
    });
  };

  db.all = function(bucket, done) {
    _db.collection(bucket).find().toArray(function(err, values) {
      var returnValues = {};
      if (!values) return done(err, {});
      
      values.forEach(function(value) {
        returnValues[value._id] = value;
        delete value._id;
      });
      done(err, returnValues);
    });
  };

  return db;
};
