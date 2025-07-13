// Field	Type	Description
// _id	ObjectId	Unique identifier
// userId	ObjectId	Reference to the user
// toAccountNumber	String	Receiver's account number
// fromAccountNumber	String	Sender's account number
// amount	Number	Amount to be transferred
// status	String	Debited → Pending → Credited | Refunded
// createdAt	Date	Timestamp of creation
// updatedAt	Date	Timestamp of last update

import mongoose from "mongoose";
import SenderTransactionStatus from "../enums/sender-transaction-status.js";

const senderServiceAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    toAccountNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^[0-9]{9,18}$/.test(v),
        message: "Bank account number must be 9 to 18 digits",
      },
    },

    toReceiverServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReceiverServiceAccount",
      default: null,
      required: false,
    },

    fromAccountNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^[0-9]{9,18}$/.test(v),
        message: "Bank account number must be 9 to 18 digits",
      },
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: Object.values(SenderTransactionStatus),
      default: SenderTransactionStatus.INITIATED,
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const SenderServiceAccount = mongoose.model(
  "SenderServiceAccount",
  senderServiceAccountSchema
);
export { SenderServiceAccount };
