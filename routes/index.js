/*

Routing for the main menu section of the website

by: Sylvain Gagnon

*/

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../config/auth');
const Users = require('../models/users');

// Constants object to control display
const h_ShowAll = {
    showHeader: true,
    showDisconnectButton: true
}

// Function to redenr the main index page
const renderIndex = (req, res) => {
    res.render(
        'index',
        { 
            headPush: 'index-head-withal',
            user: req.user,
            ...h_ShowAll,
            hideBackToMainMenu: true
        })
}

// Main Routings...
router.get('/', isAuthenticated, (req, res) => renderIndex(req, res));
router.get('/index', isAuthenticated, (req, res) => renderIndex(req, res));

module.exports = router;