'use strict';

import * as dynamoDbLib from "./libs/dynamodb-lib";
import {success, failure} from "./libs/response-lib";

const yelp = require('yelp-fusion');


// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const apiKey = 'SyNrWsvHdmHSxpEd3TYoxKeskyGRIjfT2A_nxMiaMwTGP6atCXK2Bub-2fIRSGeJP-t5QNkXeCC2-TPgFESIwkIcs2ybyHAE8DsJx-oMmHGvtB-gzuqRTiRAVhn6WnYx';

export async function main(event, context, callback) {
    const params = {
      TableName: "yelp_preferences",
      
      Key: {
          userid: event.requestContext.identity.cognitoIdentityId
      }
    };
    
    try {
        const result = await dynamoDbLib.call("get", params);
        
        if (result.Item) {
            const searchRequest = { 
                categories: 'restaurants',  
                latitude: result.Item.latitude,
                longitude: result.Item.longitude,
                radius: 10000,
                offset: Math.floor((Math.random() * 100) + 1),
                limit: 5,
                price: "2"
                
            };

            const client = yelp.client(apiKey);
            
            client.search(searchRequest).then(response => {
              var filtered = response.jsonBody.businesses.filter(business => business['rating'] >= 4 && business['review_count'] > 100);

              const firstResult = filtered[Math.floor(Math.random() * filtered.length)];
              
              callback(null, success(firstResult));
            }).catch(e => {
              callback(null, failure( { status: false, error: JSON.stringify(e) }));
            });
            
        } else {
            callback(null, failure({status: false, error: "Item not found." }));
        }
    } catch (e) {
        callback(null, failure( { status: false } ));        
    }
}