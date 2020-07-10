/*
Created by Sublime Text.
User: mamy1009
Date: 02/28/2019
Time: 10:50 PM
Phone:2155
Server side for nodeJS node-v10.15.1-win-x64
*/
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path');
var fs  = require("fs");
var util  = require('util');
const app = express();
// enable files upload
app.use(fileUpload());
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (request, response) =>  {response.sendFile(`${__dirname}/index.html`)});
app.listen(80, () => console.info('Application running on port 80'));
app.post('/upload',  async (req, res) => {
    try {
        if (!fs.existsSync(__dirname +'/uploads')){
                fs.mkdirSync(__dirname +'/uploads');
             }
        if (!req.files)
     		 return res.status(404).send('No files were uploaded.');
  let arrayFiles=[];
        if (Array.isArray(req.files.filesUpload)){
             arrayFiles.push(...req.files.filesUpload);
         }
         else {
            arrayFiles.push(req.files.filesUpload);
         }
         if(arrayFiles.length>0){
            let data = []; 
            arrayFiles.forEach(file => {
                //move photo to uploads directory
                file.mv(__dirname +'/uploads/' + file.name);
                //push file details
                data.push({
                    name: file.name,
                    mimetype: file.mimetype,
                    size: file.size
                });
            });
            //return response
            return res.status(200).send('Files are uploaded.');
       }
    } catch (err) {
        console.log(err)
        return res.status(500).send(err);
    }
});