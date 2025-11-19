// Test file for CodeBuddy AI with gemini-2.0-flash-lite

function fetchUser(userId) {
  return fetch(`https://api.example.com/users/${userId}`)
    .then(response => response.json());
}

function getUser(username) {
  const query = "SELECT * FROM users WHERE username = '" + username + "'";
  return db.query(query);
}

const config = {
  apiKey: "sk-1234567890",
  password: "admin123"
};
