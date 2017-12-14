let express = require('express');
let app = express();
let path = require('path');
let http = require('http').Server(app);
let io = require('socket.io')(http);

http.listen(3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

app.use(express.static(path.join(__dirname, 'public')));

let numUsers = 0;

io.on('connection', function(socket){
  socket.on('color', (name, fn) => {
    fn(name);
    io.emit('color', name); //this will send the data to help us display the typed name for everyone
  });
});

io.on('connection', function(socket){

  let addedUser = false;

  //when the client emits the "add user" event, this listens and executes
  socket.on('add user', function(username){
    if (addedUser) return;

    //We'll store their usename in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });

    //Echo to everyone that someone connected
    socket.broadcast.emit('user joined', { //This is sending an object with usrname and numuser properties, their values are socket.username and numUsers the vairable
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('disconnect', function(){
    if(addedUser) {
      --numUsers;

      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    socket.broadcast.emit('chat message', msg);
  });



});
