exports.get404 = (req, res, next) => {
    res.status(404).render('not-found', {
        docTitle: '404 - Page not found!', 
        path: '/404',
        isAuthenticated: req.session.isLoggedIn
    });
};

exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        docTitle: 'Error!', 
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
};