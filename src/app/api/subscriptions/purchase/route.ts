import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { PRICING_PLANS, PricingPlan } from "../plans/route";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Subscription } from "@/lib/models/Subscription";
import { inMemoryStore, MockUser } from "@/lib/mock-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, userId = "user-employer-1", userRole = "employer" } = body;

    const plan = PRICING_PLANS.find((p: PricingPlan) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ success: false, error: "Invalid plan selected" }, { status: 400 });
    }

    const transactionId = "TXN_" + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString().slice(-4);
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + plan.durationDays);

    let updatedCredits = plan.credits;
    let isDbConnected = false;

    try {
      const conn = await connectToDatabase();
      isDbConnected = !!conn;
    } catch {
      isDbConnected = false;
    }

    if (isDbConnected && mongoose.isValidObjectId(userId)) {
      const user = await User.findById(userId);
      if (user) {
        if (userRole === "employer") {
          user.subscriptionPlan = plan.id;
          user.subscriptionPlanName = plan.name;
          user.subscriptionExpiresAt = validUntilDate;
          user.candidateUnlockCredits = (user.candidateUnlockCredits || 0) + plan.credits;
          if (plan.activeJobLimit) user.activeJobLimit = plan.activeJobLimit;
          updatedCredits = user.candidateUnlockCredits;
        } else {
          user.isVipSeeker = true;
          user.vipExpiresAt = validUntilDate;
        }
        await user.save();

        // Record Subscription entry
        await Subscription.create({
          userId: user._id,
          userRole,
          planId: plan.id,
          planName: plan.name,
          amount: plan.price,
          currency: "INR",
          creditsAdded: plan.credits,
          status: "active",
          transactionId,
          paymentGateway: "razorpay_simulated",
          activeJobLimit: plan.activeJobLimit || 1,
          jobBoostMultiplier: plan.jobBoostMultiplier || 1,
          validUntil: validUntilDate,
        });
      }
    }

    // Sync mock store
    const mockUser = inMemoryStore.users.find((u: MockUser) => u._id === userId);
    if (mockUser) {
      if (userRole === "employer") {
        mockUser.subscriptionPlan = plan.id;
        mockUser.subscriptionPlanName = plan.name;
        mockUser.candidateUnlockCredits = (mockUser.candidateUnlockCredits || 0) + plan.credits;
        if (plan.activeJobLimit) mockUser.activeJobLimit = plan.activeJobLimit;
        updatedCredits = mockUser.candidateUnlockCredits;
      } else {
        mockUser.isVipSeeker = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to ${plan.name}!`,
      transactionId,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        creditsAdded: plan.credits,
        totalCredits: updatedCredits,
        validUntil: validUntilDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Subscription purchase error:", error);
    return NextResponse.json({ success: false, error: "Failed to process subscription" }, { status: 500 });
  }
}
