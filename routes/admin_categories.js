var express = require('express');
var router = express.Router();
var auth = require('../config/auth')
var isAdmin = auth.isAdmin;



//get page model
var Category = require('../models/category');

router.get('/',isAdmin, function (req, res) {

    Category.find(function (err, categories) {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

router.get('/add-category',isAdmin, function (req, res) {
    var title = "";
    res.render('admin/add_category', {
        title: title
    })
});

router.post('/add-category', function (req, res) {

    req.checkBody('title', 'Please enter Title.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();
    if (errors) {
        console.log('errors identified');
        res.render('admin/add_category', {
            errors: errors,
            title: title,

        })
    } else {
        Category.findOne({ slug: slug }, function (err, category) {
            if (category) {
                req.flash('danger', 'Category already found');
                res.render('admin/add_category', {
                    title: title,
                });
            }
            else {
                var category = new Category({
                    title: title,
                    slug: slug,
                });

                category.save(function (err) {
                    if (err)
                        return console.log(err);
                    Category.find(function (err, categories) {
                        if (err) console.log(err);
                        else {
                            req.app.locals.categories = categories;
                        }
                    });
                    res.redirect('/admin/categories');
                    req.flash('success', 'Category added');
                });
            }
        });
    }
});

router.get('/edit-category/:id',isAdmin, function (req, res) {
    Category.findById(req.params.id, function (err, category) {
        if (err) return console.log(err);
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });
});

router.post('/edit-category/:id', function (req, res) {

    req.checkBody('title', 'Please enter Title.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();
    if (errors) {
        console.log('errors identified');
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        })
    } else {
        Category.findOne({ slug: slug, _id: { '$ne': id } }, function (err, category) {
            if (category) {
                req.flash('danger', 'Category already found');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            }
            else {
                Category.findById(id, function (err, category) {
                    if (err) return console.log(err);
                    category.title = title;
                    category.slug = slug;

                    category.save(function (err) {
                        if (err)
                            return console.log(err);
                        Category.find(function (err, categories) {
                            if (err) console.log(err);
                            else {
                                req.app.locals.categories = categories;
                            }
                        });
                        req.flash('success', 'Edit Successfull');
                        res.redirect('/admin/categories/edit-category/' + id);
                    });
                });

            }
        });
    }
});

router.get('/delete-category/:id',isAdmin, function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if(err){
            console.log(err);
        }
        Category.find(function(err, categories){
            if(err) console.log(err);
            else{
                req.app.locals.categories = categories;
            }
        });
        req.flash('success', 'category Deleted');
        res.redirect('/admin/categories');
    });
});


module.exports = router;