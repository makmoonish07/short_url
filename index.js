const express = require('express');
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json())

const { Pool, Client } = require('pg')

const credentials = {
    user: "postgres",
    host: "ddbredirect.cbnqs3awiqgm.us-east-1.rds.amazonaws.com",
    database: "ddbredirect",
    password: "abcd1234",
    port: 5432,
  };

var pool = new Pool(credentials)



app.get('/shortlink', function (req, res) {
 
  pool.query('SELECT * from link_table where link_id='+req.query.link_id, (err, qres) => { 
    if(err){
      res.send("Postgres SQL Error");
    }
    else{
      if(qres.rows[0]){
        
        res.send(qres.rows[0]);
      }
      else{
        res.send("Url does not exist");
      }      
    }
   })
  
})


app.post('/shortlink', function (req, res) {

  let r = '/'+(Math.random() + 1).toString(36).substring(8);
  pool.query('insert into link_table(og_link,short_path) values (\''+req.body.og_url+'\',\''+r+'\') returning link_id', (err, qres) => {
    console.log(qres.rows[0].link_id);
    res.send({"link_id":qres.rows[0].link_id, "og_link":req.body.og_url, "short_path": 'http://short.io'+r+''})
  })
  

})  


app.get('/*', function (req, res) {
  console.log(req.originalUrl)
  pool.query('SELECT * from link_table where short_path=\''+req.originalUrl+'\'', (err, qres) => {
    if(err){
      res.send("Postgres SQL Error");
    }
    else{
      if(qres.rows[0]){
        
        res.redirect(qres.rows[0].og_link);
      }
      else{
        res.send("Url does not exist");
      }      
    }
  })
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at Port:%s", port)
})