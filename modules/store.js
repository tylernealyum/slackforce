"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    STORE_TOKEN = process.env.SLACK_STORE_TOKEN;

exports.execute = (req, res) => {

    if (req.body.token != STORE_TOKEN) {
        console.log("Invalid token");
        res.send("Invalid token");
        return;
    }

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        q = "SELECT Id, Name, Owner_Type__c, Opening_Date__c FROM Store__c WHERE Name LIKE '%" + req.body.text + "%' LIMIT 5";

    force.query(oauthObj, q)
        .then(data => {
            let stores = JSON.parse(data).records;
            if (stores && stores.length>0) {
                let attachments = [];
                stores.forEach(function(store) {
                    let fields = [];
                    fields.push({title: "Store Number", value: store.Name, short:true});
                    fields.push({title: "Owner Type", value: store.Owner_Type__c, short:true});
                    fields.push({title: "Opening Date", value: store.Opening_Date__c, short:true});
                    fields.push({title: "Open in Salesforce:", value: oauthObj.instance_url + "/" + store.Id, short:false});
                    attachments.push({color: "#7F8DE1", fields: fields});
                });
                res.json({"response_type": "in_channel",text: "Stores matching '" + req.body.text + "':", attachments: attachments});
            } else {
                res.send("No records");
            }
        })
        .catch(error => {
            if (error.code == 401) {
                res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);
            } else {
                res.send("An error as occurred");
            }
        });
};
