const express = require('express');
const fileUpload = require('express-fileupload');
const randomstring = require('randomstring');
const { exec } = require('child_process');
const app = express();
 
// default options
app.use(fileUpload());
app.use('/', express.static(__dirname + '/public'));

app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
 
  // Use the mv() method to place the file somewhere on your server
  let filename = randomstring.generate(20);
  sampleFile.mv('/home/jan2/Desktop/vinder/fileupload/public/files/'+filename+'.mov' , function(err) {
    if (err)
      return res.status(500).send(err);
 
      exec('ffmpeg -i '+__dirname+'/public/files/'+filename+'.mov -vcodec copy -acodec copy '+__dirname+'/public/files/'+filename+'.mp4', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return res.status(500).send(err);
        }
      
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        res.send('File uploaded!');
      });
  });
});

app.listen(8000);