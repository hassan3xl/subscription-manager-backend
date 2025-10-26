// utils/paystack.js
import Paystack from "paystack";
import {
  PAYSTACK_PUBLIC_KEY,
  PAYSTACK_SECRET_KEY,
  PAYSTACK_CALLBACK_URL,
} from "./env.js";

// utils/paystack.js - CORRECTED VERSION
import axios from "axios";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Create axios instance with Paystack headers
const paystackAPI = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export const initializePayment = async (email, amount, metadata = {}) => {
  try {
    console.log("Initializing payment for:", { email, amount, metadata });

    const response = await paystackAPI.post("/transaction/initialize", {
      email,
      amount: amount * 100, // Convert to kobo
      currency: "NGN",
      metadata,
      callback_url: PAYSTACK_CALLBACK_URL,
    });

    console.log("Paystack response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message
    );
    throw new Error(
      `Paystack initialization failed: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

export const verifyPayment = async (reference) => {
  try {
    console.log("Verifying payment reference:", reference);

    const response = await paystackAPI.get(`/transaction/verify/${reference}`);

    console.log("Paystack verification response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message
    );
    throw new Error(
      `Payment verification failed: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

export default paystackAPI;
