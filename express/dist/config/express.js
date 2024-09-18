import express from "express";
import cors from "cors";
export const createApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    return app;
};
