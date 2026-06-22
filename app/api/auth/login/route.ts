import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth";
import { setAuthCookies } from "@/lib/cookies";
import { sanitizeUser } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    const formattedEmail = email.toLowerCase().trim();
    console.log("--------------------------------------------------");
    console.log("🔍 [LOGIN DEBUG] Input Email sent from frontend:", formattedEmail);

    // Find user with password field
    const user = await User.findOne({ 
      email: formattedEmail 
    }).select("+password");

    // User not found
    if (!user) {
      console.log("❌ [LOGIN DEBUG] User found in DB?: NO (Email match nahi hui ya user exist nahi karta)");
      console.log("--------------------------------------------------");
      await delay(500); // Prevent timing attacks
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("✅ [LOGIN DEBUG] User found in DB?: YES");

    // Check account status
    if (!user.isActive) {
      console.log("⚠️ [LOGIN DEBUG] User Account Status: Disabled");
      console.log("--------------------------------------------------");
      return NextResponse.json(
        { success: false, error: "Account disabled. Contact support." },
        { status: 403 }
      );
    }

    // Check lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      console.log(`⚠️ [LOGIN DEBUG] User Account Status: Locked for ${minutesLeft} mins`);
      console.log("--------------------------------------------------");
      return NextResponse.json(
        { 
          success: false, 
          error: `Account locked. Try again in ${minutesLeft} minutes` 
        },
        { status: 429 }
      );
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    console.log("🔑 [LOGIN DEBUG] Is Password Valid according to bcrypt?:", isValid);
    console.log("--------------------------------------------------");
    
    if (!isValid) {
      // Increment failed attempts
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60000); // 15 min lock
      }
      
      await user.save();
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid credentials",
          attemptsLeft: Math.max(0, 5 - user.loginAttempts)
        },
        { status: 401 }
      );
    }

    // Successful login - reset attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    const refreshToken = generateRefreshToken(user._id.toString());

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: sanitizeUser(user),
      },
      { status: 200 }
    );

    // Set cookies and return
    return setAuthCookies(accessToken, refreshToken, response);
    
  } catch (error) {
    console.error("❌ [LOGIN DEBUG] Login error:", error);
    console.log("--------------------------------------------------");
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper to prevent timing attacks
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}