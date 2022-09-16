var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;

router.get('/',function(req, res) {
    var loggedIn = (req.isAuthenticated()) ? true : false;
    Product.find (function(err,products){
        if(err){
            console.log(err);
        }

            res.render('all_products',{
                title: "All products",
                products: products,
                loggedIn: loggedIn
            });
    });
});


router.get('/:category', function(req, res) {
    var categorySlug = req.params.category;
    var loggedIn = (req.isAuthenticated()) ? true : false;
    Category.findOne({slug: categorySlug}, function(err,c) {

        Product.find ({category: categorySlug},function(err,products){
            if(err){
                console.log(err);
            }
    
                res.render('cat_products',{
                    title: c.title,
                    products: products,
                    loggedIn: loggedIn
                });
        });
    });
});


router.get('/:category/:product', function(req, res) {
    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;
    Product.findOne({slug: req.params.product}, function(err,product){
        if(err)  console.log(err);
        else{
            var galleryDir = 'static/product_images/'+ product.id + '/gallery';
            fs.readdir(galleryDir, function(err,files) {
                if(err){
                    console.log(err);
                }
                else{
                    galleryImages = files;
                    res.render('product_details',{
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                };
            } );
        };
    });
});



module.exports = router;