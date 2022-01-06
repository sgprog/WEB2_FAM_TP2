/*

Model definition to access Books database

by: Sylvain Gagnon

*/

const mongoose = require('mongoose');
const { type } = require('express/lib/response');

let schemaBook = mongoose.Schema(
    {
        _id: {
            type: String,
            required: true
        },
        titre: {
            type: String,
            required: true
        },
        auteur: {
            type: String,
            required: true
        },
        "résumé": {
            type: String,
            required: true
        },
        "éditeur": {
            type: String,
            required: true
        },
        pages: {
            type: Number,
            required: true
        },
        langue: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        prix: {
            type: Number,
            required: true
        },
        genre: {
            type: String,
            required: true
        },
        url_image: {
            type: String,
            required: true
        },
    }
);

let Books = module.exports = mongoose.model('livres', schemaBook);


