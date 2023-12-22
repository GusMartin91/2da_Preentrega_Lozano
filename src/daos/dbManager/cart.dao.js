import { cartModel } from "../../models/cart.model.js";

class CartDao {
    constructor() {
        this.model = cartModel;
    }

    async getCartByUser(userId) {
        let cart = await this.model.findOne({ userId });
        if (!cart) {
            try {
                cart = await this.model.create({ userId, products: [] });
            } catch (error) {
                console.error("Error al crear el carro:", error.message);
            }
        }
        return cart;
    }


    async addToCart(userId, productId, quantity) {
        const cart = await this.getCartByUser(userId);
        if (cart) {
            const index = cart.products.findIndex((item) => item.productId === productId);
            if (index !== -1) {
                cart.products[index].quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
            }
            await cart.save();
        } else {
            await this.model.create({ userId, products: [{ productId, quantity }] });
        }
    }

    async removeFromCart(userId, productId) {
        const cart = await this.getCartByUser(userId);
        if (cart) {
            cart.products = cart.products.filter((item) => item.productId !== productId);
            await cart.save();
        }
    }

    async clearCart(userId) {
        const cart = await this.getCartByUser(userId);
        if (cart) {
            cart.products = [];
            await cart.save();
        }
    }
}

export default new CartDao();
