/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var express = require('express');
var app = express();
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');
const fs = require("fs");
// const { request } = require('http');
// const { response } = require('express');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
const Activity = require('./schema/activity.js');

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

// new from proj7
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            { name: 'user', collection: User },
            { name: 'photo', collection: Photo },
            { name: 'schemaInfo', collection: SchemaInfo }
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send();
        return;
    }
    console.log("User List requested.");
    User.find({}, { _id: 1, first_name: 1, last_name: 1 }, function (err, users) {
        /*users is an array of objects*/
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /user/list error:', err);
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object - This
            // is also an internal error return.
            response.status(500).send('Missing userList');
            return;
        }
        // We got the object - return it in JSON format.
        //console.log('UserList', users);
        response.end(JSON.stringify(users));
    });
    //response.status(200).send(cs142models.userListModel());
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    console.log("checking for session");
    console.log(request.session.user_id);
    if (!request.session.user_id) {
        response.status(401).send();
        return;
    }
    var id = request.params.id;
    console.log("User requested.");
    User.findOne({ _id: id }, { _id: 1, first_name: 1, last_name: 1, location: 1, description: 1, occupation: 1 }, function (err, user) {
        /*users is an array of objects*/
        if (err) {
            // Query returned an error.  We pass it back to the browser with an Internal Service
            // Error (500) error code.
            console.error('Doing /user/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user.length === 0) {
            // Query didn't return an error but didn't find the user object - This
            // is also an internal error return.
            response.status(400).send('User not found');
            return;
        }
        // We got the object - return it in JSON format.
        //console.log('user', user);
        response.end(JSON.stringify(user));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */

app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send();
        return;
    }
    var id = request.params.id;
    console.log("Photos requested.");
    Photo.find({ user_id: id }, { _id: 1, user_id: 1, comments: 1, file_name: 1, date_time: 1 }, function (err, photos) {
        if (err) {
            // Query returned an error.  
            console.error('Doing /photosOfUser/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photos.length === 0) {
            // Query didn't return an error but didn't find any photos objects - This
            // is also an internal error return.
            console.log("no photos");
            response.status(400).send('no photos found');
            return;
        }
        // We got the object - return it in JSON format.
        let photosCopy = JSON.parse(JSON.stringify(photos));

        async.each(photosCopy, function (photo, done_callback1) {
            async.each(photo.comments, function (comment, done_callback) {
                User.findOne({ _id: comment.user_id }, { _id: 1, first_name: 1, last_name: 1 }, function (usererror, user) {
                    if (usererror) {
                        // Query returned an error.
                        console.error('Grabbing user for comment:', usererror);
                        response.status(400).send(JSON.stringify(usererror));
                        return;
                    }
                    if (user.length === 0) {
                        // Query didn't return an error but didn't find the user object
                        response.status(400).send('user not found');
                        return;
                    }
                    // We got the object - return it in JSON format.
                    let userCopy = JSON.parse(JSON.stringify(user));
                    delete comment.user_id;
                    comment.user = userCopy;
                    done_callback(err);
                });

            }, function (err2) {
                if (err2) {
                    response.status(400).send(JSON.stringify(err2));
                } else {
                    //console.log('All Fixed Comments', photo.comments);
                }
                done_callback1(err2);
            });
        }, function (err3) {
            if (err3) {
                response.status(400).send(JSON.stringify(err3));
            } else {
                response.end(JSON.stringify(photosCopy));
            }
        });
    });
});

/*
 * URL /commentsOfUser/:id - Return the Photos for User (id)
 */

app.get('/commentsOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send(JSON.stringify());
        return;
    }
    var id = request.params.id;
    console.log("Comments requested.");
    const commentList = [];
    Photo.find({}, { _id: 1, user_id: 1, comments: 1, file_name: 1, date_time: 1 }, function (err, photos) {
        if (err) {
            // Query returned an error.  
            console.error('Doing /photosOfUser/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photos.length === 0) {
            // Query didn't return an error but didn't find any photos objects - This
            // is also an internal error return.
            response.status(400).send('no photos found');
            return;
        }
        // We got the object - return it in JSON format.
        let photosCopy = JSON.parse(JSON.stringify(photos));

        async.each(photosCopy, function (photo, done_callback1) {
            async.each(photo.comments, function (comment, done_callback) {
                User.findOne({ _id: comment.user_id }, { _id: 1, first_name: 1, last_name: 1 }, function (usererror, user) {
                    if (usererror) {
                        // Query returned an error.
                        console.error('Grabbing user for comment:', usererror);
                        response.status(400).send(JSON.stringify(usererror));
                        return;
                    }
                    if (user.length === 0) {
                        // Query didn't return an error but didn't find the user object
                        response.status(400).send('user not found');
                        return;
                    }
                    // We got the object - return it in JSON format.
                    let userCopy = JSON.parse(JSON.stringify(user));
                    delete comment.user_id;
                    comment.user = userCopy;
                    if (userCopy._id === id) {
                        commentList.push(comment);
                    }
                    done_callback(err);
                });

            }, function (err2) {
                if (err2) {
                    response.status(400).send(JSON.stringify(err2));
                }
                done_callback1(err2);
            });
        }, function (err3) {
            if (err3) {
                response.status(400).send(JSON.stringify(err3));
            } else {
                response.end(JSON.stringify(commentList));
            }
        });
    });
});


/*
 * URL /countPhotosOfUser/:id - Return the number of Photos for User (id)
 */

app.get('/countPhotosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send(JSON.stringify());
        return;
    }
    var id = request.params.id;
    console.log("Photos Count requested.");
    Photo.countDocuments({ user_id: id }, function (err, count) {
        if (err) {
            // Query returned an error.  
            console.error('Doing /photosOfUser/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // We got the object - return it in JSON format.
        response.end(JSON.stringify(count));
    });
});

app.post('/admin/login', function (request, response) {
    var login_name = request.body.login_name;
    console.log("Logging in.");
    User.findOne({ login_name: login_name }, function (err, user) {
        if (err) {
            // Query returned an error.  
            console.error('Doing /admin/login error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (!user) {
            // Query didn't return an error but didn't find the user object
            response.status(400).send('Login name not found');
            return;
        }
        if (user.password !== request.body.password) {
            response.status(400).send('Incorrect password');
            return;
        }
        request.session.user_id = user._id;
        request.session.login_name = user.login_name;
        response.end(JSON.stringify(user));
    });
});

app.post('/admin/logout', function (request, response) {
    console.log("Logging out.");
    delete request.session.user_id;
    delete request.session.login_name;
    request.session.destroy(function (err) {
        if (err) {
            console.error('Log out error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        response.end();
    });
});

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    console.log("getting photo comments");
    if (!request.session.user_id) {
        response.status(401).send("Must be logged in.");
        return;
    }
    if (request.body.comment.length === 0) {
        response.status(400).send("The comment is empty.");
        return;
    }
    var photo_id = request.params.photo_id;
    console.log("photo id: " + photo_id);
    Photo.findOne({ _id: photo_id }, { _id: 1, user_id: 1, comments: 1, file_name: 1, date_time: 1 }, function (err, photo) {
        if (err) {
            // Query returned an error.  
            console.error('Doing /commentsOfPhoto/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        console.log("photo found");
        if (!photo) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        let commentObj = { comment: request.body.comment, user_id: request.session.user_id };
        photo.comments.push(commentObj);
        photo.save(function (err2) {
            if (err2) {
                // Query returned an error.  
                console.error('Doing comment add error:', err2);
                response.status(400).send(JSON.stringify(err2));
                return;
            }
            response.end(JSON.stringify(photo));
        });

    });
});


app.post('/addMention/:photo_id', function (request, response) {
    console.log("Adding a mention to photo");
    if (!request.session.user_id) {
        response.status(401).send("Must be logged in.");
        return;
    }
    if (request.body.mentionId.length === 0) {
        response.status(400).send("The mention is empty.");
        return;
    }
    var photo_id = request.params.photo_id;
    console.log("photo id: " + photo_id);
    Photo.findOne({ _id: photo_id }, { _id: 1, user_id: 1, comments: 1, file_name: 1, date_time: 1, mentions: 1 }, function (err, photo) {
        if (err) {
            // Query returned an error.  
            console.error('Doing /addMention/:photo_id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        console.log("photo found");
        if (!photo) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        photo.mentions.set(request.body.mentionId, 1);
        //photo.mentions[request.body.mentionId] = 1;
        console.log(photo.mentions);
        photo.save(function (err2) {
            if (err2) {
                // Query returned an error.  
                console.error('Doing mention add error:', err2);
                response.status(400).send(JSON.stringify(err2));
                return;
            }
            console.log(photo.mentions);
            response.end(JSON.stringify(photo));
        });
    });
});


app.get('/mentionsOfUser/:id', function (request, response) {
    
    if (!request.session.user_id) {
        response.status(401).send("Must be logged in");
        return;
    }
    
    var id = request.params.id;
    console.log("Mentioned Photos requested.");
    //const commentList = [];
    const newPhotoList = [];
    Photo.find({}, { _id: 1, user_id: 1, comments: 1, file_name: 1, date_time: 1, mentions: 1 }, function (err, photos) {
        if (err) {
            // Query returned an error.  
            console.error('Doing /photosOfUser/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photos.length === 0) {
            // Query didn't return an error but didn't find any photos objects - This
            // is also an internal error return.
            response.status(400).send('no photos found');
            return;
        }
        // We got the object - return it in JSON format.
        let photosCopy = JSON.parse(JSON.stringify(photos));

        async.each(photosCopy, function (photo, done_callback1) {
            //if (photo.mentions.has(request.body.mentionId)){
            if (id in photo.mentions){
                console.log("found match");
                newPhotoList.push(photo);
            }
            done_callback1();
        }, function (err3) {
            if (err3) {
                response.status(400).send(JSON.stringify(err3));
            } else {
                response.end(JSON.stringify(newPhotoList));
            }
        });
    });
});

app.get('/mostRecentPhoto/:id', function (request, response) {
    
    if (!request.session.user_id) {
        response.status(401).send();
        return;
    }
    
    var id = request.params.id;
    console.log("Most recent photo requested.");
    Photo.find({ user_id: id }, { _id: 1, user_id: 1, comments: 1, file_name: 1, date_time: 1 }, function (err, photos) {
        if (err) {
            // Query returned an error.  
            console.error('Doing /mostRecentPhoto/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photos.length === 0) {
            // Query didn't return an error but didn't find any photos objects - This
            // is also an internal error return.
            console.log("no photos");
            response.status(400).send('no photos found');
            return;
        }
        // We got the object - return it in JSON format.
        let photosCopy = JSON.parse(JSON.stringify(photos));
        let mostRecentPhoto = photosCopy[0];
        for (var i = 1; i < photosCopy.length; i ++){
            const curPhoto = photosCopy[i];
            if (curPhoto.date_time > mostRecentPhoto.date_time){
                mostRecentPhoto = curPhoto;
            }
        }
        response.end(JSON.stringify(mostRecentPhoto));
    });
});

app.get('/mostCommentedPhoto/:id', function (request, response) {
    
    if (!request.session.user_id) {
        response.status(401).send();
        return;
    }
    
    var id = request.params.id;
    console.log("Most commented photo requested.");
    Photo.find({ user_id: id }, { _id: 1, user_id: 1, comments: 1, file_name: 1, date_time: 1 }, function (err, photos) {
        if (err) {
            // Query returned an error.  
            console.error('Doing /mostRecentPhoto/:id error:', err);
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photos.length === 0) {
            // Query didn't return an error but didn't find any photos objects - This
            // is also an internal error return.
            console.log("no photos");
            response.status(400).send('no photos found');
            return;
        }
        // We got the object - return it in JSON format.
        let photosCopy = JSON.parse(JSON.stringify(photos));
        let mostCommentedPhoto = photosCopy[0];
        for (var i = 1; i < photosCopy.length; i ++){
            const curPhoto = photosCopy[i];
            if (curPhoto.comments.length > mostCommentedPhoto.comments.length){
                mostCommentedPhoto = curPhoto;
            } else if ((curPhoto.comments.length === mostCommentedPhoto.comments.length) && (curPhoto.date_time > mostCommentedPhoto.date_time)){
                mostCommentedPhoto = curPhoto;
            }
        }
        response.end(JSON.stringify(mostCommentedPhoto));
    });
});


app.post('/photos/new', function (request, response) {
    console.log("Uploading Photo");
    if (!request.session.user_id) {
        response.status(401).send("Must be logged in.");
        return;
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("There is no file in the request.");
            return;
        }

        // request.file has the following properties of interest:
        //   fieldname    - Should be 'uploadedphoto' since that is what we sent
        //   originalname - The name of the file the user uploaded
        //   mimetype     - The mimetype of the image (e.g., 'image/jpeg',
        //                  'image/png')
        //   buffer       - A node Buffer containing the contents of the file
        //   size         - The size of the file in bytes

        // XXX - Do some validation here.
        if (request.file.size === 0) {
            response.status(400).send("The file size is 0");
            return;
        }

        // We need to create the file in the directory "images" under an unique name.
        // We make the original file name unique by adding a unique prefix with a
        // timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function () {
            const photo = { file_name: filename, date_time: timestamp, user_id: request.session.user_id, comments: [] };
            Photo.create(photo)
                .then((photoObj) => {
                    photoObj.save();
                    //response.status(200).send();
                    response.end(JSON.stringify(photoObj));
                })
                .catch((err3) => {
                    if (err3) response.status(400).send("Error in /photo: ", err3);
                });
        });
    });
});

app.post('/user', function (request, response) {
    console.log("Registering new user");
    if (!request.body.login_name || !request.body.first_name || !request.body.last_name || !request.body.password) {
        response.status(400).send("The registration is missing a required field");
        return;
    }
    User.findOne({ login_name: request.body.login_name }, function (err, user) {
        if (err) {
            // Query returned an error.  
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user) {
            // Query didn't return an error but didn't find the user object
            response.status(400).send('That login name already exists');
            return;
        }
        const newUser = {
            login_name: request.body.login_name, 
            password: request.body.password, 
            first_name: request.body.first_name,
            last_name: request.body.last_name, 
            location: request.body.location,
            description: request.body.description, 
            occupation: request.body.occupation
        };
        User.create(newUser)
            .then((userObj) => {
                userObj.save();
                response.end(JSON.stringify(userObj));
            })
            .catch((err3) => {
                if (err3) response.status(400).send("Error in /user: ", err3);
            });
    });
});

app.post('/addActivity', function(request, response){
    console.log("adding Activity");
    
    if (!request.session.user_id) {
        response.status(401).send("Must be logged in.");
        return;
    }
    
    if (!request.body.user_name || !request.body.activity_type) {
        response.status(400).send("The activity is missing a required field");
        return;
    }
    const newActivity = {
        date_time: request.body.date_time,
        user_name: request.body.user_name,
        activity_type: request.body.activity_type,
        file_name: request.body.file_name,
    };
    Activity.create(newActivity)
        .then((activityObj) => {
            activityObj.save();
            response.end(JSON.stringify(activityObj));
        })
        .catch((err) => {
            if (err) response.status(400).send("Error in /activity: ", err);
        });
});

app.get('/activityList', function(request, response){
    
    if (!request.session.user_id) {
        response.status(401).send("Must be logged in.");
        return;
    }
    Activity.find({}, function (err, activities) {
        if (err) {
            // Query returned an error.  
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (activities.length === 0) {
            response.status(400).send('Some error with activities list');
            return;
        }
        let activityList = JSON.parse(JSON.stringify(activities));
        // sort
        const sortedActivityList = activityList.sort((a, b) => a.date - b.date);
        response.end(JSON.stringify(sortedActivityList));
    });
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


