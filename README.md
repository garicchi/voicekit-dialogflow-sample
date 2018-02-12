# voicekit-dialogflow-sample

response関数の完全版
```js
function response(con,replyCallback){
    let action = con.body.result.action;
    let param = con.body.result.parameters;
    let userSpeech = con.body.result.resolvedQuery;

    if(action==='gabage.get'){
        getGabage(SHEET_ID,SHEET_CRE,param.weekda)
        .then((value)=>{
            let msg = param.weekday+"は"+value+"ゴミの日です";
            speech = makeSimpleResponse(msg,msg);
            replyCallback(speech);
        })
        .catch((err)=>{
            speech = makeSimpleResponse("エラーが発生しました",makeErrorMessage(err,con.body));
            replyCallback(speech);
        });
    }
    if(action==='gabage.set'){
        setGabage(SHEET_ID,SHEET_CRE,param.weekday,param.gabage)
        .then(()=>{
            let msg = param.weekday+"に"+param.gabage+"ゴミを登録しました";
            speech = makeSimpleResponse(msg,msg);
            replyCallback(speech);
        })
        .catch((err)=>{
            speech = makeSimpleResponse("エラーが発生しました",makeErrorMessage(err,con.body));
            replyCallback(speech);
        });
    }
    
}
```
