import { Router } from 'express';
import { PrismaClient } from '@prisma/client'
import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

router.get("/", async(req, res, next) => {
    const date = new Date(req.query.date!.toString());
    const codeProjectId = parseInt(req.query.projectId!.toString());
    date.setHours(0, 0, 0);

    const dateplus = new Date(date);
    dateplus.setDate(dateplus.getDate() + 1);
    dateplus.setHours(0, 0, 0);

    const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    prisma.$transaction([
        prisma.codeReport.findMany({
            where:{
                CodeProjectId: codeProjectId,
                CreatedDate: {
                    gte: new Date(date),
                    lt: new Date(dateplus)
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
                                                    text: new Date(date).getDate() + " " + month[new Date(date).getMonth()] + " " + new Date(date).getFullYear(),
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
            text: "D. Laporan Perkembangan",
            fontSize: 11,
            margin: [0, 10, 0, 0],
            bold: true
        })

        let progressReportCount = 0;
        const progressReportTable: any[] = [];
        result[0].filter(x => x.Type == 7).forEach(report => {
            const stack:any[] = [
                {
                    text: report.User.FirstName + " " + report.User.LastName,
                    fontSize:10,
                    bold: true,
                    margin:[0, 10, 0, 10]
                },
                {
                    text: report.CreatedDate.getHours() + ":" + report.CreatedDate.getMinutes(),
                    fontSize:8,
                    bold: false
                },
                {
                    text: report.StatusReport?.Status,
                    fontSize:10,
                    bold: false
                }

            ]

            const images: any[] = [];
            report.StatusReport?.StatusReportImage.forEach(image => {
                images.push({
                    image: path.join(__dirname, '../img/' + image.ImageUrl),
                    width: 150,
                    margin:[0, 10, 0, 10]
                })
            })

            progressReportTable.push({
                columns:[
                    {
                        width:150,
                        stack: images
                    },
                    {
                        width:"*",
                        stack: stack
                    }
                ],
                columnGap: 10
            })

            progressReportCount++;
        })

        if(progressReportCount > 0){
            content.push(progressReportTable)
        } else {
            content.push({
                text: "Tidak ada laporan perkembangan.",
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
})

export default router;