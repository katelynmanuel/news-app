const express = require('express');
const router = express.Router();
const db = require('../models');
const request = require('request');
const cheerio = require('cheerio')
const axios = require("axios");


// Get Home Page
router.get("/", function(req, res) {
    res.redirect("/articles");
});

// GET route for scraping The Onion
router.get("/scrape", function(req, res) {
    // Define website to scrape.
    axios.get("http://www.theonion.com/").then(function(response) {
        // Load into Cheerio
        let $ = cheerio.load(response.data);

        // Grabbing data.
        $("div.post-wrapper article").each(function(i, element) {
            // Saving result as empty array
            let result = {};

            // Saving properties of results
            result.title = $(this)
            .children("header").children("h1").children("a").text();
            result.link = $(this)
            .children("header").children("h1").children("a").attr("href")
        
            result.paragraph = $(this)
            .children("div.item__content").children("div.excerpt").children("p").text();
          
            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
            .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
            })
            // Throw error
            .catch(function(err) {
                return res.json(err);
            });
        });
      res.send("Scrape Complete");
      res.redirect("articles");
    });
});

// Route for getting all Articles from the db
router.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.render("index", {data: dbArticle});
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function(dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});
  
// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});

module.exports = router;

