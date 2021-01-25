const express = require('express');
const app = express();
const PORT = 5000;
'use strict';

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

let auth;

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content));
});


// ...

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client);
      oAuth2Client.setCredentials(JSON.parse(token));
      auth = oAuth2Client;
    });
}

// ...

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */

function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        auth = oAuth2Client;
      });
    });
}



app.get('/testRoute', (req, res) => res.end('Hello from Server!'));

// ...

app.post('/uploadAFile', async (req, res) => {

    const filePath = 'testdocument.doc'

    // https://stackoverflow.com/questions/4212861/what-is-a-correct-mime-type-for-docx-pptx-etc
    const mimeTypes = {
        'doc' : 'application/msword',
        'dot' : 'application/msword',
        'docx' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'dotx' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
        'docm' : 'application/vnd.ms-word.document.macroEnabled.12',
        'dotm' : 'application/vnd.ms-word.template.macroEnabled.12',
        'xls' : 'application/vnd.ms-excel',
        'xlt' : 'application/vnd.ms-excel',
        'xla' : 'application/vnd.ms-excel',
        'xlsx' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xltx' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
        'xlsm' : 'application/vnd.ms-excel.sheet.macroEnabled.12',
        'xltm' : 'application/vnd.ms-excel.template.macroEnabled.12',
        'xlam' : 'application/vnd.ms-excel.addin.macroEnabled.12',
        'xlsb' : 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        'ppt' : 'application/vnd.ms-powerpoint',
        'pot' : 'application/vnd.ms-powerpoint',
        'pps' : 'application/vnd.ms-powerpoint',
        'ppa' : 'application/vnd.ms-powerpoint',
        'pptx' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'potx' : 'application/vnd.openxmlformats-officedocument.presentationml.template',
        'ppsx' : 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
        'ppam' : 'application/vnd.ms-powerpoint.addin.macroEnabled.12',
        'pptm' : 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
        'potm' : 'application/vnd.ms-powerpoint.template.macroEnabled.12',
        'ppsm' : 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
        'mdb' : 'application/vnd.ms-access'
    }

    // https://developers.google.com/drive/api/v3/mime-types
    spreadSheets = ['xls', 'xlt', 'xla', 'xlsx', 'xltx', 'xlsm', 'xltm', 'xlam', 'xlsb']

    let fileType = filePath.split('.')[1]
    let gdocMimeType;

    if(spreadSheets.includes(fileType)){
        gdocMimeType = 'application/vnd.google-apps.spreadsheet'
    }else{
        gdocMimeType = 'application/vnd.google-apps.document'
    }

    var fileMetadata = {
      name: 'testdoc', // file name that will be saved in google drive
      mimeType: gdocMimeType
    };
    
    var media = {
      mimeType: mimeTypes[fileType],
      body: fs.createReadStream(filePath), // Reading the file from our server
    };
  
    // Authenticating drive API
    const drive = google.drive({ version: 'v3', auth });
  
    // Uploading Single image to drive
    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
      },
      async (err, file) => {
        if (err) {
          // Handle error
          console.error(err.msg);
  
          return res
            .status(400)
            .json({ errors: [{ msg: 'Server Error try again later' }] });
        } else {
          // if file upload success then return the unique google drive id
          console.log(file);

        
            
        // Downloading doc file in pdf
        const dest = fs.createWriteStream('testdoc.pdf');

        drive.files.export({
            fileId: file.data.id,
            mimeType: 'application/pdf'
        }, {
            responseType: 'stream'
        },function(err, response){
            if(err)return done(err);
            
            response.data.on('error', err => {
                done(err);
            }).on('end', ()=>{
                
            })
            .pipe(dest);
       });

          res.status(200).json({
            fileID: file.data.id,
          });

        
    }
}
    
    );
});

app.listen(PORT, () => {
  console.log(`Node.js App running on port ${PORT}...`);
});