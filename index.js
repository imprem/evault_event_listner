const connection = require('./connection')
const express = require('express');
const bodyParser = require('body-parser');
const eventListner = require('./event_listner');
var app = express();

app.use(bodyParser.json())

app.get('/get', (req, res)=>{
    connection.query('select * from USER', (err, rows)=>{
        if(err){
            console.log(err);
        }else{
            res.send(rows);  
        }
    })
})

eventListner;
app.listen(4020, ()=>console.log(`Express server is runing on port 4020`))