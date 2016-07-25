"use strict";

let express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('./modules/slack-salesforce-auth'),
    contact = require('./modules/contact'),
    store = require('./modules/store'),
    account = require('./modules/account'),
    opportunity = require('./modules/opportunity'),
    _case = require('./modules/case'),
    whoami = require('./modules/whoami'),
    app = express();


app.enable('trust proxy');

app.set('port', process.env.PORT || 5000);

app.use('/', express.static(__dirname + '/www')); // serving company logos after successful authentication

app.use(bodyParser.urlencoded({extended: true}));

app.post('/pipeline', opportunity.execute);
app.post('/store', store.execute);
app.post('/contact', contact.execute);
app.post('/account', account.execute);
app.post('/case', _case.execute);
app.post('/whoami', whoami.execute);
app.post('/login', auth.loginLink);
app.get('/login/:slackUserId', auth.oauthLogin);
app.get('/oauthcallback', auth.oauthCallback);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
