const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        book_count: function(callback) {
            Book.count({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function(callback) {
            BookInstance.count({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.count({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.count({}, callback);
        },
        genre_count: function(callback) {
            Genre.count({}, callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all books.
// Display list of all Books.
exports.book_list = function(req, res, next) {

  Book.find({}, 'title author')
    .populate('author')
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('book_list', { title: 'Book List', book_list: list_books });
    });

};

// Display detail page for a specific book.
exports.book_detail = function(req, res) {
  async.parallel({
  book: function(callback) {
      Author.findById(req.params.id)
        .exec(callback)
  },
  authors_books: function(callback) {
    Book.find({ 'author': req.params.id },'title summary')
    .exec(callback)
  },
}, function(err, results) {
  if (err) { return next(err); } // Error in API usage.
  if (results.book==null) { // No results.
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
  }
  // Successful, so render.
  res.render('book_detail', { title: 'Book Detail', book: results.book, author_books: results.authors_books } );
});

};

};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
    res.render('book_form', { title: 'Create Book'});
};

// Handle book create on POST.
exports.book_create_post = [
  body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

// Sanitize fields.
sanitizeBody('first_name').trim().escape(),
sanitizeBody('family_name').trim().escape(),
sanitizeBody('date_of_birth').toDate(),
sanitizeBody('date_of_death').toDate(),

// Process request after validation and sanitization.
(req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('book_form', { title: 'Create Book', book: req.body, errors: errors.array() });
        return;
    }
    else {
        // Data from form is valid.

        // Create an Author object with escaped and trimmed data.
        var author = new Book(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
        book.save(function (err) {
            if (err) { return next(err); }
            // Successful - redirect to new author record.
            res.redirect(book.url);
        });
    }
}

];
};

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};
