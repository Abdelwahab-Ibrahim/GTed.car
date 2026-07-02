const express = require('express');
const router = express.Router();

const car = require('../controllers/car');
const verifyJWT = require('../middleware/verifyJWT');
const uploadCar = require('../middleware/uploadCarImages');

router.get('/list', car.getCars);
router.get('/my-cars', verifyJWT, car.getMyCars);

router.get('/search', car.searchCar);
router.get('/:id', car.getOneCar);
router.post('/', verifyJWT, uploadCar.array('images', 2), car.creatCar);
router.patch('/:id', verifyJWT, car.updateCar);
router.delete('/:id', verifyJWT, car.deleteCar);
// search by query string
// router.get('/search', car.searchCar);

module.exports = router;
