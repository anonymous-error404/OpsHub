const db = require("../config/db");

async function requestConnection(userA, userB) {
    if (userA === userB) throw new Error("Cannot connect to self");
    const result = await db.query(
        "INSERT INTO network_connections(user_a, user_b, status) VALUES($1, $2, 'PENDING') RETURNING *",
        [userA, userB]
    );
    return result.rows[0];
}

async function acceptConnection(userA, userB) {
    const result = await db.query(
        "UPDATE network_connections SET status='CONNECTED' WHERE user_a=$1 AND user_b=$2 RETURNING *",
        [userA, userB]
    );
    return result.rows[0];
}

async function getMutuals(userId) {
    const result = await db.query(
        "SELECT * FROM network_connections WHERE (user_a=$1 OR user_b=$1) AND status='CONNECTED'",
        [userId]
    );
    const mutuals = result.rows.map(r => r.user_a === userId ? r.user_b : r.user_a);
    if (mutuals.length === 0) return [];
    
    const details = await db.query(
        "SELECT email, name, wallet_address FROM users WHERE email = ANY($1)",
        [mutuals]
    );
    return details.rows;
}

async function getAllUsers(userId) {
    const result = await db.query("SELECT email, name, wallet_address FROM users WHERE email != $1 AND blockchain_enabled=true", [userId]);
    return result.rows;
}

async function getPendingRequests(userId) {
    const result = await db.query(
        "SELECT n.id, n.user_a, u.name, u.wallet_address FROM network_connections n JOIN users u ON u.email = n.user_a WHERE n.user_b=$1 AND n.status='PENDING'", [userId]
    );
    return result.rows;
}

async function disconnectConnection(userA, userB) {
    const result = await db.query(
        "DELETE FROM network_connections WHERE (user_a=$1 AND user_b=$2) OR (user_a=$2 AND user_b=$1)",
        [userA, userB]
    );
    return { success: true };
}

module.exports = { requestConnection, acceptConnection, getMutuals, getAllUsers, getPendingRequests, disconnectConnection };
