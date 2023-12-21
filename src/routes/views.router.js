import { Router } from "express";
import productDao from '../daos/dbManager/product.dao.js';

const router = Router()

router.get('/', async (req, res) => {
    try {
        const products = await productDao.getAllProducts();
        res.render('home', { products });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error,
        });
    }
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', {
        title: "realTimeProducts",
    });
});

router.get('/chat', (req, res) => {
    res.render('chat');
  });

router.get('/login', (req, res) => {
    res.render('login');
  });

router.get('/cart', (req, res) => {
    res.render('cart');
  });

router.get('/realTimeProducts/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productDao.getProductById(productId)

        if (!product || product == '') return res.json({ message: "Product not found" })

        res.render('productDetails', {product});
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});
export default router;