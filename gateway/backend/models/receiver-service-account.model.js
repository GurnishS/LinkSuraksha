// _id	ObjectId	Unique identifier
// userId	ObjectId	Reference to the user
// toAccountNumber	String	Receiver’s account number
// createdAt	Date	Timestamp of creation

import mongoose from "mongoose";

const receiverServiceAccountSchema = new mongoose.Schema(
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

    displayName: {
      type: String,
      default: "Link Suraksha User",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReceiverServiceAccount = mongoose.model(
  "ReceiverServiceAccount",
  receiverServiceAccountSchema
);
export { ReceiverServiceAccount };
