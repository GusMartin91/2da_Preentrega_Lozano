import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  userId: { type: String, required: true },
  products: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
});

const cartModel = model("carts", cartSchema);

export { cartModel };