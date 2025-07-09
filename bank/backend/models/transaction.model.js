import mongoose, { Schema } from "mongoose";
import TransactionStatus from "../enums/transaction-status.js";

const transactionSchema = new Schema({
  toAccountNumber: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[0-9]{9,18}$/.test(v),
      message: "Bank account number must be 9 to 18 digits"
    }
  },
  fromAccountNumber: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[0-9]{9,18}$/.test(v),
      message: "Bank account number must be 9 to 18 digits"
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.INITIATED,
  },
  note: {
    type: String,
    trim: true,
    default: ""
  }
}, {
  timestamps: true
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export { Transaction, transactionSchema };
