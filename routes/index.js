
const express = require('express');
const router = express.Router();
const graphHelper = require('../utils/graphHelper.js');
const mangooseHelper = require('../utils/mongooseHelper.js');
const adminusers = require('../utils/adminusers.js');
const passport = require('passport');
var async = require('async');
// ////const fs = require('fs');
// ////const path = require('path');

// Get the home page.
router.get('/', (req, res) => {
  // check if user is authenticated
  if (!req.isAuthenticated()) {
    res.render('login');
  } else {
    if(adminusers.adminusers.includes(req.user.profile.emails[0].address)){
      renderAdminUI(req, res);
    }
    else{
      renderUserUI(req, res);
    }
  }
});

// Authentication request.
router.get('/login',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/');
    });

// Authentication callback.
// After we have an access token, get user data and load the sendMail page.
router.get('/token',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    (req, res) => {
      graphHelper.getUserData(req.user.accessToken, (err, user) => {
		    console.log(user.body);
        if (!err) {
          req.user.profile.displayName = user.body.displayName;
          req.user.profile.emails = [{ address: user.body.userPrincipalName }];
          var email = user.body.userPrincipalName;
          if(adminusers.adminusers.includes(email)){
              mangooseHelper.getAllActivityTypes( function(allActivities) {
                req.app.locals.allActivities  = allActivities;
                graphHelper.getAllUsers(req.user.accessToken , function(allUsers)  {
                  req.app.locals.allUsers  = allUsers;
                  renderAdminUI(req, res);
                });
              });

          }
          else{
            renderUserUI(req, res);
          }
        } else {
          renderError(err, res);
        }
      });
    });


function renderAdminUI(req, res) {
  res.render('adminUI', {});
}

function renderUserUI(req, res) {

  mangooseHelper.getActivityForUser(req.user.profile.emails[0].address , (err , Activities) => {
    if(err){
      console.log("Failed to get the Activities for the User");
    }
    else{
      var total_points = 0;
      var user_activities = [];
      async.forEachSeries(Activities, function(s, callback) {
        total_points += s.points;
        user_activities.push({activity_name : s.type ,
        activity_start_time: s.start_time ,
        activity_end_time: s.end_time ,
        activity_points: s.points});
        callback();
     }, function(err) {
         res.render('userUI', {
           display_name: req.user.profile.displayName,
           total_points: total_points,
           user_activities: user_activities
         });
     });
    }
  });
}

function renderaddActivityType(req, res) {
  res.render('addActivityType', {});
}

function renderaddActivity(req, res) {
  mangooseHelper.getAllActivityTypes((allActivities) => {
    req.app.locals.allActivities  = allActivities;
    res.render('addActivity', {
      all_users : req.app.locals.allUsers,
      all_activities : req.app.locals.allActivities
    });
  });
}

function renderredeemPoints(req, res) {
  mangooseHelper.getAllActivityTypes((allActivities) => {
    req.app.locals.allActivities  = allActivities;
    res.render('redeemPoints', {
      all_users : req.app.locals.allUsers
    });
  });
}


router.get('/addActivityType', (req, res) => {
  if (!req.isAuthenticated()) {
    res.render('login');
  } else {
    if(adminusers.adminusers.includes(req.user.profile.emails[0].address)){
      renderaddActivityType(req, res);
    }
    else{
      renderUserUI(req, res);
    }
  }
});

router.get('/addActivity', (req, res) => {
  if (!req.isAuthenticated()) {
    res.render('login');
  } else {
    if(adminusers.adminusers.includes(req.user.profile.emails[0].address)){
      renderaddActivity(req, res);
    }
    else{
      renderUserUI(req, res);
    }
  }
});

router.get('/redeemPoints', (req, res) => {
  if (!req.isAuthenticated()) {
    res.render('login');
  } else {
    if(adminusers.adminusers.includes(req.user.profile.emails[0].address)){
      renderredeemPoints(req, res);
    }
    else{
      renderUserUI(req, res);
    }
  }
});

router.post('/addActivityType', (req, res) => {
  if (!req.isAuthenticated() && adminusers.adminusers.includes(req.user.profile.emails[0].address)) {
    res.render('login');
  } else {
    const response = res;
    const templateData = {
      activity_type: req.body.activity_type,
      activity_default_points: req.body.activity_default_points
    };
    console.log(templateData);
    mangooseHelper.addActivityType( templateData.activity_type , templateData.activity_default_points , (err) => {
      if(err){
        console.log("Error Adding the Activity Type");
        console.log(err);
      }
      else{
        console.log("Activity Type Added successful");
        renderaddActivityType(req, res);
      }
    });
  }
});

router.post('/addActivity', (req, res) => {
  if (!req.isAuthenticated() && adminusers.adminusers.includes(req.user.profile.emails[0].address)) {
    res.render('login');
  } else {
    const response = res;
    const templateData = {
      all_users : req.app.locals.allUsers,
      all_activities : req.app.locals.allActivities,
      selected_activity : req.body.selected_activity,
      selected_email : req.body.selected_email,
      activity_start_time : req.body.activity_start_time,
      activity_end_time : req.body.activity_end_time,
      activity_points : req.body.activity_points
    };
    console.log(templateData);
    mangooseHelper.addActivity( templateData.selected_activity ,
      templateData.activity_start_time ,
      templateData.activity_end_time ,
      templateData.activity_points ,
      templateData.selected_email , (err) => {
      if(err){
        console.log("Error Adding the Activity");
        console.log(err);
      }
      else{
        console.log("Activity Added successful");
        renderaddActivity(req, res);
      }
    });
  }
});


router.post('/redeemPoints', (req, res) => {
  if (!req.isAuthenticated() && adminusers.adminusers.includes(req.user.profile.emails[0].address)) {
    res.render('login');
  } else {
    const response = res;
    const templateData = {
      all_users : req.app.locals.allUsers,
      selected_email : req.body.selected_email,
      redeem_points : req.body.activity_points
    };
    console.log(templateData);
    var now = new Date();
    mangooseHelper.addActivity( "Redeem Points" ,
      now ,
      now ,
      templateData.redeem_points * -1,
      templateData.selected_email , (err) => {
      if(err){
        console.log("Error Redeeming Points");
        console.log(err);
      }
      else{
        console.log("Redeeming Points successful");
        renderredeemPoints(req, res);
      }
    });
  }
});


router.get('/disconnect', (req, res) => {
  req.session.destroy(() => {
    req.logOut();
    res.clearCookie('graphNodeCookie');
    res.status(200);
    res.redirect('/');
  });
});

// helpers
function hasAccessTokenExpired(e) {
  let expired;
  if (!e.innerError) {
    expired = false;
  } else {
    expired = e.forbidden &&
      e.message === 'InvalidAuthenticationToken' &&
      e.response.error.message === 'Access token has expired.';
  }
  return expired;
}

function renderError(e, res) {
  e.innerError = (e.response) ? e.response.text : '';
  console.log(e);
 // res.render('error', {
 //   error: e
 // });
}

module.exports = router;
