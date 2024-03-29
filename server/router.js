const router = require('express').Router();

const MessageMdw = requireWrp('middlewares/message-middleware');
const ErrorHandlerMdw = requireWrp('middlewares/error-handler-middleware');
const routes = route => requireWrp(`routes/${route}`);

/* GET home page. */
router.use(MessageMdw);
router.use('/', routes('home-router'));
router.use('/api', routes('api'));
router.use('/', routes('vue-router'));
router.use(ErrorHandlerMdw);

module.exports = router;
