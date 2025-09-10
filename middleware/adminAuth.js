// Simple admin authentication middleware

const requireAdmin = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        return next();
    } else {
        return res.redirect('/admin');
    }
};

module.exports = { requireAdmin };
