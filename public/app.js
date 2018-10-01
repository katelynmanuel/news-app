scrapeArticles();

// Load saved articles
function loadArticles(saved) {
    let route = '/articles';
    if (saved) {
        route += '?saved=true';
    }
};

// Scrape Articles
function scrapeArticles() {
    $.ajax({
        url: "/scrape"
    }).then(loadArticles());
};

// Saved Articles event handler
$(document).on("click", "#savedArticles", function () {
    loadArticles(true);
});

// Scrape Artciles event handler
$(document).on("click", "#home", function () {
    scrapeArticles();
});

// Article Save event handler
$(document).on("click", "#saveArticle", function () {
    const articleId = $(this).data("id")
    $.ajax({
        method: "PATCH",
        url: "/articles/" + articleId,
        data: { saved: true }
    }).then(data => {
        console.log(data);
    })
});

