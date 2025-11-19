// Sample code with various issues for AI review
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}

// Missing error handling
function fetchUserData(userId) {
  return fetch(`https://api.example.com/users/${userId}`)
    .then(response => response.json());
}

// Security issue: SQL injection vulnerability
function getUser(username) {
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  return db.query(query);
}

// Performance issue: inefficient loop
function findDuplicates(arr) {
  let duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}
