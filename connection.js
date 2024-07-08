const mysql = require('mysql');

function connectionRequest() {
    const connection = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'root',
        database:'USER_DB'
    });

    connection.connect((err) => {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
        console.log('connected as id ' + connection.threadId);
    });

    return connection;
}

module.exports = connectionRequest;
