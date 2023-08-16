const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Initialize an array to store user data
const users = [];

function isValidCredentials(user_id, password) {
    const user = users.find(user => user.user_id === user_id);
    return user && user.password === password;
  }


app.post('/signup', (req, res) => {
  const { user_id, password, nickname, comment } = req.body;
  
    const userRegex = /^[a-zA-Z0-9]{6,20}$/;
  if (!userRegex.test(user_id)) {
    return res.status(400).json({
        message: "Account creation failed",
        cause: "required user_id and password"
    });
  }

  // Validate password format (8 to 20 characters, half-width with symbols)
  const passRegex = /^[ -~]{8,20}$/; // ASCII characters without spaces or control codes
  if (!passRegex.test(password)) {
    return res.status(400).json({
        message: "Account creation failed",
        cause: "required user_id and password"
    });
  }

  // Check if the user_id is already taken
  if (users.some(user => user.user_id === user_id)) {
    return res.status(400).json({
        message: "Account creation failed",
        cause: "already same user_id is used"
      });
  }

  // Create a new user object and push it to the users array
  const newUser = { user_id, password, nickname, comment };
  users.push(newUser);

  res.status(200).json({
  message: "Account successfully created",
  user: {
    "user_id": user_id,
    "nickname": nickname
  }
});
});

app.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;

  const authHeader = req.headers.authorization;

  const encodedCredentials = authHeader.split(' ')[1];
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
  const [authUser, authPass] = decodedCredentials.split(':');

  if (!authHeader || !isValidCredentials(authUser, authPass)) {
    return res.status(401).json({ message: 'Authentication Failed' });
  }

  // Find the user in the array based on user_id
  const user = users.find(user => user.user_id === user_id);
  if (!user) {
    return res.status(404).json({
        message: "No User found"
      });
  }

  res.status(200).json(
    {
        message: "User details by user_id",
        user: {
          user_id: user.user_id,
          nickname: user.nickname ? user.nickname : user.user_id,
          comment: user.comment ? user.comment : null
        }
      }
  );
});

app.patch('/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  const { password, nickname, comment } = req.body;

  const authHeader = req.headers.authorization;

  const encodedCredentials = authHeader.split(' ')[1];
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
  const [authUser, authPass] = decodedCredentials.split(':');

  if (!authHeader || !isValidCredentials(authUser, authPass)) {
    return res.status(401).json({ message: 'Authentication Failed' });
  }

  if(password || req.body.user_id){
    res.status(400).json(
        {
            message: "User updation failed",
            cause: "not updatable user_id and password"
          }
    )
  }

  if(!nickname || !comment){
    return res.status(400).json(
        {
            message: "User updation failed",
            cause: "required nickname or comment"
          }
    )
  }

  // Find the user in the array based on user_id
  const userIndex = users.findIndex(user => user.user_id === user_id);
  if (userIndex === -1) {
    return res.status(404).json({
        "message": "No User found"
      });
  }

  // Update user information
  const currentUser = users[userIndex];
  if (nickname) currentUser.nickname = nickname;
  if (comment) currentUser.comment = comment;

  res.json({ message: 'User updated successfully' });
});

app.post('/close', (req, res) => {
  
    const authHeader = req.headers.authorization;

    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [authUser, authPass] = decodedCredentials.split(':');
  
    if (!authHeader || !isValidCredentials(authUser, authPass)) {
      return res.status(401).json({ message: 'Authentication Failed' });
    }

  // Find the index of the user in the array based on user_id
  const userIndex = users.findIndex(user => user.user_id === authUser);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Remove the user from the array
  users.splice(userIndex, 1);

  res.status(200).json({
    message: "Account and user successfully removed"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
