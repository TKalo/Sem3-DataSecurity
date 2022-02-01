require('dotenv').config();
const ResultObject = require('./ResultObject');
const bcrypt = require('bcrypt');
const validator = require("validate.js");
const { v4: uuidv4 } = require('uuid');
const db = require('./db-connection.js');
const encryption = require('./encryption.js')
const marky = require('marky');


const passwordRequiredCharacters = ["!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~"]
//const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

async function calculateIdealCost(){
    //Benchmark using a cost of 10
    let cost = 10;
    marky.mark('salt');
    let saltrounds = await bcrypt.genSalt(cost)
    await bcrypt.hash("microbenchmark", saltrounds);
    let result = marky.stop('salt');

    let durationMS = result["duration"]

    //Increasing cost by 1 would double the run time.
    //Keep increasing cost until the estimated duration is over 250 ms
    while (durationMS < 250)
    {
        cost += 1;
        durationMS *= 2;
    }

    return cost;
}

async function addUser(email, password) {

    //Confirm password is valid
    let passwordError = checkPassword(password);
    if (passwordError != null) return new ResultObject().setError(`password not valid - ${passwordError}`);

    //Confirm email is valid
    if (!checkEmail(email)) return new ResultObject().setError("email not valid");

    //Check if email is used
    if ((await getUser(email)).success) return new ResultObject().setError("email already in use");

    const query = 'INSERT INTO user(email, password, created_on, last_edited, userid) VALUES(?,?,?,?,?);';

    let saltRounds = await calculateIdealCost();

    let salt = await bcrypt.genSalt(saltRounds);

    let hash = await bcrypt.hash(password, salt);

    //Encrypt email
    email = encryption.encrypt(email)

    let dbReturn = await db.execute(query, [email, hash, Date.now(), Date.now(), uuidv4()]);

    if(!dbReturn.wasApplied()) return new ResultObject().setError("internal database error");

    return new ResultObject().setSuccess();
}


async function getUser(email) {

    if(email == null) return new ResultObject().setError("empty email");
    email = encryption.encrypt(email);

    const query = 'SELECT * FROM user WHERE email=? ALLOW FILTERING;';

    let result = await db.execute(query, [email]);

    if (!result.first()) return new ResultObject().setError("found no user");

    return new ResultObject().setSuccess(result.first());
}


async function authenticateUser(email, password) {

    let userResultObject = await getUser(email);

    email = encryption.encrypt(email);

    if (userResultObject.result == null) return new ResultObject().setError("email does not match any users");

    let user = userResultObject.result;

    if(!(await bcrypt.compare(password, user.get('password')))) return new ResultObject().setError("wrong password");

    return new ResultObject().setSuccess();
}


async function updateUserEmail(old_email, new_email) {

    //Confirm email is valid
    if (!checkEmail(new_email)) return new ResultObject().setError("email not valid");

    //Check email is not in use
    if ((await getUser(new_email)).success) return new ResultObject().setError("email is already in use");

    //encrypt new email
    new_email = encryption.encrypt(new_email);

    
    let userResultObject = await getUser(old_email);

    if (!userResultObject.success) return new ResultObject().setError("user does not exist");

    let user = (await getUser(old_email)).result;

    const query = 'UPDATE user SET email = ?, last_edited = ? WHERE userid=?;';

    let dbReturn = await db.execute(query, [new_email, Date.now(), user.get('userid')]);

    if(!dbReturn.wasApplied()) return new ResultObject().setError("internal error");

    return new ResultObject().setSuccess();
}

async function updateUserPassword(email, new_password){

    let passwordError = checkPassword(new_password);
    if (passwordError != null) return new ResultObject().setError(`password not valid - ${passwordError}`);

    let userResultObject = await getUser(email);

    if (!userResultObject.success) return new ResultObject().setError("user does not exist");

    const query = 'UPDATE user SET password = ?, last_edited = ? WHERE userid=?;';

    let saltRounds = await calculateIdealCost();

    let salt = await bcrypt.genSalt(saltRounds);

    let hash = await bcrypt.hash(new_password, salt);

    let dbReturn = await db.execute(query, [hash, Date.now(), userResultObject.result.get('userid')]);

    if(!dbReturn.wasApplied) return new ResultObject().setError("internal error");

    return new ResultObject().setSuccess();
}


async function deleteUser(email) {
    const query = 'DELETE FROM user WHERE userid=?;';

    if (!(await getUser(email)).success) return new ResultObject().setError("user does not exist");

    let user = (await getUser(email)).result;

    let dbReturn = await db.execute(query, [user.userid]);

    if(!dbReturn.wasApplied) return new ResultObject().setError("internal error");

    return new ResultObject().setSuccess();
}

function checkPassword(password) {

    if (password.length < 12) return "password must be at least 12 characters long";

    if(!passwordRequiredCharacters.some(char => password.includes(char))) return "password must contain at least one special character";

    return null;
}

function checkEmail(email) {

   return validator({from: email}, {from: {email: true}}) == undefined;
}

function closeDB(){
    db.closeDB()
}

module.exports = {
    deleteUser,
    updateUserEmail,
    updateUserPassword,
    addUser,
    authenticateUser,
    getUser,
    checkPassword,
    checkEmail,
    closeDB
};