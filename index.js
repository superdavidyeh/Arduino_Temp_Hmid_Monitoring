var setting = require('./models/setting');
var DHT11 = require('./models/dht11');  // 引用models路徑中的dht11模組
var express = require('express');        // 引用node_modules路徑裡的express套件
var app = express();
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
 
var transporter = nodemailer.createTransport(smtpTransport ({
  host: setting.MAIL_URL,
  secureConnection: true,
  port: 25,
  secure:false,
  tls: {rejectUnauthorized: false},
  ignoreTLS: false,

}));

var aio = require('asterisk.io'),
    ami = null;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


//RFID
app.get("/rfid", function(req, res) {
//DHT資料偵測錯誤
  var cardno = req.query.cardno;
  console.log("UID卡號：" + cardno);
  res.send("UID卡號：" + cardno);
  });



app.get("/err", function(req, res) {
//DHT資料偵測錯誤
  var pin = req.query.p;
  console.log("錯誤 !!PIN:" + pin + " 沒收到資料！");
    res.send("資料有誤 !!");
    //sendmail
    var mailOptions = {
      from: 'tech.admin@mpi.com.tw', 
      to: setting.MAIL_To,
      subject: 'SOS !!監控系統異常通知 !!', // Subject line
      text: 'Dear Manager, PIN NO=' + pin + '  Sensor is crashed !' // html body
    };
    transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
    });
});


app.get("/th", function(req, res) {
//  console.log('req=',req);
  var pin = req.query.p;
  var temp = req.query.t;    // 讀取查詢字串的t（溫度）值
  var humid = req.query.h;  // 讀取查詢字串的h（濕度）值
	console.log('temp:' + temp + '    humid:'+humid);
	  if (temp > 50 ){
	    console.log('Temp Over 50 !!');

	        ami = aio.ami(
	          setting.SIP_Server,// Asterisk PBX machine 
	          5038,               // the default port number setup 
	                                // in "/etc/asterisk/manager.conf" 
	                                // in "general" section 
	          'tech.admin',            // manager username 
	         
	          'Cz61@admin'             // manager password 
	        );
	        ami.on('error', function(err){
	            console.log('Error',err);
	            throw err;
	        });

	      ami.on('ready', function(){
	          ami.action(
	              'Originate',
	              {
	                  Channel: 'SIP/6501',
	                  Context: 'default',
	                  Priority: 1,
	                  Async: 'true',     // set Async to 'false' to get response in the callback function 
	                  CallerID: 'SOS',
	                  Exten: setting.SOS_NO
	              },
	              function(data){
	                  if(data.Response == 'Error'){
	                      console.log('Originate', data.Message);
	                      return;
	                  }
	                  console.log('Originate', data.Message);
	              }
	          );
	      });
	  }

	var data = new DHT11({ 'pin' : pin, 'temp': temp, 'humid': humid });  // 依據模型建立資料
	data.save(function (err) {  // 儲存資料，回呼函式將接收錯誤訊息。
	  if (err) {             // 如果err有值，代表儲存過程出現問題。
	    console.log('SAVE ERROR～');
	  } else {
	    console.log('pin' + pin + ' SAVE Success !');
	    // 在網頁上顯示接收到的溫濕度值
	    res.send("腳位:" + pin +" ，溫度: " + temp + "&deg;C，濕度： " + humid +"%");
	  }
	});

});

var A2Fdata="",A4Fdata="",D4Fdata="",XP1Fdata="";//B棟二樓機房(pin:1)、B棟四樓機房(pin:2)、二廠四樓機房(pin:3)、新埔一樓機房(pin:4)
app.get("/", function(req, res) {
  //查詢A2F機房溫溼度
    DHT11.find({pin:1})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .exec(function(err, A2F) {
      if(A2F.length > 0){
        A2Fdata=A2F[0].temp + '°C '+ A2F[0].humid + '%';
        console.log('機房A2F溫濕度:' + A2Fdata);
      }else{
        A2Fdata='暫無資料';
        console.log('機房A2F溫濕度:' + A2Fdata);        
      }
    });

  //查詢A4F機房溫溼度
    DHT11.find({pin:2})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .exec(function(err, A4F) {
      if(A4F.length > 0 ){
        A4Fdata=A4F[0].temp + '°C '+ A4F[0].humid + '%';
        console.log('機房A4F溫濕度:' + A4Fdata);
      }else{
        A4Fdata='暫無資料';
        console.log('機房A4F溫濕度:' + A4Fdata);
      }
    });

  //查詢D4F機房溫溼度
    DHT11.find({pin:3})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .exec(function(err, D4F) {
      if(D4F.length >0){
        D4Fdata=D4F[0].temp + '°C '+ D4F[0].humid + '%';
        console.log('機房D4F溫濕度:' + D4Fdata);
      }else{
        D4Fdata='暫無資料';
        console.log('機房D4F溫濕度:' + D4Fdata);
      }
    });

  //查詢新埔機房溫溼度
    DHT11.find({pin:4})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .exec(function(err, XP1F) {
    if(XP1F.length >0){
      XP1Fdata=XP1F[0].temp + '°C '+ XP1F[0].humid + '%';
      console.log('新埔機房溫濕度:' + XP1Fdata);
    }else{
      XP1Fdata='暫無資料';
      console.log('新埔機房溫濕度:' + XP1Fdata);
    }
    });

  //console.log('2 -> 機房A2F溫濕度:' + A2Fdata);
  DHT11.find({})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .limit(20)
    .exec(function(err, data) {
         res.render('table', {docs:data,A2F:A2Fdata,A4F:A4Fdata,D4F:D4Fdata,XP1F:XP1Fdata});
       });
});

app.get("/room", function(req, res) {
  var pin = req.query.pin;

  //查詢A2F機房溫溼度
    DHT11.find({pin:1})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .exec(function(err, A2F) {
      if(A2F.length > 0){
        A2Fdata=A2F[0].temp + '°C '+ A2F[0].humid + '%';
        console.log('機房A2F溫濕度:' + A2Fdata);
      }else{
        A2Fdata='暫無資料';
        console.log('機房A2F溫濕度:' + A2Fdata);        
      }
    });

  //查詢A4F機房溫溼度
    DHT11.find({pin:2})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .exec(function(err, A4F) {
      if(A4F.length > 0 ){
        A4Fdata=A4F[0].temp + '°C '+ A4F[0].humid + '%';
        console.log('機房A4F溫濕度:' + A4Fdata);
      }else{
        A4Fdata='暫無資料';
        console.log('機房A4F溫濕度:' + A4Fdata);
      }
    });

  //查詢D4F機房溫溼度
    DHT11.find({pin:3})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .exec(function(err, D4F) {
      if(D4F.length >0){
        D4Fdata=D4F[0].temp + '°C '+ D4F[0].humid + '%';
        console.log('機房D4F溫濕度:' + D4Fdata);
      }else{
        D4Fdata='暫無資料';
        console.log('機房D4F溫濕度:' + D4Fdata);
      }
    });

  //查詢新埔機房溫溼度
    DHT11.find({pin:4})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .exec(function(err, XP1F) {
    if(XP1F.length >0){
      XP1Fdata=XP1F[0].temp + '°C '+ XP1F[0].humid + '%';
      console.log('新埔機房溫濕度:' + XP1Fdata);
    }else{
      XP1Fdata='暫無資料';
      console.log('新埔機房溫濕度:' + XP1Fdata);
    }
    });

  //console.log('2 -> 機房A2F溫濕度:' + A2Fdata);
  DHT11.find({pin:pin})
    .select('-_id -__v')
    .sort({'ldate': -1})
    .limit(20)
    .exec(function(err, data) {
         res.render('table', {docs:data,A2F:A2Fdata,A4F:A4Fdata,D4F:D4Fdata,XP1F:XP1Fdata});
       });
});



app.get("/showall", function(req, res) {
  DHT11.find().select('-_id -__v').sort({'ldate': -1})
       .exec(function(err, data) {
         res.render('table1', {docs:data});
       });
});


app.get("/setting", function(req, res) {
  //console.log('SETTING :' + setting.MAIL_URL);
	res.render('setting', {setting:{"MAIL_URL":setting.MAIL_URL,"MAIL_To":setting.MAIL_To,"SIP_Server":setting.SIP_Server,"SOS_NO":setting.SOS_NO}});
});


app.listen(80,function(req,res){
  console.log("port 80 is work !");
});
