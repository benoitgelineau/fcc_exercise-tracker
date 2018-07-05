const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const shortid = require('shortid');

const cors = require('cors');

const mongoose = require('mongoose');
mongoose
  .connect(
    process.env.MLAB_URI || 'mongodb://localhost/exercise-track',
    { useMongoClient: true },
    err => {
      if (err) {
        console.log(`MongoDB could not connect: ${err}`);
      } else {
        console.log('MongoDB connected');
      }
    }
  );

const Schema = mongoose.Schema;
const schema = new Schema({
  _id: {
    type: String
    // default: shortid.generate (to be used in case of Promises in post method)
  },
  username: {
    type: String,
    required: true
  },
  exercises: [
    {
      _id: {
        type: String,
        default: shortid.generate
      },
      description: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      },
      date: {
        type: String
      }
    }
  ]
});

const User = mongoose.model('User', schema);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// New user
app.post('/api/exercise/new-user', (req, res, next) => {

  req.id = shortid.generate();
  req.name = req.body.username.toLowerCase();
  
  next();
}, (req, res) => {
  
  // Create new user if username is not taken
  User.findOne({ username: req.name }, (err, result) => {
    if (err) console.log(`Error in finding username: ${err}`);

    if (result) {
      res.type("txt").send("This username has already been taken.");
      
    } else {

      User.create({ _id: req.id, username: req.name }, (err, user) => {

        if (err) {
          res.type("txt").send('Please insert a username.');

        } else {
          res.json({ username: user.username, _id: user._id });
          console.log(`New user created: ${user}`);
        }
      });
    }
  });
});

const init = (req, res, next) => {
  req.id = req.body.userId;
  req.descr = req.body.description;
  req.dur = parseInt(req.body.duration);

  next();
}

const isDateValid = (req, res, next) => {
  req.date = req.body.date ? new Date(req.body.date) : new Date(); // Should use default value in schema
  req.dateValid = req.date.getTime() ? true : false;

  next();
};

// New exercise
app.post('/api/exercise/add', init, isDateValid, (req, res) => {

  User.findById(req.id, (err, user) => {

    // Handle responses
    if (!user) {
      res.type('txt').send('No user found with this id.');

    } else if (!req.descr || !req.dur) {
      res.type('txt').send('Please fill in all the information required.');

    } else if (!req.dateValid) {
      res.type("txt").send("Please enter a valid date.");

    } else {

      user.exercises.push({
        description: req.descr,
        duration: req.dur,
        date: req.date.toDateString()
      });

      user.save((err, user) => {
        res.json({
          _id: user._id,
          username: user.username,
          description: req.descr,
          duration: req.dur,
          date: req.date.toDateString()
        });
      });
    }
  });
});

// // Not found middleware
// app.use((req, res, next) => {
//   return next({ status: 404, message: 'not found' })
// });

// // Error Handling middleware
// app.use((err, req, res, next) => {
//   let errCode, errMessage

//   if (err.errors) {
//     // mongoose validation error
//     errCode = 400 // bad request
//     const keys = Object.keys(err.errors)
//     // report the first validation error
//     errMessage = err.errors[keys[0]].message
//   } else {
//     // generic or custom error
//     errCode = err.status || 500
//     errMessage = err.message || 'Internal Server Error'
//   }
//   res.status(errCode).type('txt')
//     .send(errMessage)
// });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
