const { name } = require('ejs')
let express = require('express')
let mongodb = require('mongodb')
let sanitizeHTML = require('sanitize-html')
const dotenv=require('dotenv')
dotenv.config()

let app = express()
let db
let port = process.env.PORT
app.use(express.static('public'))

let connectionString = process.env.CONNECTIONSTRING
mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
  db = client.db()
  app.listen(port)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.get('/', function(req, res) {
     res.render('index.ejs')
})

app.get('/index.ejs', function(req, res) {
    res.redirect('/')
})


app.get('/createuser.ejs', function(req, res) {
    res.render('createuser.ejs')
})

app.get('/viewaccounts.ejs', function(req, res){
    
  db.collection('accountdetails').find().toArray(function(err,items){
       
      res.render('viewaccounts.ejs',{items:items})
  })


})

app.get('/transfer.ejs', function(req, res) {
    res.render('transfer.ejs')
})

app.post('/create-user', function(req, res) {
  console.log(req.body.name)
  db.collection('accountdetails').insertOne({name:req.body.name,mobile:req.body.mobile,email:req.body.email,accountbalance:req.body.accbal}, function(err, info) {
    res.render('createuser.ejs')
  })
})

app.post('/transfer', function(req, res) {
           
         db.collection('accountdetails').find({name:req.body.to}).toArray(function(err,items){
           
          var acc;
           items.forEach(function(items){ 
             acc=items.accountbalance;
             
             })
             var amount= parseInt(acc) + parseInt(req.body.amount)
             console.log(amount)
          db.collection('accountdetails').findOneAndUpdate({name: req.body.to}, {$set: {accountbalance:amount}}, function() {
            db.collection('accountdetails').find({name:req.body.from}).toArray(function(err,items){
           
              var senderacc;
               items.forEach(function(items){ 
                 senderacc=items.accountbalance;
                 
                 })
                 var senderamount= parseInt(senderacc) - parseInt(req.body.amount)
                 
              db.collection('accountdetails').findOneAndUpdate({name: req.body.from}, {$set: {accountbalance:senderamount}}, function() {
                res.render('transfer.ejs')
              })
          });
          })
      });

      
})


