import { ErrorRequestHandler, NextFunction, RequestHandler, Request, Response } from "express";

export const globalErrorHandler: ErrorRequestHandler = (error: Error, _, res, next) => {
    console.error(error);
    res.status(500).contentType('application/json').json({ message: "Algo de errado aconteceu, tente novamente mais tarde." });
};