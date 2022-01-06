/*

Model definition to access Users database

by: Sylvain Gagnon

*/

const mongoose = require('mongoose');
const { type } = require('express/lib/response');

let schemaUser = mongoose.Schema(
    {
        _id: {
            type: String,
            required: true
        },
        nom: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now()
        },
        roles: {
            type: Array,
            required: true,
            default: ['normal']
        },
        fichierImage: {
            type: String,
            required: false,
            default: ''
        }
    }
);

let Users = module.exports = mongoose.model('usagers2', schemaUser);


