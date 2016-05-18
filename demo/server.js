var qiniu = require('qiniu');
var express = require('express');
var config = require('./config.js');
var app = express();
var ui="http://uid.wangcaibao.com/";
//var ui="http://tui.source3g.com:8989/";

app.configure(function() {
    app.use(express.static(__dirname + '/'));
});


app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(express.urlencoded());
app.use('/bower_components', express.static(__dirname + '/../bower_components'));
app.use('/src', express.static(__dirname + '/../src'));

app.get('/uptoken', function(req, res, next) {
    var token = uptoken.token();
    res.header("Cache-Control", "max-age=0, private, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    if (token) {
        res.json({
            status:true,
            data: token
        });
    }
});

app.post('/downtoken', function(req, res) {

    var key = req.body.key,
        domain = req.body.domain;

    //trim 'http://'
    if (domain.indexOf('http://') != -1) {
        domain = domain.substr(7);
    }
    //trim 'https://'
    if (domain.indexOf('https://') != -1) {
        domain = domain.substr(8);
    }
    //trim '/' if the domain's last char is '/'
    if (domain.lastIndexOf('/') === domain.length - 1) {
        domain = domain.substr(0, domain.length - 1);
    }

    var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
    var deadline = 3600 + Math.floor(Date.now() / 1000);

    baseUrl += '?e=' + deadline;
    var signature = qiniu.util.hmacSha1(baseUrl, config.SECRET_KEY);
    var encodedSign = qiniu.util.base64ToUrlSafe(signature);
    var downloadToken = config.ACCESS_KEY + ':' + encodedSign;

    if (downloadToken) {
        res.json({
            downtoken: downloadToken,
            url: baseUrl + '&token=' + downloadToken
        })
    }
});

app.get('/', function(req, res) {
    res.render('index.html', {
        domain: config.Domain,
        uptoken_url: config.Uptoken_Url
    });
});
//上传logo
app.get('/test', function(req, res) {
    res.render('test.html', {
        domain: config.Domain,
        uptoken_url: config.Uptoken_Url,
        ui:ui,
        version:new Date().getTime()
    });
});
//上传文件
app.get('/upload', function(req, res) {
    res.render('uploadfile.html', {
        domain: config.Domain,
        uptoken_url: config.Uptoken_Url,
        ui:ui,
        version:new Date().getTime()
    });
});
//文件列表
app.post('/list',function(req,res){
    var data={status:true,message:'成功',title: "根目录",id: "1",results:[]};
    var tempNum=parseInt(Math.random()*20),otherNum=tempNum-3;
    for(var i=0;i<tempNum;i++){
        var isFolder=i>otherNum?false:true;
        var img= ui+'advert/img/'+(i>otherNum?"success":"folder")+'.png';
        var name='文件'+(i>otherNum?'':'夹')+i;
        var tempObj={id: i+new Date().getTime(), folder: isFolder, img:img, name:name};
        data.results.push(tempObj)
    }
    res.json(data);
})
//保存文件
app.post('/save',function(req,res){
    var data={status:true,message:'成功'};
    res.json(data);
})
app.get('/multiple', function(req, res) {
    res.render('multiple.html', {
        domain: config.Domain,
        uptoken_url: config.Uptoken_Url
    });
});

qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.SECRET_KEY;

var uptoken = new qiniu.rs.PutPolicy(config.Bucket_Name);


app.listen(config.Port, function() {
    console.log('Listening on port %d', config.Port);
    console.log('http://demo.wangcaibao.com:'+config.Port);
});
