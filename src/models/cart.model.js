import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  userId: { type: String, required: true },
  products: [
    {
      productId: { type: String, required: true, default:'' },
      quantity: { type: Number, required: true, default:0 },
    },
  ],
});

const cartModel = model("carts", cartSchema);

export { cartModel };