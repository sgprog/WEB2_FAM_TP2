/*

Administrator authorisation function

by: Sylvain Gagnon

*/

module.exports = {
    isAdmin: function(req, res, next) {
        if (req.isAuthenticated()) {
            let admin = req.user.roles.find(element => element == 'admin');
            if (admin) {
                return next();
            } else { 
                req.flash('erreur_msg', 'Vous devez avoir un compte administrateur pour accéder à cette page');
                rep.redirect('/');
            }
        } else {
            req.flash('error_msg', 'Vous devez être connectés pour consulter cette page');
            res.redirect('/usagers/login');
        }
    }
}