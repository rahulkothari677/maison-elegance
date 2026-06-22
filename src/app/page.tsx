"use client";

import { useStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { useGlobalOrderListener } from "@/lib/use-realtime";
import { Header } from "@/components/clothing/Header";
import { Footer } from "@/components/clothing/Footer";
import { HomeView } from "@/components/clothing/HomeView";
import { ShopView } from "@/components/clothing/ShopView";
import { ProductView } from "@/components/clothing/ProductView";
import { CartView } from "@/components/clothing/CartView";
import { CheckoutView } from "@/components/clothing/CheckoutView";
import { WishlistView } from "@/components/clothing/WishlistView";
import { ProfileView } from "@/components/clothing/ProfileView";
import { OrderSuccessView } from "@/components/clothing/OrderSuccessView";
import { CartDrawer } from "@/components/clothing/CartDrawer";
import { QuickView } from "@/components/clothing/QuickView";
import { BackToTop } from "@/components/clothing/BackToTop";
import { ConciergeChat } from "@/components/clothing/ConciergeChat";
import { CompareTray, CompareModal } from "@/components/clothing/CompareTray";
import { AdminView } from "@/components/clothing/AdminView";
import { CommunityView } from "@/components/clothing/CommunityView";
import { VisualSearch } from "@/components/clothing/VisualSearch";
import { SubscriptionBox } from "@/components/clothing/SubscriptionBox";
import { InfoPage } from "@/components/clothing/InfoPage";
import { CartWelcomeBack, ExitIntentPopup } from "@/components/clothing/UXEnhancements";
import { LoadingCinematic } from "@/components/clothing/LoadingCinematic";
import { CustomCursor } from "@/components/clothing/CustomCursor";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

const pageTransitions = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Home() {
  const { view, setProfileTab, infoPageId } = useStore();
  const { data: session } = useSession();
  const userEmail = (session?.user as any)?.email || null;

  // Listen for real-time order status updates for the logged-in user
  useGlobalOrderListener(userEmail);

  // If "orders" view, redirect to profile with orders tab
  const effectiveView = view === "orders" ? "profile" : view;
  useEffect(() => {
    if (view === "orders") {
      setProfileTab("orders");
    }
  }, [view, setProfileTab]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LoadingCinematic />
      <CustomCursor />
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveView}
            {...pageTransitions}
          >
            {effectiveView === "home" && <HomeView />}
            {effectiveView === "shop" && <ShopView />}
            {effectiveView === "product" && <ProductView />}
            {effectiveView === "cart" && <CartView />}
            {effectiveView === "checkout" && <CheckoutView />}
            {effectiveView === "wishlist" && <WishlistView />}
            {effectiveView === "profile" && <ProfileView />}
            {effectiveView === "order-success" && <OrderSuccessView />}
            {effectiveView === "admin" && <AdminView />}
            {effectiveView === "community" && <CommunityView />}
            {effectiveView === "visual-search" && <VisualSearch />}
            {effectiveView === "subscription" && <SubscriptionBox />}
            {effectiveView === "info" && <InfoPage pageId={infoPageId || "our-story"} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />

      {/* Global overlays */}
      <CartDrawer />
      <QuickView />
      <CompareTray />
      <CompareModal />
      <CartWelcomeBack />
      <ExitIntentPopup />
      <BackToTop />
      <ConciergeChat />
    </div>
  );
}
