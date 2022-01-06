/*

Function to manage authetication status

by: Sylvain Gagnon

*/

module.exports = {
    isAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash('error_msg', 'Vous devez être connectés pour consulter cette page');
            res.redirect('/usagers/login');
        }
    }
}