# TeamDiamond-RestaurantLocator
SRH Module Advance Databases - Project Restaurant Locator

This project has been made as part of SRH ACS Masters - June 2021 batch, under the guidance of Professor Frank Hefter, by Team Diamond.
The project is a "Restaurant Locator" which demonstrates how different databases can be utilized for a single application, based on the
benefits of each database. 

We have used the following NoSQL databases as mentioned below:

•	MongoDB
	For storing the detailed data and historical data

•	Neo4j
	For storing all relations between the different entities (collections) defined in Mongo DB.

•	Redis
	For data concerning live concert (Songs for which the users attending an event must vote).

The following use cases were implemented using MongoDB and Neo4j in Node.js:
1.	Create promotional offers for a user 
2.	Find the most influential reviewer among the registered users 
3.	Find restaurants nearest to the user’s location which user’s friends like 
4.	Define a betting strategy – Prediction

The below use case was implemented using MongoDB and Redis in Java:
5.	Allow users to vote during a live event happening at a restaurant

NOTES:
1.  Please install all relevant dependencies using "npm install" to run the Node.js application.
2. Ensure that the data model for all three databases have been set up (Please refer the Queries text file in each folder for the data set up). 
