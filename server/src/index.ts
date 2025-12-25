import express from "express";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import { connectRedis, disconnectRedis } from "./redis.js";

import { authRouter } from "./module/auth/auth.routes.js";
import { userRouter } from "./module/user/user.route.js";
import { territoryRouter } from "./module/territory/territory.route.js";
import { areaRouter } from "./module/area/area.route.js";
import { distributorRouter } from "./module/distributor/distributor.route.js";
import { retailerRouter } from "./module/retailer/retailer.route.js";
import { salesRepresentativeRouter } from "./module/sales-representative/sales-representative.route.js";

export const app = express()
dotenv.config();
    
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('', userRouter);
app.use('', territoryRouter);
app.use('', areaRouter);
app.use('', distributorRouter);
app.use('', retailerRouter);
app.use('', salesRepresentativeRouter);

const PORT = process.env.PORT;

const startServer = async () => {
    try {
        await connectRedis();
        console.log('Redis connected successfully');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await disconnectRedis();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await disconnectRedis();
    process.exit(0);
});