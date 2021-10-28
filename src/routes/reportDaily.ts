import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';
import * as formidable from 'formidable';
import * as uuid from 'uuid';
import sharp from 'sharp';

const prisma = new PrismaClient();
const router = Router();

router.get("/images/:reportId", (req, res, next) => {
    const reportId = parseInt(req.params.reportId);
    prisma.dailyReportImage.findMany({
        where:{
            CodeReportId: reportId
        },
        select:{
            Id: true,
            ImageUrl: true,
            Caption: true
        }
    }).then(response => {
        res.status(200).json(response);
    }).catch(error => {
        res.status(500).json({
            "message": "Error on fetching daily report images."
        });

        throw new Error(error);
    })

    return res;
})

router.get("/:projectId/:date/:month/:year", async(req, res, next) => {
    const day = parseInt(req.params.date);
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);
    const codeProjectId = parseInt(req.params.projectId);

    const date = new Date(year, month - 1, day);
    date.setUTCHours(23, 59, 59);

    const dateplus = new Date(date);
    dateplus.setDate(dateplus.getDate() + 1);
    dateplus.setUTCHours(23, 59, 59);

    const monthArray = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    prisma.$queryRaw`
        SELECT * 
        FROM codeReport
        WHERE Type = 6
        AND IsDelete = 0
        AND CodeProjectId = ${codeProjectId}
        AND DAY(Date) = ${day}
        AND MONTH(Date) = ${month}
        AND YEAR(Date) = ${year}
    `.then(x => {
        if((x as any[]).length == 0){
            res.status(404).json({"message": "Daily report not created"});
        } else {
            prisma.$transaction([
                prisma.codeReport.findMany({
                    where:{
                        CodeProjectId: codeProjectId,
                        Date: {
                            gt: date,
                            lt: dateplus
                        },
                        IsDelete: false
                    },
                    include:{
                        Material: true,
                        Tool: true,
                        Worker: true,
                        Weather: true,
                        StatusReport: {
                            include:{
                                StatusReportImage: {
                                    select:{
                                        ImageUrl: true
                                    }
                                }
                            }
                        },
                        DailyReportImage: true,
                        User:true
                    }
                }),
                prisma.codeProject.findUnique({
                    where:{
                        Id: codeProjectId
                    }
                })
            ]).then(result => {
                let fonts = {
                    Roboto: {
                      normal: path.join(__dirname, '../img/assets/fonts/Roboto-Regular.ttf'),
                      bold: path.join(__dirname, '../img/assets/fonts/Roboto-Medium.ttf'),
                      italics: path.join(__dirname, '../img/assets/fonts/Roboto-Italic.ttf'),
                      bolditalics: path.join(__dirname, '../img/assets/fonts/Roboto-MediumItalic.ttf')
                    }
                  };
        
                let printer = new PdfPrinter(fonts);
        
                const toolTableContent = [];
                toolTableContent.push([ 
                    {
                        text:"Nama",
                        bold: true,
                        fontSize: 10
                    }, 
                    {
                        text:"Deskripsi",
                        bold: true,
                        fontSize: 10
                    }, 
                    {
                        text:"Jumlah",
                        bold: true,
                        fontSize: 10
                    }
                ]);
                result[0].filter(x => x.Type == 2).forEach(report => {
                    report.Tool.forEach(tool => {
                        toolTableContent.push([
                            {
                                text: tool.Name,
                                bold: false,
                                fontSize: 10
                            }, 
                            {
                                text: tool.Description,
                                bold: false,
                                fontSize: 10
                            }, 
                            {
                                text: tool.Quantity,
                                bold: false,
                                fontSize: 10
                            }
                        ])
                    })
                });
        
                const workerTableContent = [];
                workerTableContent.push([ 
                    {
                        text:"Nama",
                        bold: true,
                        fontSize: 10
                    }, 
                    {
                        text:"Jumlah",
                        bold: true,
                        fontSize: 10
                    }, 
                    {
                        text:"Waktu",
                        bold: true,
                        fontSize: 10
                    }
                ]);
                result[0].filter(x => x.Type == 1).forEach(report => {
                    report.Worker.forEach(worker => {
                        workerTableContent.push([
                            {
                                text: worker.Name,
                                bold: false,
                                fontSize: 10
                            }, 
                            {
                                text: worker.Quantity,
                                bold: false,
                                fontSize: 10
                            }, 
                            {
                                text: report.CreatedDate.getHours() + ":" + report.CreatedDate.getMinutes(),
                                bold: false,
                                fontSize: 10
                            }
                        ])
                    })
                });
        
                const content: any[] = [];
        
                content.push({
                    table: {
                        headerRows: 1,
                        widths: [ 100, '*'],
                        body:[
                            [
                                {
                                    border: [false, false, false, false],
                                    image: path.join(__dirname, "../img/assets/Kop.jpg"),
                                    width: 100, 
                                    height: 100,
                                },
                                {
                                    border: [false, false, false, false],
                                    stack:[
                                        { text:"LAPORAN HARIAN LAPANGAN", style: 'header'},
                                        {
                                            table: {
                                                layout: 'noBorders',
                                                body: [
                                                    [
                                                        {
                                                            border: [false, false, false, false],
                                                            text: "Proyek",
                                                            bold: false,
                                                            fontSize: 10,
                                                            fillColor: "#ffffff"
                                                        },
                                                        {
                                                            border: [false, false, false, false],
                                                            text: result[1]!.Name,
                                                            bold: false,
                                                            fontSize: 10,
                                                            fillColor: "#ffffff"
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            border: [false, false, false, false],
                                                            text: "Lokasi Proyek",
                                                            bold: false,
                                                            fontSize: 10,
                                                            fillColor: "#ffffff"
                                                        },
                                                        {
                                                            border: [false, false, false, false],
                                                            text: result[1]!.Address,
                                                            bold: false,
                                                            fontSize: 10,
                                                            fillColor: "#ffffff"
                                                        }
                                                    ],
                                                    [
                                                        {
                                                            border: [false, false, false, false],
                                                            text: "Hari / Tanggal",
                                                            bold: false,
                                                            fontSize: 10,
                                                            fillColor: "#ffffff",
                                                            
                                                        },
                                                        {
                                                            border: [false, false, false, false],
                                                            text: day + " " + monthArray[month - 1] + " " + year,
                                                            bold: false,
                                                            fontSize: 10,
                                                            fillColor: "#ffffff"
                                                        }
                                                    ]
                                                ]
                                            },
                                        }
                                    ]
                                }
                            ]
                        ],
                        layout: {
                            hLineWidth: function(i: number, node: any) {
                                return (i !== node.table.body.length) ? 0 : 2;
                            },
                            hLineStyle: (i: number, node: any) => {
                                if (i != node.table.body.length) {
                                    return null;
                                }
                                return {dash: {length: 10, space: 4}};
                            },
                        }
                    }
                    
                })
        
                content.push({
                    text: "A. Peralatan",
                    fontSize: 11,
                    margin: [0, 10, 0, 0],
                    bold: true
                })
        
                if(toolTableContent.length > 1){
                    content.push({
                        layout: 'lightHorizontalLines',
                        table: {
                            headerRows: 1,
                            widths: [ 200, '*', 100],
                            body:toolTableContent,
                            margin: [0, 10, 0, 10]
                        }
                    })
                } else {
                    content.push({
                        text:"Tidak ada laporan peralatan.",
                        fontSize: 10,
                        margin: [0, 10, 0, 10],
                        bold: false
                    })
                }
                
                content.push({
                    text: "B. Pekerja",
                    fontSize: 11,
                    margin: [0, 10, 0, 0],
                    bold: true
                })
        
                if(workerTableContent.length > 1){
                    content.push({
                        layout: 'lightHorizontalLines',
                        table: {
                            headerRows: 1,
                            widths: [ 200, '*', 100],
                            body:workerTableContent,
                            margin: [0, 10, 0, 10]
                        }
                    })
                } else {
                    content.push({
                        text: "Tidak ada laporan pekerja.",
                        bold: false,
                        fontSize: 10,
                        margin: [0, 10, 0, 10]
                    })
                }
        
                content.push({
                    text: "C. Cuaca",
                    fontSize: 11,
                    margin: [0, 10, 0, 0],
                    bold: true
                })
        
                const weatherTableContent: any[] = [];
                weatherTableContent.push([ 
                    {
                        text:"Cuaca",
                        bold: true,
                        fontSize: 10
                    },
                    {
                        text:"Waktu",
                        bold: true,
                        fontSize: 10
                    }
                ]);
        
                result[0].filter(x => x.Type == 4).forEach(report => {
                    const weather = report.Weather?.WeatherId;
                    if(weather == 1){
                        weatherTableContent.push([
                            {
                                text:"Cuaca cerah",
                                bold: false,
                                fontSize: 10
                            },
                            {
                                text:report.CreatedDate.getHours() + ":" + report.CreatedDate.getMinutes(),
                                bold: false,
                                fontSize: 10
                            }
                        ])
                    } else {
                        weatherTableContent.push([
                            {
                                text:"Cuaca hujan",
                                bold: false,
                                fontSize: 10
                            },
                            {
                                text:report.CreatedDate.getHours() + ":" + report.CreatedDate.getMinutes(),
                                bold: false,
                                fontSize: 10
                            }
                        ])
                    }
                });
        
                if(weatherTableContent.length > 1){
                    content.push({
                        layout: 'lightHorizontalLines',
                        table: {
                            headerRows: 1,
                            widths: [ "*", 100],
                            body:weatherTableContent,
                            margin: [0, 10, 0, 10]
                        }
                    })
                } else {
                    content.push({
                        text: "Tidak ada laporan cuaca.",
                        bold: false,
                        fontSize: 10,
                        margin: [0, 10, 0, 10]
                    })
                }
        
                content.push({
                    text: "D. Laporan Dokumentasi",
                    fontSize: 11,
                    margin: [0, 10, 0, 0],
                    bold: true
                })
        
                const dailyReportTable: any[] = [];
                const images: any[] = [];
                result[0].filter(x => x.Type == 6).forEach(report => {
                    report.DailyReportImage.forEach(dailyReport => {
                        console.log(dailyReport);
                        images.push({
                            image: path.join(__dirname, '../img/' + dailyReport.ImageUrl),
                            width: 150,
                            margin: [0, 10, 0, 10],
                            text: dailyReport.Caption
                        });
                    });
                });

                let columns: any[] = [];

                images.forEach((item, index) => {
                    let stack = [{
                        stack:[{
                            image: item.image,
                            width:150,
                        },
                        item.text
                    ]
                    }]

                    if(index %2 == 0){
                        columns = [stack];
                    } else {
                        columns.push(stack);
                    }

                    if(index%2 != 0 || index == (images.length - 1)){
                        dailyReportTable.push({columns: columns});
                        columns = [];
                    }
                })
        
                if(images.length > 0){
                    content.push(dailyReportTable)
                } else {
                    content.push({
                        text: "Tidak ada dokumentasi terlampir.",
                        bold: false,
                        fontSize: 10,
                        margin: [0, 10, 0, 10]
                    })
                }
                
        
                var docDefinition = {
                    content: content,
                    styles: {
                        header: {
                            fontSize: 22,
                            bold: true
                        },
                        defaultStyle: {
                            fontSize: 10,
                            bold: false
                        }
                    }
                };
        
                let doc = printer.createPdfKitDocument(docDefinition);
                doc.pipe(fs.createWriteStream('output.pdf'));
        
                doc.end();
                res.setHeader('Content-type', 'application/pdf')
                res.setHeader('Content-disposition', 'inline; filename="DailyReport.pdf"')
        
                doc.pipe(res);
            }).catch(error => {
                throw error;
            })
        }
    })
})

router.get("/check/:projectId/:date/:month/:year", async(req, res, next) => {
    const projectId = parseInt(req.params.projectId);
    const date = parseInt(req.params.date);
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    prisma.$queryRaw`
        SELECT id 
        FROM codeReport 
        WHERE CodeProjectId = ${projectId} 
        AND DAY(CreatedDate) = ${date} 
        AND MONTH(CreatedDate) = ${month} 
        AND YEAR(CreatedDate) = ${year} 
        AND IsDelete = 0 
        AND Type = 6`
    .then(result => {
        if((result as any[]).length > 0){
            res.status(500).json({"message": "Dailiy report already created"});
        } else {
            res.status(200).json({"message": "Daily report has not been created"});
        }
    }).catch(e => {
        throw new Error("Dailiy report already created");
    })
    
    return res;
})

router.get("/getImages/:projectId/:date/:month/:year", async(req, res, next) => {
    const projectId = parseInt(req.params.projectId);
    const date = parseInt(req.params.date);
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    prisma.$queryRaw`
        SELECT statusReportImage.ImageUrl, statusReportImage.Name, statusReport.Status 
        FROM statusReportImage 
        JOIN statusReport ON statusReportImage.StatusReportId = statusReport.Id 
        JOIN codeReport ON statusReport.CodeReportId = codeReport.Id
        WHERE codeReport.CodeProjectId = ${projectId} 
        AND DAY(codeReport.CreatedDate) = ${date} 
        AND MONTH(codeReport.CreatedDate) = ${month} 
        AND YEAR(codeReport.CreatedDate) = ${year} 
        AND IsDelete = 0 
        AND Type = 7`.then(result => {
            console.log(result);
        res.status(200).json(result);
    }).catch(e => {
        throw new Error(e.message);
    })
    
    return res;
})

router.post("/:projectId/:date/:month/:year", (req, res, next) => {
    const projectId = parseInt(req.params.projectId);
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });

    const date = parseInt(req.params.date);
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    form.parse(req, function(err, fields, files) {
        const fileLength    = parseInt(fields.Files.toString());
        const createdBy     = fields.CreatedBy.toString();

        prisma.user.findUnique({
            where:{
                Email: createdBy
            }
        }).then(user => {
            prisma.codeReport.create({
                data:{
                    CodeProjectId: projectId,
                    CreatedBy: user!.Id,
                    CreatedDate: new Date(),
                    Date: new Date(Date.UTC(year, (month - 1), date, 0, 0, 0, 0)),
                    Type: 6,
                    Note: ""
                }
            }).then(report => {
                if(fileLength > 0){
                    let i = 0;
                    while(i < fileLength){
                        const file = files["File[" + i + "]"] as formidable.File;
                        const caption = (fields["Caption[" + i + "]"]).toString();

                        const fileNameArray = file!.name!.split(".");
                        const ext = fileNameArray[fileNameArray.length - 1];
                        const uid = uuid.v1();
        
                        sharp(file.path).resize({
                            fit: sharp.fit.contain,
                            width:640
                        }).toFile(path.join(__dirname, "../img/daily/", (uid + "." + ext))).then(() => {
                            prisma.dailyReportImage.create({
                                data:{
                                    CodeReportId: report.Id,
                                    ImageUrl:"daily/" + uid + "." + ext,
                                    Caption: caption,
                                }
                            }).then(() => {
                            }).catch(error => {
                                console.log(error);
                                return false;
                            })
                        })
                        
                        if(i == (fileLength - 1)){
                            res.status(200).json({message: "Daily Report created"});
                            const io = req.app.get('socketio')
                            io.emit('newDailyReport', {
                                projectId: projectId,
                                reportId: report.Id
                            })
                        }
        
                        i++;
                    }
                } else {
                    res.status(200).json({message: "Daily Report created"});
                    const io = req.app.get('socketio')
                    io.emit('newDailyReport', {
                        projectId: projectId,
                        reportId: report.Id
                    })
                }
            })
        }).catch(error => {
            res.status(500).json({"message": "Invalid user"});
        })
    });
})

router.put("/:reportId", (req, res, next) => {
    let projectId: number = 0;

    const reportId = parseInt(req.params.reportId);
    const form = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, "../tmp")
    });

    prisma.codeReport.findUnique({
        where:{
            Id: reportId
        }
    }).then(x => {
        projectId = x!.CodeProjectId;
    })

    form.parse(req, function(err, fields, files) {
        const fileLength    = parseInt(fields.Files.toString());
        const removeIds: number[]     = JSON.parse(fields.remove.toString()) as number[];

        if(removeIds.length > 0){
            prisma.$transaction([
                prisma.dailyReportImage.findMany({
                    where:{
                        Id:{
                            in: removeIds
                        }
                    }
                }),
                prisma.dailyReportImage.deleteMany({
                    where:{
                        Id: {
                            in:removeIds
                        }
                    }
                })
            ]).then(response => {
                response[0].forEach(image => {
                    fs.unlinkSync(path.join(__dirname, "../img/", image.ImageUrl));
                });
            })
        }

        prisma.dailyReportImage.findMany({
            where:{
                CodeReportId: reportId
            }
        }).then(dailyReportImages => {
            dailyReportImages.forEach(dailyReportImage => {
                prisma.dailyReportImage.update({
                    where:{
                        Id: dailyReportImage.Id
                    },
                    data:{
                        Caption: fields[`EditCaption[${dailyReportImage.Id}]`].toString()
                    }
                })
            })
        })

        if(fileLength == 0){
            res.status(200).json({message: "Daily Report edited"});
        } else {
            let i = 0;
            while(i < fileLength){
                const file = files["File[" + i + "]"] as formidable.File;
                const caption = (fields["Caption[" + i + "]"]).toString();

                const fileNameArray = file!.name!.split(".");
                const ext = fileNameArray[fileNameArray.length - 1];
                const uid = uuid.v1();

                sharp(file.path).resize({
                    fit: sharp.fit.contain,
                    width:640
                }).toFile(path.join(__dirname, "../img/daily/", (uid + "." + ext))).then(() => {
                    prisma.dailyReportImage.create({
                        data:{
                            CodeReportId: reportId,
                            ImageUrl:"daily/" + uid + "." + ext,
                            Caption: caption
                        }
                    }).then(() => {
                    }).catch(error => {
                        res.status(500).json({"message": "Edit daily report error"});
                        throw new Error(error);
                    })
                })
                
                if(i == (fileLength - 1)){
                    res.status(200).json({message: "Daily Report edited"});
                    const io = req.app.get('socketio')
                    io.emit('editDailyReport', {
                        projectId: projectId,
                        reportId: reportId
                    })
                }

                i++;
            }
        }
    });

    return res;
})

export default router;