-- Step 6: Create indexes for better performance
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "demands_client_id_idx" ON "demands"("client_id");
CREATE INDEX "proposals_demand_id_idx" ON "proposals"("demand_id");
CREATE INDEX "proposals_artisan_id_idx" ON "proposals"("artisan_id");
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");
CREATE INDEX "messages_receiver_id_idx" ON "messages"("receiver_id");
