var readline = require('readline');
const api  = require('./app_queries.js');
const figlet  = require('figlet');
const chalk  = require('chalk');
var n = 0;

console.log(
  chalk.magentaBright(
    figlet.textSync("Restaurant Locator", { horizontalLayout: 'full' })
  )
);

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("1.  Create Promotional Offer");
console.log("2.  Find most influential reviewers");
console.log("3a. Find restaurants nearest to my street");
console.log("3b. Find restaurants that my friends like")
console.log("4.  Find which restaurant order reaches faster - Betting Result Prediction");

var recursiveAsyncReadLine = function () {
  rl.question("Enter your Choice of Use Case : ", function (answer) {
   switch (answer) {
      case '1':
            api.query1();
            break;
      case '2':
            api.query2();
            break;
      case '3a':
            console.log("JOHN IS AT CROSS ROAD A. FIND NEAREST RESTAURANTS FROM CROSS ROAD A")
            console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++") 
            api.query3a();           
            break;
      case '3b':            
            console.log("RESTAURANTS THAT JOHN'S FRIENDS LIKE")
            console.log("++++++++++++++++++++++++++++++++++++") 
            api.query3b(); 
            break;
      case '4':
            api.query4();
            break;
      default:
          recursiveAsyncReadLine(); //Calling this function again to ask new question
      }
      if (answer == '0'){
         n = 1;
         process.exit()
      }
  });
};

recursiveAsyncReadLine(); 