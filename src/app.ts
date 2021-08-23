import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

import auth from './middleware/auth';

import clientRoutes from './routes/client';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import reportWeather from './routes/reportWeather';
import reportWorker from './routes/reportWorker';
import reportMaterial from './routes/reportMaterial';
import reportTool from './routes/reportTool';
import reportDaily from './routes/reportDaily';

import project from './routes/project';
import reportStatus from './routes/reportStatus';
import userContactRoutes from './routes/userContact';
import projectDocumentRoutes from './routes/projectDocument';
import userPositionRoutes from './routes/userPosition';
import reportFeedRoutes from './routes/reportFeed';
import requestForInformationRoutes from './routes/requestForInformation';
import reportApprovalRoutes from './routes/reportApproval';
import donwloadRoutes from './middleware/download';

const app = express();
app.set("port", 3000);
app.use(cors())
// const allowedOrigins = [
//     'http://localhost:4200',
//     'http://app.aknsmartreport.com',
//     'http://www.app.aknsmartreport.com',
// ];

// const options: cors.CorsOptions = {
//     allowedHeaders: [
//       'Origin',
//       'X-Requested-With',
//       'Content-Type',
//       'Accept',
//       'X-Access-Token',
//     ],
//     credentials: false,
//     methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
//     origin: function (origin, callback) {
//         if (allowedOrigins.indexOf(origin!) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     },
//     preflightContinue: false,
//   };

// app.use(cors(options));

const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});
app.set('socketio', io);

app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'img')));

app.use('/auth', authRoutes);

app.use('/img/:folder/:file', (req, res, next) => {
    var filePath = path.join(__dirname, 'img', req.params.folder, req.params.file);
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'image/*',
        'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
});

app.use('/download/img/:folder/:file', (req, res, next) => {
    var filePath = path.join(__dirname, 'img', req.params.folder, req.params.file);
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'image/*',
        'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
});


app.use('/reportWeather', auth, reportWeather);
app.use('/reportMaterial', auth, reportMaterial);
app.use('/reportWorker', auth, reportWorker);
app.use('/reportTool', auth, reportTool);
app.use("/reportDaily", auth, reportDaily)

app.use('/reportStatus', auth, reportStatus);
app.use('/project', auth, project);
app.use('/client', auth, clientRoutes);
app.use('/user', auth, userRoutes);
app.use('/userContact', auth, userContactRoutes);
app.use('/projectDocument', auth, projectDocumentRoutes);
app.use('/userPosition', auth, userPositionRoutes);
app.use('/reportFeed', auth, reportFeedRoutes);
app.use('/rfi', auth, requestForInformationRoutes);
app.use('/reportApproval', auth, reportApprovalRoutes);
app.use('/download', auth, donwloadRoutes);

io.on("connection", function(socket: any) {
    console.log("a user connected");
});

http.listen(3000, function() {
    console.log("listening on *:3000");
});