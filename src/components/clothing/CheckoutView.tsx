"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Truck,
  ShieldCheck,
  Lock,
  Loader2,
  MapPin,
  Plus,
  Award,
  RefreshCw,
} from "lucide-react";
import { useStore, cartSubtotal } from "@/lib/store";
import { useUserData } from "@/lib/use-user-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CheckoutView() {
  const storeState = useStore();
  const { cart, setView, clearCart } = storeState;
  const {
    addresses,
    isAuthenticated,
    loading: userDataLoading,
  } = useUserData();

  // Payment methods — for now, always use local store (cards aren't really stored server-side)
  // Real apps would use Stripe/Stripe Elements; we keep the mock for demo purposes
  const paymentMethods = storeState.paymentMethods;

  // Ensure paymentMethods is always an array
  const safePaymentMethods = paymentMethods || [];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingMethod, setShippingMethod] = useState("express");
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState(
    safePaymentMethods.find((p) => p.isDefault)?.id || safePaymentMethods[0]?.id || ""
  );

  const subtotal = cartSubtotal(cart);
  const shippingCost =
    shippingMethod === "express" ? (subtotal >= 250 ? 0 : 25) : shippingMethod === "standard" ? (subtotal >= 250 ? 0 : 12) : 35;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shippingCost + tax;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const selectedPayment = safePaymentMethods.find((p) => p.id === selectedPaymentId);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl mb-3">Nothing to check out</h1>
        <p className="text-muted-foreground mb-8">
          Your bag is empty — let's fix that.
        </p>
        <Button
          onClick={() => setView("shop")}
          className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
        >
          Browse Collection
        </Button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({
            productId: c.productId,
            name: c.name,
            image: c.image,
            size: c.size,
            color: c.color,
            quantity: c.quantity,
            price: c.price,
          })),
          shippingAddress: selectedAddress
            ? `${selectedAddress.line1}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postalCode}`
            : "",
          subtotal,
          shipping: shippingCost,
          tax,
          total,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to place order");
      }

      const data = await res.json();
      const orderId = data.order.orderNumber;

      // Clear cart locally
      clearCart();

      toast.success("Order placed successfully!", {
        description: `Order ${orderId} confirmed`,
      });
      setView("order-success");
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    }
  };

  const steps = [
    { num: 1, label: "Shipping", icon: Truck },
    { num: 2, label: "Payment", icon: CreditCard },
    { num: 3, label: "Review", icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
          Secure Checkout
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl">Checkout</h1>
      </motion.div>

      {/* Steps */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  step >= s.num
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {step > s.num ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm hidden sm:block",
                  step >= s.num ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 sm:w-16 transition-all",
                  step > s.num ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
        {/* Step content */}
        <div>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-serif text-2xl mb-1">Shipping Address</h2>
                <p className="text-sm text-muted-foreground">
                  Select where you'd like your order delivered.
                </p>
              </div>

              <RadioGroup
                value={selectedAddressId}
                onValueChange={setSelectedAddressId}
                className="space-y-3"
              >
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    htmlFor={addr.id}
                    className={cn(
                      "block p-5 border rounded-sm cursor-pointer transition-all",
                      selectedAddressId === addr.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem
                        value={addr.id}
                        id={addr.id}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] tracking-wide-luxe uppercase bg-accent/15 text-accent px-2 py-0.5">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addr.country}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              <div className="border-t pt-6">
                <h3 className="font-serif text-xl mb-4">Delivery Method</h3>
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                  className="space-y-3"
                >
                  {[
                    {
                      id: "express",
                      label: "Express Delivery",
                      desc: "1-2 business days",
                      cost: subtotal >= 250 ? "Free" : "$25",
                    },
                    {
                      id: "standard",
                      label: "Standard Delivery",
                      desc: "3-5 business days",
                      cost: subtotal >= 250 ? "Free" : "$12",
                    },
                    {
                      id: "overnight",
                      label: "Overnight",
                      desc: "Next business day by 6 PM",
                      cost: "$35",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      htmlFor={opt.id}
                      className={cn(
                        "flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-all",
                        shippingMethod === opt.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <RadioGroupItem value={opt.id} id={opt.id} />
                      <div className="flex-1">
                        <p className="font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      <span className="font-medium text-sm">{opt.cost}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setView("cart")}
                  className="rounded-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Bag
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
                >
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-serif text-2xl mb-1">Payment Method</h2>
                <p className="text-sm text-muted-foreground">
                  All transactions are encrypted and secure.
                </p>
              </div>

              <RadioGroup
                value={selectedPaymentId}
                onValueChange={setSelectedPaymentId}
                className="space-y-3"
              >
                {safePaymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    htmlFor={pm.id}
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-all",
                      selectedPaymentId === pm.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    <RadioGroupItem value={pm.id} id={pm.id} />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="font-medium uppercase">
                          {pm.type} ···· {pm.last4}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pm.name} · Exp {pm.expiry}
                        </p>
                      </div>
                      {pm.isDefault && (
                        <span className="text-[10px] tracking-wide-luxe uppercase bg-accent/15 text-accent px-2 py-0.5">
                          Default
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </RadioGroup>

              <div className="border border-dashed border-border rounded-sm p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  + Add a new payment method
                </p>
              </div>

              <div className="bg-secondary/30 p-4 rounded-sm flex items-start gap-3">
                <Lock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your payment information is encrypted with 256-bit SSL and
                  tokenized by our PCI-compliant processor. We never store your
                  card number.
                </p>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="rounded-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="rounded-none h-12 px-8 text-sm tracking-wide-luxe uppercase"
                >
                  Review Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-serif text-2xl mb-1">Review Your Order</h2>
                <p className="text-sm text-muted-foreground">
                  Please confirm everything looks right.
                </p>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-4 pb-4 border-b border-border"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-sm"
                    />
                    <div className="flex-1">
                      <p className="font-serif">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.color} · Size {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ship to */}
              {selectedAddress && (
                <div className="bg-secondary/30 p-5 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] tracking-wide-luxe uppercase text-muted-foreground">
                      Shipping To
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-accent hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="font-medium">{selectedAddress.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAddress.line1}
                    {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAddress.city}, {selectedAddress.state}{" "}
                    {selectedAddress.postalCode}
                  </p>
                </div>
              )}

              {/* Payment */}
              {selectedPayment && (
                <div className="bg-secondary/30 p-5 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] tracking-wide-luxe uppercase text-muted-foreground">
                      Paying With
                    </p>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs text-accent hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="font-medium uppercase">
                    {selectedPayment.type} ···· {selectedPayment.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {selectedPayment.expiry}
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="rounded-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  className="rounded-none h-12 px-10 text-sm tracking-wide-luxe uppercase"
                >
                  Place Order · ${total.toLocaleString()}
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { icon: ShieldCheck, label: "256-bit SSL\nSecure" },
                  { icon: Award, label: "Authenticity\nGuaranteed" },
                  { icon: RefreshCw, label: "30-Day\nReturns" },
                  { icon: Truck, label: "Free Shipping\nOver $250" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1.5 p-2"
                  >
                    <item.icon className="h-5 w-5 text-accent" />
                    <span className="text-[11px] text-muted-foreground whitespace-pre-line leading-tight">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="bg-secondary/30 p-6 rounded-sm">
            <h3 className="font-serif text-xl mb-6">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-3"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-16 object-cover rounded-sm"
                    />
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.color} · {item.size}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="h-px bg-border my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `$${shippingCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${tax.toLocaleString()}</span>
              </div>
            </div>

            <div className="h-px bg-border my-4" />

            <div className="flex justify-between items-baseline">
              <span className="font-serif text-lg">Total</span>
              <span className="font-serif text-2xl">
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
