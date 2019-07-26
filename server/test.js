
require('./bcx.node.js');
var http = require("http");
var url = require("url");
var querystring = require('querystring')
let bcx=new BCX({
    ws_node_list:[
        {url:"ws://47.93.62.96:8049",name:"Cocos - China - Xiamen"} ,
    ],
    networks:[
        {
            core_asset:"COCOS",
            chain_id:"7d89b84f22af0b150780a2b121aa6c715b19261c8b7fe0fda3a564574ed7d3e9" 
        }
    ], 
    faucet_url:"http://47.93.62.96:3000",
    auto_reconnect:false,
    check_cached_nodes_data:false                     
});

//登录官方账户
bcx.passwordLogin({
    account:"stgmaster",
    password:"12345678"
}).then(res=>{
    console.info("bcx passwordLogin res",res);
}); 


let server=http.createServer(function(request, response) {
    var pathname = url.parse(request.url);
    var query = querystring.parse(pathname.query); 
    if (pathname.pathname === '/trxToken') {
        //访问连接如http://***.***.***.***:8888/trxToken?to=test01&token=1
        //发放奖励
        bcx.transferAsset({
            toAccount:query.to,
            amount:query.token,
            assetId:"COCOS",
            memo:"Fly Reward"
        }).then(result=>{
            console.info('bcx transferAsset',result);
            response.writeHead(200, { 
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin":"*",//设置允许跨域的域名，*代表允许任意域名跨域
                "Access-Control-Allow-Headers":"content-type", //允许的header类型
                "Access-Control-Allow-Methods":"DELETE,PUT,POST,GET,OPTIONS" //跨域允许的请求方式 
            });
            response.write(JSON.stringify(result));
            response.end();
        })
    } 
}).listen(9999);





