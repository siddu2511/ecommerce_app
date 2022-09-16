var express = require('express');
var router = express.Router();
var mkdir = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth')
var isAdmin = auth.isAdmin;





var Product = require('../models/product');
var Category = require('../models/category');
const product = require('../models/product');

router.get('/',isAdmin, function (req, res) {

    var count;
    Product.count(function (err, c) {
        count = c;
    })

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

router.get('/add-product',isAdmin, function (req, res) {
    var title = "";
    var desc = "";
    var price = "";
    Category.find(function (err, categories) {

        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });
});

router.post('/add-product', function (req, res) {

    if (!req.files) { imageFile = ""; }
    if (req.files) {
        var imageFile = typeof (req.files.image) !== "undefined" ? req.files.image.name : "";
    }

    req.checkBody('title', 'Please enter Title.').notEmpty();
    req.checkBody('desc', 'Please enter Description.').notEmpty();
    req.checkBody('price', 'Please enter Price.').isDecimal();
    req.checkBody('image', 'Please upload image').isImage(imageFile);

    var title = req.body.title;

    slug = title.replace(/\s+/g, '-').toLowerCase();

    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();
    if (errors) {
        console.log("hiii");
        Category.find(function (err, categories) {

            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({ slug: slug }, function (err, product) {
            if (product) {
                req.flash('danger', 'Product already found');
                Category.find(function (err, categories) {

                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });

                });

            } else {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);
                    mkdir('static/product_images/' + product._id, function (err) {

                        return console.log(err);
                    });
                    mkdir('static/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });
                    mkdir('static/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });
                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'static/product_images/' + product._id + '/' + imageFile;
                        productImage.mv(path, function (err) {
                            return console.log(err);
                        })
                    }
                    req.flash('success', 'Product added');
                    res.redirect('/admin/products');
                });
            }
        });
    }
});

router.get('/edit-product/:id',isAdmin, function (req, res) {

    var errors;

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;


    Category.find(function (err, categories) {

        product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'static/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        galleryImages = files;
                        res.render('admin/edit_product', {
                            errors: errors,
                            title: p.title,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });

            }

        });

    });


});

router.post('/edit-product/:id', function (req, res) {
    if (!req.files) { imageFile = ""; }
    if (req.files) {
        var imageFile = typeof (req.files.image) !== "undefined" ? req.files.image.name : "";
    }

    req.checkBody('title', 'Please enter Title.').notEmpty();
    req.checkBody('desc', 'Please enter Description.').notEmpty();
    req.checkBody('price', 'Please enter Price.').isDecimal();
    req.checkBody('image', 'Please upload image').isImage(imageFile);

    var title = req.body.title;

    slug = title.replace(/\s+/g, '-').toLowerCase();

    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;


    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, function (err,p) {
            if (err) {
                console.log(err);
            };
            if (p) {
                req.flash('danger', 'Product title already exists.');
                res.redirect('admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err) {
                        console.log(err);
                    };
                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    };

                    p.save(function (err) {
                        if (err) console.log(err);
                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('static/product_images/' + id + '/' + pimage, function (err) {
                                    if (err) console.log(err);

                                });
                            };
                            var productImage = req.files.image;
                            var path = 'static/product_images/' + id + '/' + imageFile;
                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        };

                        req.flash('success', 'Product added');
                        res.redirect('/admin/products/edit-product/' + id);

                    });

                });
            };
        });
    };

});


router.post('/product-gallery/:id', function (req, res) {
    

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'static/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'static/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;
    productImage.mv(path, function(err){
        if(err) console.log(err);

        resizeImg(fs.readFileSync(path), {width: 600 , height: 600 }).then(function(buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});


router.get('/delete-image/:image',isAdmin, function (req, res) {
    
    var originalImage = 'static/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'static/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function(err){
        if(err)
        {
            console.log(err);
        }
        else{
            fs.remove(thumbImage, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    req.flash('success', 'Product deleted');
                        res.redirect('/admin/products/edit-product/' + req.query.id);

                }
            })
        }

    })

});


router.get('/delete-product/:id',isAdmin, function (req, res) {
    var id = req.params.id;
    var path = 'static/product_images/' + id;

    fs.remove(path, function(err){
        if(err) console.log(err);
        else{
            Product.findByIdAndRemove(id, function(err){
                console.log(err);
            });

            req.flash('success',"product deleted")
            res.redirect('/admin/products');
        };
    });

});




module.exports = router;