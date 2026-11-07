"use client";

import React, { useState } from "react";
import { Modal, Tabs, Button, Tag, Badge, App } from "antd";
import {
  CheckCircleFilled,
  ThunderboltFilled,
  SafetyCertificateFilled,
  WhatsAppOutlined,
  RocketFilled,
  CrownFilled,
  FireFilled,
} from "@ant-design/icons";
import { PRICING_PLANS, PricingPlan } from "@/app/api/subscriptions/plans/route";

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  defaultRole?: "employer" | "seeker";
  userId?: string;
  onSubscriptionSuccess?: (plan: PricingPlan) => void;
}

export default function SubscriptionModal({
  visible,
  onClose,
  defaultRole = "employer",
  userId = "user-employer-1",
  onSubscriptionSuccess,
}: SubscriptionModalProps) {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<string>(defaultRole);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);

  const employerPlans = PRICING_PLANS.filter((p) => p.targetRole === "employer");
  const seekerPlans = PRICING_PLANS.filter((p) => p.targetRole === "seeker");

  const handlePurchase = async (plan: PricingPlan) => {
    setPurchasingPlanId(plan.id);
    try {
      const res = await fetch("/api/subscriptions/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          userId,
          userRole: plan.targetRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success({
          content: `🎉 ${data.message} Txn ID: ${data.transactionId}`,
          duration: 4,
        });
        if (onSubscriptionSuccess) onSubscriptionSuccess(plan);
        onClose();
      } else {
        message.error(data.error || "Failed to process payment");
      }
    } catch {
      message.error("Payment gateway error. Please try again.");
    } finally {
      setPurchasingPlanId(null);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={940}
      centered
      className="subscription-pricing-modal"
      title={
        <div className="flex items-center gap-2 pt-1 pb-1">
          <CrownFilled className="text-amber-500 text-xl" />
          <div>
            <div className="text-base font-bold text-gray-900 leading-tight">
              WorkIndia Plans & Hiring Packages
            </div>
            <div className="text-xs text-gray-500 font-normal">
              Unlock candidate database, boost active jobs, and hire verified talent fast
            </div>
          </div>
        </div>
      }
    >
      <div className="pt-2">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: "employer",
              label: (
                <span className="font-semibold px-2">
                  💼 Employer Hiring Packages ({employerPlans.length})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center gap-2.5">
                    <FireFilled className="text-amber-600 text-base flex-shrink-0" />
                    <span>
                      <strong>WorkIndia Verified Guarantee:</strong> All candidates have verified mobile numbers and actively search for work. Unlock contact details and call directly via phone or WhatsApp.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {employerPlans.map((plan) => {
                      const isPopular = plan.popular;
                      return (
                        <div
                          key={plan.id}
                          className={`rounded-xl p-5 border flex flex-col justify-between transition-all relative ${
                            isPopular
                              ? "border-blue-600 bg-gradient-to-b from-blue-50/50 to-white shadow-md ring-2 ring-blue-500/20"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          {plan.badge && (
                            <span
                              className={`absolute -top-3 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                                isPopular
                                  ? "bg-blue-600 text-white shadow"
                                  : "bg-gray-800 text-white"
                              }`}
                            >
                              {plan.badge}
                            </span>
                          )}

                          <div>
                            <h3 className="font-bold text-base text-gray-900">
                              {plan.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {plan.durationLabel}
                            </p>

                            <div className="mt-4 mb-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-gray-900">
                                  ₹{plan.price.toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{plan.originalPrice.toLocaleString("en-IN")}
                                </span>
                                <Tag color="green" className="text-[10px] font-bold">
                                  {plan.discountPercent}% OFF
                                </Tag>
                              </div>
                              <span className="text-[11px] text-gray-400 block mt-0.5">
                                + 18% GST Applicable
                              </span>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-4 space-y-1">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                                <span className="flex items-center gap-1.5">
                                  <ThunderboltFilled className="text-amber-500" /> Unlock Credits
                                </span>
                                <span className="text-blue-700 font-bold">{plan.credits} Candidates</span>
                              </div>
                              {plan.activeJobLimit && (
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                  <span>Live Active Jobs</span>
                                  <span className="font-semibold text-slate-800">{plan.activeJobLimit} Jobs</span>
                                </div>
                              )}
                              {plan.jobBoostMultiplier && (
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                  <span>Applicant Boost</span>
                                  <span className="font-semibold text-emerald-600">{plan.jobBoostMultiplier}x Views</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2 text-xs text-gray-600 mb-6">
                              {plan.features.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <CheckCircleFilled className="text-emerald-500 text-xs mt-0.5 flex-shrink-0" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button
                            type="primary"
                            loading={purchasingPlanId === plan.id}
                            onClick={() => handlePurchase(plan)}
                            className={`w-full font-bold h-10 ${
                              isPopular
                                ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
                                : "bg-gray-900 hover:bg-black"
                            }`}
                          >
                            Choose {plan.name}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            },
            {
              key: "seeker",
              label: (
                <span className="font-semibold px-2">
                  ⭐ Job Seeker VIP Pass ({seekerPlans.length})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-center gap-2.5">
                    <RocketFilled className="text-emerald-600 text-base flex-shrink-0" />
                    <span>
                      <strong>Get Hired 3x Faster:</strong> VIP job seekers get direct recruiter WhatsApp access and top 1% application placement above standard candidates.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {seekerPlans.map((plan) => {
                      const isPopular = plan.popular;
                      return (
                        <div
                          key={plan.id}
                          className={`rounded-xl p-5 border flex flex-col justify-between transition-all relative ${
                            isPopular
                              ? "border-emerald-500 bg-gradient-to-b from-emerald-50/40 to-white shadow-md ring-2 ring-emerald-500/20"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          {plan.badge && (
                            <span className="absolute -top-3 right-4 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow">
                              {plan.badge}
                            </span>
                          )}

                          <div>
                            <h3 className="font-bold text-base text-gray-900">
                              {plan.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {plan.durationLabel}
                            </p>

                            <div className="mt-4 mb-4">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-gray-900">
                                  ₹{plan.price}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{plan.originalPrice}
                                </span>
                                <Tag color="green" className="text-[10px] font-bold">
                                  {plan.discountPercent}% OFF
                                </Tag>
                              </div>
                            </div>

                            <div className="space-y-2.5 text-xs text-gray-600 mb-6">
                              {plan.features.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <CheckCircleFilled className="text-emerald-500 text-xs mt-0.5 flex-shrink-0" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button
                            type="primary"
                            loading={purchasingPlanId === plan.id}
                            onClick={() => handlePurchase(plan)}
                            className="w-full font-bold h-10 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
                          >
                            Activate VIP Pass
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <SafetyCertificateFilled className="text-emerald-600" /> 100% Secure Checkout • Instant Credit Activation
        </span>
        <span>Need custom corporate enterprise quote? Call 1800-WORK-INDIA</span>
      </div>
    </Modal>
  );
}

