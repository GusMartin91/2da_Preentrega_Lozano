import { Router } from "express";
import productDao from "../daos/dbManager/product.dao.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const products = await productDao.getAllProducts();
        res.json(products);
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error,
        })
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productDao.getProductById( productId )

        if (!product || product == '') return res.json({ message: "Product not found" })

        res.json({ product })
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
        const product = req.body;
        const response = await productDao.createProduct(product)

        res.json({ message: "Ok", response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const newProduct = req.body
        const response = await productDao.updateProduct(productId, newProduct)
        if (response.modifiedCount == 0) return res.json({ error: "Product not updated", })

        res.json({ response })
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const response = await productDao.deleteProduct(productId)
        if (!response) return res.json({ error: "Product not found" })
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