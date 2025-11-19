// Test file with various code issues for CodeBuddy AI to review

// Issue 1: No error handling
function fetchUser(userId) {
  return fetch(`https://api.example.com/users/${userId}`)
    .then(response => response.json());
}

// Issue 2: SQL injection vulnerability
function getUser(username) {
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  return db.query(query);
}

// Issue 3: Inefficient nested loops
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

// Issue 4: No input validation
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

// Issue 5: Hardcoded credentials (security issue)
const config = {
  apiKey: "sk-1234567890abcdef",
  password: "admin123"
};
