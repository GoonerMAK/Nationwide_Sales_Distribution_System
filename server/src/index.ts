import express from "express";
import dotenv from "dotenv";

export const app = express()
dotenv.config();

app.use(express.json());

const PORT = process.env.PORT;
export const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
