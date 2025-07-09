import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const accountSchema = new Schema({
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => /^[0-9]{9,18}$/.test(v),
      message: "Bank account number must be 9 to 18 digits"
    }
  },
  accountHolder: {
    type: String,
    required: true,
    trim: true,
  },
  customerId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => /^[A-Za-z0-9]{8,12}$/.test(v),
      message: "Customer Id must be 8 to 12 alphanumeric characters"
    }
  },
  branchName: {
    type: String,
    required: true,
    trim: true
  },
  address:{
    type: String,
    required: true,
    trim: true
  },
  phone:{
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{10}/.test(v); // Validates a 10-digit phone number
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  ifscCode: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v); // Validates IFSC code format
      },
      message: props => `${props.value} is not a valid IFSC code!`
    }
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  password: {
    type: String,
    required: true,
  },
  transactionPin: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    default: null
  },
  userId: {
    type: String,
    default: null
  },
  accountToken: {
    type: String,
    default: null
  }
}, { 
  timestamps: true 
});


accountSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    //Validate password strength
    if (this.password.length < 8) {
      return next(new Error("Password must be at least 8 characters long"));
    }
    if (!/[A-Z]/.test(this.password)) {
      return next(new Error("Password must contain at least one uppercase letter"));
    }
    if (!/[a-z]/.test(this.password)) {
      return next(new Error("Password must contain at least one lowercase letter"));
    }
    if (!/[0-9]/.test(this.password)) {
      return next(new Error("Password must contain at least one number"));
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) {
      return next(new Error("Password must contain at least one special character"));
    }

    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified("transactionPin") && this.transactionPin) {
    //Validate transaction Pin strength
    if (this.transactionPin.length != 4) {
      return next(new Error("Transaction Pin must be exactly 4 characters long"));
    }
    if (!/^\d+$/.test(this.transactionPin)) {
      return next(new Error("Transaction Pin must contain only digits"));
    }
    this.transactionPin = await bcrypt.hash(this.transactionPin, 10);
  }
  next();
});

accountSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

accountSchema.methods.isTransactionPinCorrect = async function (transactionPin) {
  return await bcrypt.compare(transactionPin, this.transactionPin);
};

accountSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      accountNumber: this.accountNumber,
      accountHolder: this.accountHolder,
      customerId: this.customerId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

accountSchema.methods.generateAccountToken = function (userId) {
  return jwt.sign(
    {
      _id: this._id,
      accountNumber: this.accountNumber,
      customerId: this.customerId,
      userId: userId,
    },
    process.env.ACCOUNT_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCOUNT_TOKEN_EXPIRY,
    }
  );
};

const Account = mongoose.model("Account", accountSchema);

export  {Account};
