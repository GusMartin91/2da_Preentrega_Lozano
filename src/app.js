import express from 'express'
import { password, db_name, PORT } from './env.js'
import mongoose from "mongoose";
import handlebars from 'express-handlebars';
import Handlebars from "handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import { Server } from 'socket.io'
import viewRouter from './routes/views.router.js'
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import messagesRouter from "./routes/messages.router.js";
import productDao from "./daos/dbManager/product.dao.js";
import messageDao from "./daos/dbManager/message.dao.js";
import cartDao from "./daos/dbManager/cart.dao.js";
import path from 'path';
import { fileURLToPath } from 'url'
import { log } from 'util';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const httpServer = app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))
const socketServer = new Server(httpServer)
let userEmailApp;
mongoose.connect(`mongodb+srv://gusmartin91:${password}@ecommerce.o43oskf.mongodb.net/${db_name}?retryWrites=true&w=majority`)
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.engine('hbs', handlebars.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', viewRouter)
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/messages', messagesRouter);

socketServer.on('connection', async (socketClient) => {

    socketClient.on('messageRTP',async (data) => {
        console.log('Cliente Conectado: ', data);
        userEmailApp = data
        socketClient.emit('realTimeProducts', { products: await productDao.getAllProducts(), cart: await cartDao.getCartByUser(userEmailApp) });
    });


    socketClient.on('addProduct', async (newProduct) => {
        await productDao.createProduct(newProduct);
        socketServer.emit('realTimeProducts', { products: await productDao.getAllProducts() });
    });

    socketClient.on('editProduct', async ({ productId, editedProduct }) => {
        await productDao.updateProduct(productId, editedProduct);
        socketServer.emit('realTimeProducts', { products: await productDao.getAllProducts() });
        socketClient.emit('productDetails', { product: await productDao.getProductById(productId) });
    });

    socketClient.on('deleteProduct', async (productId) => {
        await productDao.deleteProduct(productId);
        socketServer.emit('realTimeProducts', { products: await productDao.getAllProducts() });
    });

    socketClient.on('userConnected', async (currentUserEmail) => {
        console.log('User connected:', currentUserEmail);
        socketClient.broadcast.emit('newUserConnected', currentUserEmail);

        try {
            const chatHistory = await obtenerHistorialDeChats();
            socketClient.emit('chatHistory', chatHistory);
        } catch (error) {
            console.log('Error al obtener el historial de chats:', error.message);
            socketClient.emit('chatHistory', []);
        }
    });
    async function obtenerHistorialDeChats() {
        try {
            const chatHistory = await messageDao.getAllMessages();
            return chatHistory;
        } catch (error) {
            console.log('Error al obtener el historial de chats:', error.message);
            return [];
        }
    }

    socketClient.on('sendChatMessage', async ({ email, message }) => {
        const newMessage = {
            email,
            message,
            date: new Date(),
        };
        await messageDao.createMessage(newMessage);
        socketServer.emit('newChatMessage', newMessage);
    });

    let userEmail = ''
    socketClient.on('userCartAuth', async (currentUserEmail) => {
        userEmail = currentUserEmail
        const userCart = await cartDao.getCartByUser(userEmail);
        if (!userCart) {
            userCart = await cartDao.addToCart(userEmail, '', '')
        }
        const productsInfo = await Promise.all(userCart.products.map(async (product) => {
            const productInfo = await productDao.getProductById(product.productId);
            return {
                productId: product.productId,
                info: productInfo,
                quantity: product.quantity
            };
        }));
        socketClient.emit('productsCartInfo', productsInfo);
    });
    socketClient.on('addToCart', async ({productId, currentUserEmail}) => {
        await cartDao.addToCart(currentUserEmail, productId, 1)
        socketClient.emit('realTimeProducts', { products: await productDao.getAllProducts(), cart: await cartDao.getCartByUser(currentUserEmail) });
    });

    socketClient.on('updateCart', async ({ productId, action }) => {
        userEmail=userEmail?userEmail:userEmailApp
        const userCart = await cartDao.getCartByUser(userEmail);
        if (userCart) {
            const productIndex = userCart.products.findIndex((item) => item.productId === productId);
            if (productIndex !== -1) {
                const product = userCart.products[productIndex];
                switch (action) {
                    case 'add':
                        product.quantity++;
                        break;
                    case 'subtract':
                        if (product.quantity > 1) {
                            product.quantity--;
                        }
                        break;
                    default:
                        break;
                }
                await userCart.save();
                const productsInfo = await Promise.all(userCart.products.map(async (product) => {
                    const productInfo = await productDao.getProductById(product.productId);
                    return {
                        productId: product.productId,
                        info: productInfo,
                        quantity: product.quantity
                    };
                }));
                socketClient.emit('productsCartInfo', productsInfo);
                socketClient.emit('realTimeProducts', { products: await productDao.getAllProducts(), cart: await cartDao.getCartByUser(userEmail) });
            }
        }
    });

    socketClient.on('deleteFromCart', async ({ productId }) => {
        const userCart = await cartDao.getCartByUser(userEmail);
        if (userCart) {
            userCart.products = userCart.products.filter((item) => item.productId !== productId);
            await userCart.save();
            const productsInfo = await Promise.all(userCart.products.map(async (product) => {
                const productInfo = await productDao.getProductById(product.productId);
                return {
                    productId: product.productId,
                    info: productInfo,
                    quantity: product.quantity
                };
            }));
            socketClient.emit('productsCartInfo', productsInfo);
            socketClient.emit('realTimeProducts', { products: await productDao.getAllProducts(), cart: await cartDao.getCartByUser(userEmail) });
console.log(userEmail);
        }
    });
});

export { socketServer };