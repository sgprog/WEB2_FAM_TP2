/*

Routing for the user section of the website

by: Sylvain Gagnon

*/

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { type, redirect } = require('express/lib/response');
const passport = require('passport');
const Users = require('../models/users');
const { isAuthenticated } = require('../config/auth');
const { isAdmin } = require('../config/auth_admin');
const fs = require('fs');
const nodeJsPath = require('path');

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

// Main Users routes...
router.get('/', (req, res) => res.render('login'));
router.get('/login', (req, res) => res.render('login'));
router.get('/logout', isAuthenticated, (req, res) => processLogout(req, res));
router.get('/logoutpage', isAuthenticated, (req, res) => renderLogoutPage(req, res));
router.get('/ajouter', isAuthenticated, isAdmin, (req, res) => renderUserRegister(req, res));
router.get('/menu',  isAuthenticated, isAdmin, (req, res) => renderUserMenu(req, res));
router.get('/editer', isAuthenticated, isAdmin, (req, res) => renderEditUser(req, res));
router.get('/supprimer', isAuthenticated, isAdmin, (req, res) => renderDeleteUser(req, res));


// Render functions for GET request method
const renderUserRegister = (req, res) => {
    res.render(
        'register',
        { 
            headPush: 'usersMenu-head-withal',
            user: req.user,
            ...h_ShowAll
        }
    )
};

const renderUserMenu = (req, res) => {
    Users.find( (err, userList) => {
        if (err) throw err;
        res.render(
            'usersMenu', 
            { 
                headPush: 'usersMenu-head-withal',
                userList,
                user: req.user,
                ...h_ShowAll
            }
        );
    });
};

const renderEditUser = (req, res, data) => {
    
    let localId;
    // If id is provided from body
    if (typeof(data) != 'undefined' && typeof(data.bodyId != 'undefined')) {
        localId = data.bodyId;
    } else { // else get from url query
        localId = req.query._id
    }
    // console.log('localId = ' + localId );
    Users.findById(localId, (err, userElement) => {
        if (err) throw err;
        res.render(
            'editUser',
            { 
                headPush: 'editUser-head-withal',
                userElement,
                ...data,
                user: req.user,
                ...h_ShowAll
            }
        );
    }); 
};

const renderDeleteUser = (req, res) => {
        Users.findById(req.query._id, (err, userElement ) => {
            if (err) throw err;
            res.render(
                'deleteUser',
                {   
                    headPush: 'deleteUser-head-withal',
                    userElement,
                    user: req.user,
                    ...h_ShowAll
                 }
            );
        });
};

const hashing = (rawPwd, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        if (err)
            throw err;
        bcrypt.hash(rawPwd, salt, (err, hash) => {
            if (err)
                throw err;
            hashRendering = hash;
            console.log(`hash ${hash}`);
            callback(null, hash);
        });
    })
};

const renderLogoutPage = (req, res) => {
    res.render(
        'logoutPage',
        { 
            headPush: 'logoutPage-head-withal',
            user: req.user,
            ...h_HideButton
        }
    )
}

const processLogout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'Déconnexion réussie');
    res.redirect('/usagers/login');
}



// POST routing
router.post('/login', (req, res, next) => {
    const { email, password } = req.body;
    let errList = [];
    if ( !email || !password ) {
        errList.push( { msg: 'Remplir tous les champs'});
    } else {
        passport.authenticate('local', {
            successRedirect: '../index',
            failureRedirect: './login',
            failureFlash: true
        })(req, res, next)
    }
})

router.post('/action_supprimer', isAuthenticated, (req, res) => {
    const { _id, userName } = req.body;
    var query = { _id };
    Users.deleteOne( query, (err, userElement) => {
        if (err) throw err;
        console.log('This user has been deleted: ' + userElement);
        req.flash(
            'error_msg',
            `L'usager ${userName} vient d'être effacé.`
        );
        res.redirect('/usagers/menu');
    })
});

router.post('/action_editer', isAuthenticated, (req, res) => {
    // console.log('req: ');
    // console.log(req);
    const maxFileSize = 2 * 1024 * 1024;
    const { _id, userName, email, password, password2, previousName, admin, gestion } = req.body;
    // Conidition to decide if image file needs to be treathed or not
    const putImage = req.files.length > 0;
    // if (putImage) {
    
    //     const { originalname, destination, filename, size, path, mimetype} = req.files[0] ;
    // }
    const { originalname, destination, filename, size, path, mimetype} = req.files[0];
    
    const mimetypePermis = [ 'image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp']
    let userTypeArray = ['normal'];
    if (admin) {userTypeArray.push('admin')};
    if (gestion) {userTypeArray.push('gestion')};
    let nom = userName;
    var data = {};
    let errList = [];
    let bodyId = _id;

    const finalizeUpdateAndExit = () => {
        if (putImage) {
            // Save file into img folder
            console.log('path: ' + path);
            data.fichierImage = keepFile(path, filename);
        }
        
        Users.findByIdAndUpdate( _id, data, { new: true }, (err, user) => {
            if (err) throw err;
            req.flash(
                'error_msg',
                `L'usager ${previousName} vient d'être modifié.`
            );
            res.redirect('/usagers/menu');
        });
    }

    const processPassword = (next) => {
        if (password != ''){
            let isLocalError = false;
            if (password != password2) {
                errList.push( { msg: 'Les mots de passe ne sont pas identiques'});
                isLocalError = true;
            }
            if (password.length < 6) {
                errList.push( { msg: 'Le mot de passe doit former au moins 6 caractères'});
                isLocalError = true;
            }
            if (!isLocalError) {
                hashing(password, (err, hashResult) => {
                    if (err) throw err;
                    data.password = hashResult;
                    next();
                })
            } else {
                renderEditUser(req, res, {errList, bodyId});
            }
        } else {
            next();
        }
    }

    if (userName != '') {
        data.nom = userName;
    }
    if (email != '') {
        data.email = email;
    }

    // Redefine roles 
    data.roles = userTypeArray;
    
    if (data.email) {
        
        Users.findOne( { email: email }, (err, user) => {
            if (err) throw err;
            if (user) {
                if (user._id != req.body._id) {
                    errList.push({ msg: 'Ce courriel est déjà attribué à un autre usager'});
                    renderEditUser(req, res, {errList, bodyId} );
                } else {
                    processPassword( () => {
                        finalizeUpdateAndExit();
                    })
                }
            } else {
                processPassword( () => {
                    finalizeUpdateAndExit();
                })
            }
        })
    } else {
        processPassword( () => {
            finalizeUpdateAndExit();
        })
    }
    
})

router.post('/ajouter', isAuthenticated, (req, res) => {
    const { userName, email, password, password2, admin, gestion } = req.body;
    // Conidition to decide if image file needs to be treathed or not
    const putImage = req.files.length > 0;
    const maxFileSize = 2 * 1024 * 1024;
    let { originalname, destination, filename, size, path, mimetype} = req.files[0] ;
    // try {
        
    // } catch (e) {
    //     console.log('File was not loaded');
    // }
        
    // }

    const mimetypePermis = [ 'image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];
    let userTypeArray = ['normal'];
    if (admin) {userTypeArray.push('admin')};
    if (gestion) {userTypeArray.push('gestion')};
    
    let nom = userName;
    
    let errList = [];

    if (putImage) {
        if (size > maxFileSize) {
            errList.push( { msg: 'La taille du fichier est trop grande'});
        }

        if (!mimetypePermis.includes(mimetype)) {
            errList.push({ msg: 'Format de fichier non accepté'});
            
        }
    }

    let headPush = 'usersMenu-head-withal';

    if (!userName || !email || !password || !password2) {
        errList.push( { msg: 'Remplir tous les champs' });
    }
    if (password != password2) {
        errList.push( { msg: 'Les mots de passe ne sont pas identiques'});
    }
    if (password.length < 6) {
        errList.push( { msg: 'Le mot de passe doit former au moins 6 caractères'});
    }
    if (errList.length > 0) {

        clearFile(path);
        res.render('register', {
            headPush,
            errList,
            nom,
            email,
            password,
            password2,
            admin,
            gestion
        });
    } else {
        Users.findOne({ email: email }).then( match => {
            if (match) {
                clearFile(path);
                errList.push({ msg: 'Ce courriel existe déjà'});
                res.render('register', {
                    headPush,
                    errList,
                    nom,
                    email,
                    password,
                    password2,
                    admin,
                    gestion
                })
            } else {
                let newId = new mongoose.Types.ObjectId().toString();
                const newUser = new Users(
                    {
                        _id: newId,
                        nom: userName,
                        email,
                        password,
                        roles: userTypeArray
                    }
                );
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        if (putImage) {
                            // Save file into img folder
                            newUser.fichierImage = keepFile(path, filename);
                        } // else {
                        //     newUser.fichierImage = '';
                        // }
                        // console.log('before save');
                        // console.log('fichierImage: ' + newUser.fichierImage);
                        newUser.password = hash;
                        newUser.save()
                        .then(user => {
                            req.flash(
                                'success_msg',
                                `L'usager ${userName} vient d'être inséré dans la BD.`
                            );
                            res.redirect('/usagers/menu');
                        })
                        .catch(err => console.log(err));
                    }) 
                })
            }
        })
    }
})

// Function to erase image file on local folder
const clearFile = (path) => {
    let fileName = nodeJsPath.join(__dirname, '..', path);
    fs.unlink(fileName, err => {
        if (err) 
            console.log(err);
        else 
            console.log('File has been erase ', fileName);

    })
}

// Function to move an image from upload to main picture folder
const keepFile = (path, fileName) => {
    let tempFileName = nodeJsPath.join(__dirname, '..', path);
    let newFile = nodeJsPath.join(__dirname, '..', 'static', 'img', fileName);
    fs.rename(tempFileName, newFile, err => {
        if (err) {
            console.log(err);
        } else {
            console.log('File has been renamed', newFile);
        }
    })
    return fileName;
}
module.exports = router;