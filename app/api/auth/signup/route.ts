import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";
import { isValidEmail, validatePassword, sanitizeUser } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields",
          fields: ["name", "email", "password"]
        },
        { status: 400 }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Password requirements not met",
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Check existing user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Generate tokens
    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    const refreshToken = generateRefreshToken(user._id.toString());

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        data: sanitizeUser(user),
      },
      { status: 201 }
    );

    // Set cookies
    return setAuthCookies(accessToken, refreshToken, response);
    
  } catch (error) {
    console.error("Signup error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";

    if (message.includes("whitelist") || message.includes("IP")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "MongoDB Atlas blocked this connection. Add your current public IP to Atlas → Network Access → IP Access List, or allow 0.0.0.0/0 for development.",
        },
        { status: 503 }
      );
    }

    if (message.includes("querySrv") || message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not reach MongoDB. Check your internet connection and MONGODB_URI in .env.local.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}