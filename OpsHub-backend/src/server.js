require("dotenv")
    .config();

const express =
    require("express");

const cors =
    require("cors");

const auth =
    require("./routes/authRoutes");

const transactionRoutes =
    require("./routes/transactionRoutes");

const paymentRoutes =
    require("./routes/paymentRoutes");

const blockchainRoutes =
    require("./routes/blockchainRoutes");

const paymentHistory =
    require("./routes/paymentHistoryRoutes");

const escrowRoutes = require("./routes/escrowRoutes");
const networkRoutes = require("./routes/networkRoutes");

const app =
    express();

app.use(cors());

app.use(express.json());

app.use(

    "/auth",

    auth

);

app.use(
    "/payments",
    paymentRoutes
);

app.use(
    "/transactions",
    transactionRoutes
);

app.use(
    "/blockchain",
    blockchainRoutes
);

app.use(
    "/payments/history",
    paymentHistory
);

app.use("/escrow", escrowRoutes);
app.use("/network", networkRoutes);

app.listen(

    3000,

    () => {

        console.log(
            "OpsHub backend running"
        );

    });