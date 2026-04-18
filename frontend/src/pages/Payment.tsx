// src/pages/Payment.tsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const PLAN_DETAILS = {
  free: { name: "Free", price: "$0" },
  pro: { name: "Pro", price: "$19/mo" },
  enterprise: { name: "Enterprise", price: "Custom" },
};

export default function Payment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const planId = params.get("plan");
  const plan = PLAN_DETAILS[planId as keyof typeof PLAN_DETAILS];

  const isFreePlan = planId === "free";

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Guard
  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">No plan selected</p>
          <button
            onClick={() => navigate("/pricing")}
            className="px-4 py-2 text-white bg-black rounded"
          >
            Go to Pricing
          </button>
        </div>
      </div>
    );
  }

  // Format card number (#### #### #### ####)
  const formatCard = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  // Format expiry (MM/YY)
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length < 3) return cleaned;
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
  };

  const validate = () => {
    if (isFreePlan) return true;

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setError("Invalid card number");
      return false;
    }

    if (expiry.length !== 5) {
      setError("Invalid expiry date");
      return false;
    }

    if (cvc.length < 3) {
      setError("Invalid CVC");
      return false;
    }

    return true;
  };

  const handlePayment = () => {
    setError("");

    // FREE PLAN → instant activation
    if (isFreePlan) {
      localStorage.setItem("plan", plan.name);
      navigate("/dashboard");
      return;
    }

    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      const successPayment = Math.random() > 0.15;

      setLoading(false);

      if (successPayment) {
        setSuccess(true);
        localStorage.setItem("plan", plan.name);

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError("Payment failed, try again");
      }
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">

        {!success ? (
          <>
            <h1 className="mb-6 text-2xl font-bold text-center">
              Checkout
            </h1>

            {/* Plan */}
            <div className="p-4 mb-6 border rounded-lg bg-slate-50">
              <p className="font-semibold">{plan.name}</p>
              <p className="text-lg">{plan.price}</p>
            </div>

            {/* Card Inputs (only for paid) */}
            {!isFreePlan && (
              <>
                <input
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCard(e.target.value))
                  }
                  className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neonPurple"
                />

                <div className="flex gap-3">
                  <input
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) =>
                      setExpiry(formatExpiry(e.target.value))
                    }
                    className="w-1/2 p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neonPurple"
                  />

                  <input
                    placeholder="CVC"
                    value={cvc}
                    onChange={(e) =>
                      setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className="w-1/2 p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neonPurple"
                  />
                </div>
              </>
            )}


            {error && (
              <p className="mb-4 text-sm text-center text-red-500">
                {error}
              </p>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full px-6 py-3 text-white transition rounded-lg bg-neonPurple hover:opacity-90 disabled:opacity-50"
            >
              {isFreePlan
                ? "Activate Free Plan"
                : loading
                ? "Processing..."
                : "Pay Now"}
            </button>
          </>
        ) : (
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-green-600">
              Payment Successful
            </h1>
            <p>Your plan is now active</p>
          </div>
        )}

      </div>
    </div>
  );
}