  // function foo() {
  //   var x = 1;
  //   if (x === 1) {
  //     let y = 2;
  //     console.log(y);
  //   }
  //   // console.log('Value of y is ' + y);
  // }
  // foo();

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
 "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "pairsbot-pair"
  },
 "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: "johnbot-feauture"
  }
}
console.log(users);
users.user5RandomID = {
  id: 'asd',
  email: 'asd',
  password: 'asd'};
console.log(users)
// console.log(users.userRandomID);
// console.log(users.userRandomID.id);
// console.log(Object.keys(users).length);

