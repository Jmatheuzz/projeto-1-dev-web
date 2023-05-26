const { MongoClient, ObjectId } = require('mongodb');
const {v4} = require('uuid')
const bcrypt = require('bcrypt')
// Connection URL
const url = 'mongodb://root:rootpwd@localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'ufcweb2022';

var user_collection;
var cars_collection;
var rents_collection;

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  const db = client.db(dbName);
  user_collection = db.collection('user');
  cars_collection = db.collection('cars');
  rents_collection = db.collection('rents');
  // the following code examples can be pasted here...
   
  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error);
//   .finally(() => client.close());

async function getUsers(email, password) {
    const findResult = await user_collection.find().toArray();
    return findResult;
}

async function getUser(id,) {
    const findResult = await user_collection.find({_id: id}).toArray();
    return findResult[0];
}

async function getUserByEmail(email) {
    const findResult = await user_collection.find({email: email}).toArray();
    return findResult[0];
}

async function getCars() {
    const findResult = await cars_collection.find().toArray();
    return findResult;
}

async function saveCar(car){
  const result = await cars_collection.insertOne({_id: v4(), ...car})
  return result;
}

async function getCar(id,) {
  const findResult = await cars_collection.find({_id: id}).toArray();
  return findResult[0];
}
async function saveUser(user){
  const {password} = user
  delete user.password
  const passwordHash = await bcrypt.hash(password, 10)
  const result = await user_collection.insertOne({_id: v4(), password: passwordHash, ...user})
  return result;
}


async function deleteCar(id) {
  const findResult = await cars_collection.deleteOne({_id: new ObjectId(id)})
  console.log(id)
  return findResult;
}

async function getRentsByCar(car) {
  
  const query = { "car._id": car.id };
  const findResult = await cars_collection.find(query).toArray();
  return findResult;
}

async function getRentsByUser(user) {
  
  const query = { "user._id": user.id };
  const findResult = await rents_collection.find(query).toArray();
  return findResult;
}

async function getRents() {
    const findResult = await rents_collection.find().toArray();
    return findResult;
}

async function saveRent(rents){
  const result = await rents_collection.insertOne(rents)
  return result;
}


async function deleteRent(id) {
  const findResult = await rents_collection.deleteOne({_id: new ObjectId(id)})
  console.log(id)
  return findResult;
}


exports.getUsers = getUsers;
exports.saveCar = saveCar;
exports.saveUser = saveUser;
exports.getRentsByCar = getRentsByCar;
exports.getCars = getCars;
exports.saveRent = saveRent;
exports.getRents = getRents;
exports.getCar = getCar;
exports.getRentsByUser = getRentsByUser;
exports.getUserByEmail = getUserByEmail;
exports.deleteRent = deleteRent;
exports.getUser = getUser;
exports.deleteCar = deleteCar;