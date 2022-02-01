require('dotenv').config();
//”cassandra-driver” is in the node_modules folder. Redirect if necessary.
const cassandra = require('cassandra-driver');
//Replace Username and Password with your cluster settings
const authProvider = new cassandra.auth.PlainTextAuthProvider(process.env.USERNAME, process.env.PASSWORD);
//Replace PublicIP with the IP addresses of your clusters
const contactPoints = [process.env.IP];


const client = new cassandra.Client(
    {
        contactPoints: contactPoints,
        authProvider: authProvider,
        localDataCenter: 'datacenter1',
        keyspace: 'usercredentials'
    }
);

//Ensure all queries are executed before exit
function execute(query, params) {
    return client.execute(query, params, {prepare: true});
}

function closeDB(){
    client.shutdown();
}

module.exports = {execute, closeDB};