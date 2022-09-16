var express = require('express');
var router = express.Router();
var auth = require('../config/auth')
var isAdmin = auth.isAdmin;



//get page model
var Page = require('../models/page');

router.get('/',isAdmin, function (req, res) {

    Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
        res.render('admin/pages', {
            pages: pages
        })
    });
});

router.get('/add-page',isAdmin, function (req, res) {
    var title = "";
    var slug = "";
    var content = "";
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    })
});

router.post('/add-page', function (req, res) {

    req.checkBody('title', 'Please enter Title.').notEmpty();
    req.checkBody('content', 'Please enter slug.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;

    var errors = req.validationErrors();
    if (errors) {
        console.log('errors identified');
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content

        })
    } else {
        Page.findOne({ slug: slug }, function (err, page) {
            if (page) {
                req.flash('danger', 'Account already found');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            }
            else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });

                page.save(function (err) {
                    if (err)
                        return console.log(err);
                    Page.find(function (err, pages) {
                            if (err) console.log(err);
                            else {
                                req.app.locals.pages = pages;
                            }
                        });    
                    req.flash('success', 'Page added');
                    res.redirect('/admin/pages');
                });
            }
        });
    }
});

router.get('/edit-page/:id',isAdmin, function (req, res) {
    Page.findById(req.params.id , function (err, page) {
        if (err) return console.log(err);
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

router.post('/edit-page/:id', function (req, res) {

    req.checkBody('title', 'Please enter Title.').notEmpty();
    req.checkBody('content', 'Please enter slug.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") {
        slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;
    var content = req.body.content;
    var id = req.params.id;

    var errors = req.validationErrors();
    if (errors) {
        console.log('errors identified');
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        })
    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, function (err, page) {
            if (page) {
                req.flash('danger', 'Account already found');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            }
            else {
                Page.findById(id, function (err, page) {
                    if (err) return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function (err) {
                        if (err)
                            return console.log(err);
                        Page.find(function (err, pages) {
                                if (err) console.log(err);
                                else {
                                    req.app.locals.pages = pages;
                                }
                            });       
                        req.flash('success', 'Edit Successfull');
                        res.redirect('/admin/pages/edit-page/'+ id);
                    });
                });

            }
        });
    }
});

router.get('/delete-page/:id',isAdmin, function (req, res) {
    Page.findByIdAndRemove(req.params.id,function(err){
        Page.find(function (err, pages) {
            if (err) console.log(err);
            else {
                req.app.locals.pages = pages;
            }
        });   
        req.flash('success', 'Page Deleted');
        res.redirect('/admin/pages');
    });
});


module.exports = router;