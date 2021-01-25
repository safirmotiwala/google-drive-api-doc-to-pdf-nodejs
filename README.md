# google-drive-api-doc-to-pdf-nodejs

This project converts any office documents to pdf using the google drive API. It first uploads the doc on the drive and then exports it in the pdf format.

### Steps

1. Follow the steps from here (https://dev.to/kamalhossain/google-drive-api-in-node-js-3mnm) to get crediantials.json and tokens.json
2. Install the libraries
```
npm install
```
3. Add the document in the root folder and change the name of the file in the code (filePath variable)
4. Run the API
```
node server.js
```

##### References

* https://dev.to/kamalhossain/google-drive-api-in-node-js-3mnm
* https://github.com/googleapis/google-api-nodejs-client/issues/963#issuecomment-367671749
* https://stackoverflow.com/questions/4212861/what-is-a-correct-mime-type-for-docx-pptx-etc
* https://developers.google.com/drive/api/v3/mime-types
