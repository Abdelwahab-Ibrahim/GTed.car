const Order = require('../models/Order');
const Car = require('../models/Car');

module.exports = {
    getOrders: async (req, res) => {
        try {
            const orders = await Order.find({ userid: req.userid }).populate('carid', 'manufacturer model year price images');
            const result = orders.map(order => ({
                id: order._id,
                car: order.carid,
                price: order.price,
                createdAt: order.createdAt
            }));
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    creatOrder: async (req, res) => {
        try {
            const { carid, price } = req.body;
            if (!carid || !price) {
                return res.status(400).json({ message: 'carid and price are required' });
            }
            const car = await Car.findById(carid);
            if (!car) {
                return res.status(404).json({ message: 'Car not found' });
            }
            if (!car.available) {
                return res.status(400).json({ message: 'Car is not available' });
            }

            const order = new Order({
                carid,
                userid: req.userid,
                price
            });
            await order.save();
            car.available = false;
            await car.save();

            res.status(201).json({ message: 'Order created successfully', id: order._id });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const orderid = req.params.id;
            const order = await Order.findById(orderid);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            if (String(order.userid) !== String(req.userid)) {
                return res.status(403).json({ message: 'not authorized' });
            }

            const car = await Car.findById(order.carid);
            if (car) {
                car.available = true;
                await car.save();
            }
            await order.deleteOne();
            res.status(200).json({ message: 'Order canceled successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};