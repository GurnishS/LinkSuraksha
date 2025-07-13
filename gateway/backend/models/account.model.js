import mongoose from "mongoose";
import AccountStatus from "../enums/account-status.js";
import bcrypt from "bcrypt";

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: (v) => /^[0-9]{9,18}$/.test(v),
        message: "Bank account number must be 9 to 18 digits",
      },
    },

    accountHolder: {
      type: String,
      required: true,
      trim: true,
    },

    customerId: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^[A-Za-z0-9]{8,12}$/.test(v),
        message: "Customer Id must be 8 to 12 alphanumeric characters",
      },
    },

    ifscCode: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v); // Validates IFSC code format
        },
        message: (props) => `${props.value} is not a valid IFSC code!`,
      },
    },

    accountToken: {
      type: Object,
      default: null, // { _id (Bank Account Id), accountNumber ,userId}
    },

    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING,
    },

    gatewayPin: {
      type: String,
      required: true,
    },

    isMerchant: {
      type: Boolean,
      default: false,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    apiKeys: [
      {
        name: {
          type: String,
          required: true,
        },
        key: {
          type: String,
          required: true,
        },
        secret:{
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

accountSchema.pre("save", async function (next) {
  if (this.isModified("gatewayPin") && this.gatewayPin) {
    if (this.gatewayPin.length < 4 || this.gatewayPin.length > 6) {
      return next(
        new Error("Gateway Pin must be between 4 and 6 characters long.")
      );
    }
    if (!/^\d+$/.test(this.gatewayPin)) {
      return next(new Error("Gateway Pin must contain only digits."));
    }
    this.gatewayPin = await bcrypt.hash(this.gatewayPin, 10);
  }

  next();
});

accountSchema.methods.isGatewayPinCorrect = async function (gatewayPin) {
  return await bcrypt.compare(gatewayPin, this.gatewayPin);
};

const Account = mongoose.model("Account", accountSchema);
export { Account };
