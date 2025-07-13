import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const registerUser=asyncHandler( async(req,res)=>{
    const {name,email,address,password} = req.body;
    if(!name || !email || !address || !password){
        throw new ApiError(400,"All fields are required");
    }
    const existingUser = await User.find({ email });
    if (existingUser.length > 0) {
        throw new ApiError(400, "User already exists with this email");
    }

    const user = await User.create({
        name,
        email,
        address,
        password,
    });

    if (!user) {
        throw new ApiError(500, "Database error: User not created");
    }

    res.status(201).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            address: user.address,
        },
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = user.generateAccessToken();
    if (!token) {
        throw new ApiError(500, "Error generating access token");
    }

    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            address: user.address,
            token: token,
        },
    });

});

export {registerUser,loginUser};