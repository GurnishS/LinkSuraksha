import {User} from "../models/user.model.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Account } from '../models/account.model.js';

const currentUserProfile = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Name and email are required");
    }
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json({
        success: true,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            address: user.address,
        }
    });
});

const deleteUserProfile = asyncHandler(async (req, res) => {
    const { email,name } = req.body;
    const _id = req.user;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    if (!name) {
        throw new ApiError(400, "Name is required");
    }
    const user = await User.findOneAndDelete({ email,name });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const result = await Account.deleteMany({ accountHolder: name, userId: _id });

    res.status(200).json({
        success: true,
        message: "User profile deleted successfully",
        redirect: "/logout"
    });
});

export { currentUserProfile,deleteUserProfile };