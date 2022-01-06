/*

Gestion authorisation function

by: Sylvain Gagnon

*/

module.exports = {
    isGestion: function(req, res, next) {
        if (req.isAuthenticated()) {
            let gestion = req.user.roles.find(element => element == 'gestion');
            if (gestion) {
                return next();
            } else { 
                req.flash('erreur_msg', 'Vous devez avoir un compte de gestionnaire pour accéder à cette page');
                rep.redirect('/');
            }
        } else {
            req.flash('error_msg', 'Vous devez être connectés pour consulter cette page');
            res.redirect('/usagers/login');
        }
    }
}