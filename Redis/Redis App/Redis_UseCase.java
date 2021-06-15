package redisDB;

import java.util.ArrayList;
import java.util.Scanner;

import org.bson.Document;
import org.bson.types.ObjectId;
import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.connection.Server;

import redis.clients.jedis.Jedis;
import redis.embedded.RedisServer;

public class Redis_UseCase {

	
	private static final int VOTE_SCORE = 1;

	static Jedis jedis;
	static ArrayList<String> arr  = new ArrayList<String>();	
	static RedisServer server;


	public static void main(String args[]) {
		try {
			
			// Create & Start Embedded Redis Server
			server = new RedisServer(6379);
			System.out.println("Created embedded redis server on port 6379");
			server.start();	
			
			// redis connectivity
			jedis = new Jedis("localhost");
			System.out.println("Connection Successful");
			System.out.println("The server is running " + jedis.ping());
			jedis.set("company-name", "SRH-RedisDB");
			System.out.println("Stored string in redis: " + jedis.get("company-name"));

			jedis.hset("Song-1", "votes", "0");
			jedis.hset("Song-2", "votes", "0");
			
			// Mongo connectivity
			// Creating a Mongo client
			MongoClient mongo = new MongoClient("localhost", 27017);

			System.out.println("Connected to the database successfully");

			// Accessing the database
			MongoDatabase database = mongo.getDatabase("RestaurantLocator");
			System.out.println("Connected to the collection successfully");

			MongoCollection<Document> collection = database.getCollection("Event");

			System.out.println("Collection myCollection selected successfully");

			// Picking One EventId
			BasicDBObject query = new BasicDBObject("_id", new ObjectId("60bd11a0d1908376ac9cd296"));
			Document myDoc = collection.find(query).first();

			String str = myDoc.get("attended").toString();
			String substring = str.substring(str.indexOf("[") + 1, str.indexOf("]")).replaceAll("\\s+", "");

			String[] user = substring.toString().split(",");
			

			for (int i = 0; i <= user.length - 1; i++) {
				String Userchoice;
				System.out.println("Dear Participant Please pick your Song Choice\n");
				System.out.println("Type 1) for Song 1\n and 2) for Song 2\n");
				System.out.print("Selection: ");
				Scanner scanner = new Scanner(System.in);
				int choice = scanner.nextInt();

				switch (choice) {
				case 1:
					Userchoice = "Song-1";
					break;
				case 2:
					Userchoice = "Song-2";
					break;
				default:
					Userchoice = "No input from User";
				}

				System.out.println("Song Chosen by Visitor with ID "  + user[i] +  " is " + Userchoice);

				songVote(jedis, user[i], Userchoice);

			}

			System.out.println("Song-1 has received " + jedis.hget("Song-1", "votes") + " votes.");
			System.out.println("Song-2 has received " + jedis.hget("Song-2", "votes") + " votes.");
			
			//Stop Embedded redis server
			server.stop();
			System.out.println("Embedded redis server stopped successfully");
		}
		catch (Exception e) {
			System.out.println(e);
		}
	}

	// To fetch and manipulate data from Redis(Voting)
	public static void songVote(Jedis conn, String user, String song) {

	if (!arr.contains(user)) {// This operation involves redis transactions temporarily not processed
	
		conn.hincrBy(song, "votes", 1);
		arr.add(user);
	}
	else
	{
		System.out.println("Sorry, You have already voted");
	}
	
}
}