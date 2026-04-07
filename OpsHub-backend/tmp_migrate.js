const pool = require("c:/Projects/College Projects/Major Project/OpsHub-backend/src/config/db.js");

async function migrate() {
    try {
        console.log("Creating network_connections table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS network_connections (
                id SERIAL PRIMARY KEY,
                user_a VARCHAR(255) NOT NULL,
                user_b VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_a, user_b)
            );
        `);

        console.log("Modifying escrow_contracts table...");
        
        // Add initiator_wallet
        await pool.query(`
            ALTER TABLE escrow_contracts ADD COLUMN IF NOT EXISTS initiator_wallet VARCHAR(255);
        `);

        // Alter blockchain_deal_id to allow NULL (if it restrict it):
        await pool.query(`
            ALTER TABLE escrow_contracts ALTER COLUMN blockchain_deal_id DROP NOT NULL;
        `);

        console.log("Migration successful!");
    } catch (e) {
        console.error("Migration error:", e);
    } finally {
        process.exit();
    }
}

migrate();
