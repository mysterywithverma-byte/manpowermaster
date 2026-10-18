import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateStr = searchParams.get("state");

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  if (error || !code) {
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error || "No code provided")}`);
  }

  let role = "seeker";
  try {
    if (stateStr) {
      const parsed = JSON.parse(stateStr);
      if (parsed.role) role = parsed.role;
    }
  } catch {
    // default role
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/?auth_error=Missing+Google+Credentials`);
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.redirect(`${origin}/?auth_error=TokenExchangeFailed`);
    }

    // 2. Fetch Google User Profile
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleProfile = await userInfoResponse.json();
    if (!googleProfile.email) {
      return NextResponse.redirect(`${origin}/?auth_error=NoEmailFromGoogle`);
    }

    // 3. Find or Create User in MongoDB Atlas
    await connectToDatabase();
    let dbUser = await User.findOne({ email: googleProfile.email.toLowerCase() });

    if (!dbUser) {
      dbUser = await User.create({
        name: googleProfile.name || googleProfile.email.split("@")[0],
        email: googleProfile.email.toLowerCase(),
        role: role,
        companyName: role === "employer" ? "My Hiring Organization" : "",
        companyLogo: googleProfile.picture || "",
        savedJobs: [],
        skills: [],
      });
    }

    // 4. Return client-side script to store user in localStorage and redirect
    const userPayload = JSON.stringify({
      _id: dbUser._id.toString(),
      id: dbUser._id.toString(),
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      phone: dbUser.phone || "",
      location: dbUser.location || "",
      companyName: dbUser.companyName || "",
      savedJobs: dbUser.savedJobs || [],
      skills: dbUser.skills || [],
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authenticating...</title>
  <meta charset="utf-8" />
  <script>
    try {
      const user = ${userPayload};
      localStorage.setItem("jn_user", JSON.stringify(user));
      window.location.href = "/?google_auth_success=1";
    } catch (e) {
      window.location.href = "/";
    }
  </script>
</head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fafafa;">
  <div style="text-align: center; padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <p style="font-weight: 700; color: #1e293b; margin: 0 0 8px 0;">Signing you in via Google...</p>
    <p style="font-size: 13px; color: #64748b; margin: 0;">Redirecting to Manpower Master portal</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err: any) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(err.message || "OAuthException")}`);
  }
}
