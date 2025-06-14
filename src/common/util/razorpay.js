import Razorpay from "razorpay";
import dotenv from "dotenv";
import configVariables from "../server/config";

dotenv.config({
    path: './.env'
})

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || configVariables.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET || configVariables.RAZORPAY_KEY_SECRET,
});

export const processPayment = async (amount) => {
    const option = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${new Date().getTime()}`
    }
    try {
        const order = await razorpayInstance.orders.create(option);
        return order;
    } catch (error) {
        console.log("Failed to create Payment")
        throw error
    }
}