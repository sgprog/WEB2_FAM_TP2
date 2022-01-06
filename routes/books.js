/*

Routing for the book section of the website

by: Sylvain Gagnon

*/

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { type, redirect } = require('express/lib/response');
const passport = require('passport');
const Books = require('../models/books');
const { isAuthenticated } = require('../config/auth');

// Constants object to control display
const h_ShowAll = {
    showHeader: true,
    showDisconnectButton: true
}

const h_HideButton = {
    showHeader: true,
    showDisconnectButton: false
}

const h_Hide = {
    showHeader: false,
    showDisconnectButton: false 
}

// Main route...
router.get('/',  isAuthenticated, (req, res) => renderBookMenu(req, res));
router.get('/consulter/:idLivre', isAuthenticated, (req, res) => renderBookDetails(req, res));
router.get('/editer', isAuthenticated, (req, res) => renderEditBook(req, res));
router.get('/ajouter', isAuthenticated, (req, res) => renderBookRegister(req, res));
router.get('/supprimer', isAuthenticated, (req, res) => renderDeleteBook(req, res));
router.post('/ajouter', isAuthenticated, (req, res) => processBookRegister(req, res));



// Render functions for GET request method
const renderBookMenu = (req, res) => {
    Books.find( (err, bookList) => {
        if (err) throw err;
        res.render(
            'booksMenu', 
            { 
                headPush: 'booksMenu-head-withal',
                bookList,
                user: req.user,
                ...h_ShowAll
            }
        );
    });
};

const renderEditBook = (req, res, data) => {
    
    let localId;
    // If id is provided from body
    if (typeof(data) != 'undefined' && typeof(data.bodyId != 'undefined')) {
        localId = data.bodyId;
    } else { // else get from url query
        localId = req.query._id
    }
    Books.findById(localId, (err, bookElement) => {
        if (err) throw err;
        res.render(
            'editBook',
            { 
                headPush: 'editBook-head-withal',
                bookElement,
                ...data,
                user: req.user,
                ...h_ShowAll
            }
        );
    }); 
};

const renderBookRegister = (req, res) => {
    res.render(
        'bookRegister',
        { 
            headPush: 'usersMenu-head-withal',
            user: req.user,
            ...h_ShowAll
        }
    )
};


const renderBookDetails = (req, res) => {

    let bookId;
    
    bookId = req.params.idLivre;
    Books.findById(bookId, (err, bookElement) => {
        if (err) throw err;
            res.render(
                'bookDetails',
                { 
                    headPush: 'bookDetails-head-withal',
                    bookElement,
                    user: req.user,
                    ...h_ShowAll
                }
            )
    }); 
}

const renderDeleteBook = (req, res) => {
    Books.findById(req.query._id, (err, bookElement ) => {
        if (err) throw err;
        res.render(
            'deleteBook',
            {   
                headPush: 'deleteBook-head-withal',
                bookElement,
                user: req.user,
                ...h_ShowAll
             }
        );
    });
};


// Process function for POST request method
const processBookRegister = (req, res) => {
    const { titre, auteur, resume, editeur, pages, langue, date, prix, genre, url_image } = req.body;
    
    let errList = [];
   
    if (errList.length > 0) {
        res.render('register', {
            headPush,
            errList,
            titre,
            auteur,
            resume,
            editeur,
            pages,
            langue,
            date,
            prix, 
            genre,
            url_image
        });
    } else {
        let newId = new mongoose.Types.ObjectId().toString();
                const newBook = new Books(
                    {
                        _id: newId,
                        titre,
                        auteur,
                        résumé: resume,
                        éditeur: editeur,
                        pages,
                        langue,
                        date,
                        prix,
                        genre,
                        url_image
                    }
                );
                console.log(newBook);
                newBook.save()
                        .then(user => {
                            req.flash(
                                'success_msg',
                                `Le livre ${titre} vient d'être inséré dans la BD.`
                            );
                            res.redirect('/livres');
                        })
                        .catch(err => console.log(err));

    }
}

router.post('/action_supprimer', isAuthenticated, (req, res) => {
    const { _id, titre } = req.body;
    var query = { _id };
    Books.deleteOne( query, (err, bookElement) => {
        if (err) throw err;
        console.log('This user has been deleted: ' + bookElement);
        req.flash(
            'error_msg',
            `Le livre ${titre} vient d'être effacé.`
        );
        res.redirect('/livres');
    })
});


module.exports = router;