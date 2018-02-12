const GoogleSpreadsheet = require('google-spreadsheet');
const http = require('http');
const fs = require('fs');

const SHEET_CRE = JSON.parse(fs.readFileSync('spread_sheet.json'));
//自分のGoogleSpreadSheetのIDに置き換える
const SHEET_ID = '{{ your google spread sheet id }}';

// fullfillment webhookが来た時にどのような応答を返すかを定義する
function response(con,replyCallback){
    let action = con.body.result.action;  //アクション名
    let param = con.body.result.parameters; //パラメータ
    let userSpeech = con.body.result.resolvedQuery; //ユーザーの発話

    /* DialogFlowのaction名で応答の種類を分類する
    if(action==='gabage.get'){
        // makeSimpleResponseで応答を生成してreplyCallbackに渡すことで応答を返す
        let msg = "応答文";
        speech = makeSimpleResponse();
        replyCallback(speech);
    }
    */   
}

// httpserverを起動してDialogFlowからWebhookを受け取れるようにする
http.createServer((req, res) => {
    Promise.resolve({
        req:req,
        res:res
    })
    .then((con)=>getBody(con))
    .then((con)=>response(con,function(s){
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(s));
    }));
    
}).listen(process.env.PORT || 3000);

function getGabage(sheetId,credentials,weekday){
    return new Promise((resolve,reject)=>{
        authentication(sheetId,credentials)
        .then((gss)=>getSheets(gss))
        .then((sheets)=>{
            sheet = sheets.worksheets[0];
            return findCell(sheet,1,weekday); 
        })
        .then((cell)=>getCell(sheet,cell['row'],2))
        .then((cell)=>{
            resolve(cell['value']);
        })
        .catch((err)=>{
            reject(err);
        });

    });
}

function setGabage(sheetId,credentials,weekday,val){
    return new Promise((resolve,reject)=>{
        authentication(sheetId,credentials)
        .then((gss)=>getSheets(gss))
        .then((sheets)=>{
            sheet = sheets.worksheets[0];
            return findCell(sheet,1,weekday); 
        })
        .then((cell)=>getCell(sheet,cell['row'],2))
        .then((cell)=>{
            cell.setValue(val,()=>{
                resolve();
            });
        })
        .catch((err)=>{
            reject(err);
        });

    });
}

function authentication(sheetId,credentials){
    return new Promise((resolve,reject)=>{
        let gss = new GoogleSpreadsheet(sheetId);
        gss.useServiceAccountAuth(credentials, (err) => {
            if (!err) {
                resolve(gss);
            } else {
                reject(err);
            }
        });
    });
}

function getSheets(gss){
    return new Promise((resolve, reject) => {
        gss.getInfo((err, data) => {
            if (!err) {
                resolve(data);
            } else {
                reject(err);
            }
        });
    });
}

function findCell(sheet,col_index,value){
    return new Promise((resolve,reject)=>{
        new Promise((resolve,reject)=>{
            sheet.getCells({},(err,cells)=>{
                if(!err){
                    resolve(cells);
                }else{
                    reject(err);
                }
            })
        })
        .then((cells)=>{
            let isFind = false;
            cells.forEach((cell)=>{
                if(cell['col']==col_index){
                    if(cell['value']===value){
                        resolve(cell);
                        isFind = true;
                    }
                }
            });
            if(!isFind){
                reject('cannot find cell');
            }
        })
        .catch((err)=>{
            reject(err);
        });
        
    });
}

function getCell(sheet,row_index,col_index){
    return new Promise((resolve,reject)=>{
        sheet.getCells({},(err,cells)=>{
            if(err){
                reject(err);
            }
            let isFind = false;
            cells.forEach((cell)=>{
                if(cell['col']==col_index&&cell['row']==row_index){
                    resolve(cell);
                }
            });
            if(!isFind){
                reject('cannot find cell');
            }
        });
    });
}


function makeSimpleResponse(speech,displayText){
    return {
        speech:speech,
        displayText:displayText
    }
}

function makeLinkResponse(speech,displayText,url,label){
    return {
        messages: [
            {
                displayText: displayText,
                platform: "google",
                textToSpeech: speech,
                type: "simple_response"
            },
            {
                destinationName: label,
                platform: "google",
                type: "link_out_chip",
                url: url
              }
          ]
    }
}

function makeErrorMessage(err,body){
    return "エラーが発生しました "+"["+err+"] "+JSON.stringify(body.result,null," ");
}

function getBody(con){
    return new Promise((resolve,reject)=>{
        let body = '';
        con.req.on('data', function (data) {
            body += data;
        });
        con.req.on('end', function () {
            if(body!==''){
                con.body = JSON.parse(body);
            }else{
                con.body = {};
            }
            resolve(con);
        });
    });
}