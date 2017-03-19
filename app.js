var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"), // listens for _method
  expressSanitizer = require("express-sanitizer") // this line must come after body-parser

//use files from the public directory
app.use(express.static("public"));

//set file name extensions to .ejs
app.set("view engine", "ejs");

//pasre the body from forms
app.use(bodyParser.urlencoded({
  extended: true
}));

//use express-sanitizer to sanitize user data input
app.use(expressSanitizer());

//use method-override for PUT and DELETE requests
app.use(methodOverride("_method"));

var url = process.env.DATABASEURL || "mongodb://localhost/restful_blogapp"; //sets VAR so that if the ENVIRONMENT VARIABLE gets corrupted, it will default to the string

mongoose.connect(url); //development DB that uses ENVIRONMENT VARIABLE
//mongoose.connect("mongodb://username:pw@ds137100.mlab.com:37100/node-blog"); //PRODUCTION DB on mongolab

var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {
    type: Date,
    default: Date.now
  }
})

var Blog = mongoose.model("Blog", blogSchema);

//=====================================
// ROOT route
//=====================================
app.get("/", function(req, res) {
  res.redirect("/blogs");
})

//=====================================
// INDEX route
//=====================================
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) {
      console.log("Error");
    }
    else {
      res.render("index", {
        blogs: blogs
      });
    }
  })

})

//=====================================
// NEW route
//=====================================
app.get("/blogs/new", function(req, res) {
  res.render("new");
})

//=====================================
// CREATE route
//=====================================
app.post("/blogs", function(req, res) {
  // create blog
  console.log(req.body);
  req.body.blog.body = req.sanitize(req.body.blog.body) // taking the blog body and requiring it to be sanitized and making it equal to itself(replace unsanitized with sanitized)
  console.log("==================");
  console.log(req.body);
  Blog.create(req.body.blog, function(err, newBlog) {
    if (err) {
      // take user back NEW form if there is an error
      res.render("new");
    }
    else {
      // redirect to the index page
      res.redirect("/blogs");
    }
  });

})

//=====================================
// SHOW route
//=====================================
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    }
    else {
      res.render("show", {
        blog: foundBlog //set var to use in SHOW page
      });
    }
  });
})

//=====================================
// EDIT route
//=====================================
app.get("/blogs/:id/edit", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    }
    else {
      res.render("edit", {
        blog: foundBlog
      });
    }
  })

})

//=====================================
// UPDATE route
//=====================================
app.put("/blogs/:id", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body)
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) { // .findByIdAndUpdate takes three parameters id, data(parsing the body of the blog), callback function
    if (err) {
      res.redirect("/blogs");
    }
    else {
      res.redirect("/blogs/" + req.params.id); // adds the ID to take it to the UPDATED blog route
    }
  });
})

//=====================================
// DELETE route
//=====================================
app.delete("/blogs/:id", function(req, res) {
  // delete blog
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/blogs");
    }
    else {
      res.redirect("/blogs");
    }
  })

})

app.get("*", function(req, res) {
  res.send("You have navigated away from our app! Please come back!");
})

app.listen(process.env.PORT, process.env.IP, function() {
  console.log("Blog App Server is running...");
})
