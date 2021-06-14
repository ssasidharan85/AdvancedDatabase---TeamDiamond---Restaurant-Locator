const neo4j = require('neo4j-driver');
const driver = neo4j.driver("bolt://localhost:7687/neo4j", neo4j.auth.basic("neo4j", "123456"));
const session = driver.session({ database: 'neo4j',defaultAccessMode: neo4j.session.READ });

const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = 'mongodb://localhost:27017/RestaurantLocator';

module.exports = {

  // 1. Create Promotional Offer
  query1 : async () => {
    session
    .run("MATCH (u1:User {name: $uname}) -[:NOT_ATTENDED|:INTERESTED_IN] -> (e1:Event) -[:EVENT_TYPE] -> (l1) MATCH (r1:Restaurant) -[:HAS_EVENT] -> (e2:Event) -[:EVENT_TYPE] -> (l1)WHERE e2.fromDate > e1.fromDate RETURN DISTINCT r1.name AS Restaurant, e2.id AS Event_Id,e2.fromDate AS From_Date, e2.toDate AS To_Date, l1.name AS Event_Type ORDER BY e2.fromDate",{uname: 'Ginger'})
    .then(function(resp){
      console.log("UPCOMING EVENTS")
      console.log("+++++++++++++++")
      resp.records.forEach(function(val){
        console.log("Restaurant : "+val._fields[0])
        console.log("From date  : "+val._fields[2])
        console.log("To date    : "+val._fields[3])
        console.log("Event Type : "+val._fields[4])
        console.log("================================")

        MongoClient.connect(url,{useNewUrlParser: true,useUnifiedTopology: true},(err,client) =>{
          if (err) throw err;
          const db = client.db("RestaurantLocator");
          const cursor= db.collection('events').find({event_id:val._fields[1]});
          cursor.forEach (function(doc) {    
            console.log("EVENTS DETAILED INFORMATION")
            console.log("+++++++++++++++++++++++++++") 
            console.log("Event Id          : " + doc.event_id);
            console.log("Event Type        : " + doc.event_type);
            console.log("From Date         : " + doc.from_date);
            console.log("To Date           : " + doc.to_date);
            console.log("Event Description : " + doc.text);
          });           
        });
          
      });
    })
    .catch(function(err){
      console.log(err);
    }); 
  },

  // 2. Find most influential reviewers
  query2 : async () => {
    session
    .run("CALL gds.alpha.degree.stream('cypher') YIELD nodeId, score RETURN gds.util.asNode(nodeId).id AS User_Id, gds.util.asNode(nodeId).name AS User, score AS Popularity_Degree ORDER BY Popularity_Degree DESC")
    .then(function(resp){
      console.log("MOST INFLUENTIAL REVIEWERS")
      console.log("++++++++++++++++++++++++++")
      resp.records.forEach(function(val){
        console.log("User            : "+val._fields[1])
        console.log("User Popularity : "+val._fields[2])
        console.log("============================")

        MongoClient.connect(url,{useNewUrlParser: true,useUnifiedTopology: true},(err,client) =>{
          if (err) throw err;
          const db = client.db("RestaurantLocator");
          const cursor= db.collection('users').find({user_id:val._fields[0]});
          cursor.forEach (function(doc) {    
            console.log("INFLUENTIAL REVIEWERS DETAILED INFORMATION")
            console.log("++++++++++++++++++++++++++++++++++++++++++")
            console.log("User Id       : " + doc.user_id);
            console.log("User          : " + doc.name);
            console.log("Member Since  : " + doc.member_since);
            console.log("Average Stars : " + doc.average_stars);  
          });           
        }); 
          
      });
    })
    .catch(function(err){
      console.log(err);
    });
  },

  // 3a. Find restaurants nearest to my street.
  query3a : async () => {
    session
    .run("MATCH poipath = (c1:Crossroad {name: $cname})-[r:ROAD*0..3]->(c2:Crossroad)-->(p:Restaurant)WITH c1, p, reduce(total=0, h in relationships(poipath) | total + h.cost) as totalCost WITH c1, p.id as Restaurant_Id, p.name as Restaurant,p.cuisine as Cuisine, min(totalCost) as minCost RETURN Restaurant_Id,Restaurant,Cuisine, minCost ORDER BY minCost",{cname: 'A'})
    .then(function(resp){
      console.log("RESTAURANTS NEAREST TO JOHN'S STREET")
      console.log("++++++++++++++++++++++++++++++++++++")
      resp.records.forEach(function(val){
        console.log("Restaurant ID : "+val._fields[0])
        console.log("Restaurant    : "+val._fields[1])
        console.log("Cuisine       : "+val._fields[2])
        console.log("Proximity     : "+val._fields[3])
        console.log("=============================") 

        MongoClient.connect(url,{useNewUrlParser: true,useUnifiedTopology: true},(err,client) =>{
          if (err) throw err;
          const db = client.db("RestaurantLocator");
          const cursor= db.collection('restaurants').find({restaurant_id:val._fields[0]});
          cursor.forEach (function(doc) {    
            console.log("RESTAURANTS DETAILED INFORMATION")
            console.log("+++++++++++++++++++++++++++++++++")
            console.log("Restaurant            : " + doc.name);
            console.log("Address               : " + doc.address);
            console.log("Review Stars          : " + doc.stars);  
            console.log("Restaurant Attributes : " , doc.attributes);
            console.log("Business Hours        : " , doc.hours);
          });           
        }); 
          
      });
    })      
    .catch(function(err){
      console.log(err);
    });
    
  },

  // 3b. Find restaurants that my friends like
  query3b : async () => {
    session
    .run("MATCH (u1:User {name: $uuname}) -[:IS_FRIEND_OF] -(friend:User) -[:LIKES] -> (r1:Restaurant) RETURN DISTINCT u1.name,friend.name,r1.name ORDER BY r1.name;",{uuname: 'John'})
    .then(function(resp){
      resp.records.forEach(function(val){
        console.log("User           : "+val._fields[0])
        console.log("User's Friends : "+val._fields[1])
        console.log("Restaurant     : "+val._fields[2])
        console.log("=================================")   
      });
    })
    .catch(function(err){
      console.log(err);
    });
  }, 

  // 4. Find which restaurant order reaches faster - Betting Result Prediction
  query4 : async () => {
    session
    .run("MATCH (r:Restaurant)-[w:ON_TIME]->(:Delivery)<-[l:ON_TIME]-() RETURN r.name as Restaurant, SUM(w.total) AS TOTAL_ON_TIME, SUM(l.total) as TOTAL_LOSS, (toFloat(SUM(w.total)) / (toFloat(SUM(w.total))+ toFloat(SUM(l.total)))) * 100 as SUCCESSFUL_ON_TIME_DELIVERIES_PERCENTAGE ORDER BY SUM(w.total) DESC")
    .then(function(resp){
      console.log("BETTING RESULTS")
      console.log("+++++++++++++++")
      resp.records.forEach(function(val){
        console.log("Restaurant                          : "+val._fields[0])
        console.log("Total Deliveries On Time            : "+val._fields[1])
        console.log("Total Deliveries Missed On Time     : "+val._fields[2])
        console.log("On Time Delivery Success Percentage : "+val._fields[3])
        console.log("=======================================================================")
      });
    })      
    .catch(function(err){
      console.log(err);
    });
  }

}