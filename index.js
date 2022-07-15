// Made by Max B

const crypto = require('crypto');
const fileUpload = require('express-fileupload');
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

var ip = require("ip");
const localip = ip.address();
const SessionUUID = crypto.randomUUID();
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(fileUpload());

function WriteLog(ip,UUID,port) {
    let date = new Date();
    fs.appendFile("logs/server_log.tmp", `[${date}] OS [${process.platform}] Session UUID [${UUID}]\n`, (err) => {
        if (err) {
            console.log(err);
        }
    })
}

function WriteToUploadLog(clients_IP,FileName,typeOfFile) {
    let date = new Date();
    fs.appendFile("logs/upload_log.tmp", `[${date}] Session UUID [${SessionUUID}] From [${clients_IP}] FileName [${FileName}] Type [${typeOfFile}]\n`, (err) => {
        if (err) {
            console.log(err);
        }
    })
}

function UpdateFiles() {
    fs.readdir("tmp_files/", (err, files) => {
        files.forEach(file => {
            const encodedUrl = encodeURI(path.parse(file).name);
    
            app.get(`/files/${encodedUrl}`, (req, res) => {
                res.sendFile(file, { root: "tmp_files/"})
            })
        })
    })
}

// app.get("*", (req, res) => { // DOES NOT WORK
//     res.redirect(`http://${localip}:${port}`)
// })

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
})

app.get('/upload', (req, res) => {
    res.sendFile(__dirname + "/public/upload/index.html")
})

app.get('/UploadHistory', (req, res) => {
    const sniper = fs.readFileSync(__dirname + "/logs/upload_log.tmp")
    res.send(sniper)
})

app.post('/api/v1/upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let xclouduploadservice = req.files.xclouduploadservice;
    const FileName = crypto.randomUUID();
    xclouduploadservice.mv(`tmp_files/${FileName}${path.extname(xclouduploadservice.name)}`, function(err) {
    if (err)
        return res.status(500).send(err);
        WriteToUploadLog(req.ip, FileName, path.extname(xclouduploadservice.name))
        UpdateFiles()
        if (req.headers["user-agent"]) {
            res.redirect(`http://${localip}:${port}/files/${FileName}`);
        } else {
            res.json({ message: true, code: `http://${localip}:${port}/files/${FileName}` });
        }
    });
});

app.listen(port, () => {
    WriteLog(ip, SessionUUID, port)
    console.log(`Session UUID 🔐: ${SessionUUID}\n`);
    UpdateFiles()
    console.log(`XCloud HOME online 👍: http://${localip}:${port}`);
    console.log(`XCloud UPLOADER online 👍: http://${localip}:${port}/upload`);
    console.log(`XCloud FILES online 👍: http://${localip}:${port}/files/:id?`);
    console.log(`XCloud LOGS online 👍: http://${localip}:${port}/UploadHistory`);
    console.log(`XCloud SERVER STATUS online 👍: https://max:10000/sysinfo.cgi?xnavigation=1`);
    console.log(`XCloud API online 👍: http://${localip}:${port}/api/v1/upload`);
})
