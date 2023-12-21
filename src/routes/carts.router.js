import { Router } from "express";
import CartDao from "../daos/dbManager/cart.dao.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const carts = await CartDao.getAllCarts();
        res.json(carts);
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error,
        });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await CartDao.getCartById(cartId);

        if (!cart || cart === '') return res.json({ message: "Cart not found" });

        res.json({ cart });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const cart = req.body;
        const response = await CartDao.createCart(cart);

        res.json({ message: "Ok", response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const newCart = req.body;
        const response = await CartDao.updateCart(cartId, newCart);
        if (response.modifiedCount === 0) return res.json({ error: "Cart not updated" });

        res.json({ response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const response = await CartDao.deleteCart(cartId);
        if (!response) return res.json({ error: "Cart not found" });
        res.json({ response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

export default router;
