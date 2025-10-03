-- CreateTable
CREATE TABLE "user_login_logs" (
    "id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "login_time" TIMESTAMP(3) NOT NULL,
    "logout_time" TIMESTAMP(3),
    "duration" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "session_id" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_login_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_login_logs" ADD CONSTRAINT "user_login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "voters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
