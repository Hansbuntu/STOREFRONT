import { Express } from "express";
// TODO: implement remaining module routers; auth is wired for MVP
import authRouter from "../modules/auth/auth.routes";
import listingRouter from "../modules/listings/listing.routes";
import orderRouter from "../modules/orders/orders.routes";
import demoRouter from "../modules/orders/demo.routes";
import sellerRouter from "../modules/seller/seller.routes";
import adminRouter from "../modules/admin/admin.routes";
// import userRouter from "../modules/users/user.routes";
// import listingRouter from "../modules/listings/listing.routes";
// import orderRouter from "../modules/orders/order.routes";
// import paymentRouter from "../modules/payments/payment.routes";
// import escrowRouter from "../modules/escrow/escrow.routes";
// import disputeRouter from "../modules/disputes/dispute.routes";
// import payoutRouter from "../modules/payouts/payout.routes";
// import adminRouter from "../modules/admin/admin.routes";
import healthRouter from "../routes/health.routes";

export function registerRoutes(app: Express) {
  app.use(healthRouter);
  app.use("/auth", authRouter);
  app.use("/demo", demoRouter);
  app.use("/orders", orderRouter);
  app.use("/seller", sellerRouter);
  app.use("/admin", adminRouter);
  // app.use("/users", userRouter);
  app.use("/listings", listingRouter);
  // app.use("/orders", orderRouter);
  // app.use("/payments", paymentRouter);
  // app.use("/escrows", escrowRouter);
  // app.use("/disputes", disputeRouter);
  // app.use("/sellers", payoutRouter);
  // app.use("/admin", adminRouter);
}
