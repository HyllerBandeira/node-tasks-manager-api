const underMaintance = false;

const underMaintanceMiddleware = async (req, res, nxt) => {
    if (underMaintance)
        return res.status(503)
            .send('Try back soon.');
    nxt();
}

module.exports = underMaintanceMiddleware;