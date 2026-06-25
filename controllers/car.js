const path = require('path');
const fsPromises = require('fs').promises;

const Car = require('../models/Car');
const User = require('../models/User');

module.exports = {

    //            ---------------------- Get All Cars ------------------------

    getCars: async (req, res) => {
        try {
            const cars = await Car.find({ available: true }).select('manufacturer model year price images');
            const result = cars.map(c => ({
                id: c._id,
                manufacturer: c.manufacturer,
                model: c.model,
                year: c.year,
                price: c.price,
                image: `/uploads/cars/${c.images.exterior}`
            }));
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching cars', error: error.message });
        }
    },

    //            ---------------------- Get One Car ------------------------

    getOneCar: async (req, res) => {
        const carid = req.params.id;
        const car = await Car.findById(carid);

        if (!car) {
            return res.status(404).json({ message: 'car not found' });
        }
        const seller = await User.findById(car.sellerid).select('firstName lastName avatar');
        if (!seller) {
            return res.status(404).json({ message: 'seller not found' });
        }

        const carObj = car.toObject();
        carObj.images.exterior = `/uploads/cars/${carObj.images.exterior}`;
        carObj.images.interior = carObj.images.interior ? `/uploads/cars/${carObj.images.interior}` : null;

        const sellerObj = seller.toObject();
        sellerObj.avatar = sellerObj.avatar ? `/uploads/avatars/${sellerObj.avatar}` : null;

        res.status(200).json({ car: carObj, seller: sellerObj });
    },

    //            ---------------------- Create Car ------------------------

    creatCar: async (req, res) => {
        const { manufacturer, model, year, price, color, milage, hp, engine } = req.body;
        const sellerid = req.userid;
        const images = {
            exterior: req.files[0].filename,
            interior: req.files[1].filename
        };
        const car = new Car({
            manufacturer,
            model,
            year,
            price,
            color,
            milage,
            hp,
            engine,
            images,
            sellerid
        });

        try {
            await car.save();
            return res.status(201).json({ message: 'Car created successfully', id: car._id });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    //            ---------------------- Update Cars ------------------------

    updateCar: async (req, res) => {
        const carid = req.params.id;
        const car = await Car.findById(carid);

        if (!car) {
            return res.status(404).json({ message: 'car not found' });
        }

        if (String(car.sellerid) !== String(req.userid)) {
            return res.status(403).json({ message: 'not authorized' });
        }

        const { manufacturer, model, year, price, color, milage, hp, engine, available } = req.body;

        if (manufacturer) car.manufacturer = manufacturer;
        if (model) car.model = model;
        if (year !== undefined) car.year = year;
        if (price !== undefined) car.price = price;
        if (color) car.color = color;
        if (milage !== undefined) car.milage = milage;
        if (hp !== undefined) car.hp = hp;
        if (engine) car.engine = engine;
        if (available !== undefined) car.available = available;

        try {
            await car.save();
            return res.status(200).json({ message: 'Car updated successfully' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    //            ---------------------- Search Cars ------------------------
    searchCar: async (req, res) => {
        try {
            const query = (req.query.q || '').trim();
            if (!query) {
                return res.status(400).json({ message: 'Search query is required' });
            }
            const regex = new RegExp(query, 'i');
            const cars = await Car.find({
                available: true,
                $or: [
                    { manufacturer: regex },
                    { model: regex },
                    { color: regex }
                ]
            }).select('manufacturer model year price images');
            const result = cars.map(c => ({
                id: c._id,
                manufacturer: c.manufacturer,
                model: c.model,
                year: c.year,
                price: c.price,
                image: `/uploads/cars/${c.images.exterior}`
            }));
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    //            ---------------------- Delete Cars ------------------------

    deleteCar: async (req, res) => {
        try {
            const carid = req.params.id;
            const car = await Car.findById(carid);
            if (!car) {
                return res.status(404).json({ message: 'not found' });
            }
            if (String(car.sellerid) !== String(req.userid)) {
                return res.status(403).json({ message: 'not authorized' });
            }

            if (car.images.exterior) {
                const exteriorpath = path.join(__dirname, '../uploads/cars', car.images.exterior);
                await fsPromises.unlink(exteriorpath).catch(() => {});
            }
            if (car.images.interior) {
                const interiorpath = path.join(__dirname, '../uploads/cars', car.images.interior);
                await fsPromises.unlink(interiorpath).catch(() => {});
            }

            await car.deleteOne();
            res.status(200).json({ message: 'car deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
};
