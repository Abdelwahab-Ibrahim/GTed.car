const express = require('express');
const router = express.Router();

const order = require('../controllers/order');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/list', verifyJWT, order.getOrders);
router.post('/', verifyJWT, order.creatOrder);
router.delete('/:id', verifyJWT, order.cancelOrder);


module.exports = router;
