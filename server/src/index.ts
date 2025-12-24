import express from "express";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

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

app.use('/api/auth', authRouter);
app.use('/api', userRouter);
app.use('/api', territoryRouter);
app.use('/api', areaRouter);
app.use('/api', distributorRouter);
app.use('/api', retailerRouter);
app.use('/api', salesRepresentativeRouter);

const PORT = process.env.PORT;
export const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
