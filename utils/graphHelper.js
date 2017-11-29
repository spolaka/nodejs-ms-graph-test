const request = require('superagent');
var async = require('async');

function getUserData(accessToken, callback) {
  request
   .get('https://graph.microsoft.com/v1.0/me')
   .set('Authorization', 'Bearer ' + accessToken)
   .end((err, res) => {
     callback(err, res);
   });
}


function fetchUsers(reqUrl , accessToken , resArray) {
  getUsers(reqUrl, accessToken , resArray , function(resUrl , accessToken , resUsers) {
    if (resUrl != undefined && resUrl.length > 0) fetchUsers(resUrl , accessToken , resUsers);
    else return;
  });
}


function getUsers(reqUrl, accessToken , resArray , callback) {
  request
  .get(reqUrl)
   .set('Authorization', 'Bearer ' + accessToken)
   .end((err, res) => {
     if(!err){
         console.log(res.body);
         async.forEachSeries(res.body.value, function(s , tcallback) {
             if(s.userPrincipalName.endsWith("@altair.com")){
               resArray.push(s.userPrincipalName);
             };
             tcallback();
          }, function(err) {
            reqUrl = res.body['@odata.nextLink'];
            console.log(reqUrl);
            callback(reqUrl , accessToken , resArray);
          });

      }
      else{
        console.log(res);
      }
   });
}

function getAllUsers(accessToken , callback) {

  var reqUrl = "https://graph.microsoft.com/v1.0/users";
  var resArray = [];

  fetchUsers(reqUrl , accessToken , resArray);
  callback(resArray);
}


function postSendMail(accessToken, message, callback) {
  request
   .post('https://graph.microsoft.com/v1.0/me/sendMail')
   .send(message)
   .set('Authorization', 'Bearer ' + accessToken)
   .set('Content-Type', 'application/json')
   .set('Content-Length', message.length)
   .end((err, res) => {
     callback(err, res);
   });
}

exports.getUserData = getUserData;
exports.postSendMail = postSendMail;
exports.getAllUsers = getAllUsers;
