import mongoose from "mongoose";
import merchantTransactionStatus from "../enums/merchant-transaction-status.js";

const merchantTransactionSchema = new mongoose.Schema(
  {
    senderServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SenderServiceAccount",
      default: null,
    },

    receiverServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReceiverServiceAccount",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      required: true,
      enum: Object.values(merchantTransactionStatus),
    },
  },
  {
    timestamps: true,
  }
);

const MerchantTransaction = mongoose.model("MerchantTransaction", merchantTransactionSchema);
export { MerchantTransaction };
