import { ErrorRequestHandler, NextFunction, RequestHandler, Request, Response } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const globalErrorHandler: ErrorRequestHandler = (error: Error, _, res) => {
    console.error(error);
    res.status(500).contentType('application/json').json({ message: "Algo de errado aconteceu, tente novamente mais tarde." });
};

export const asyncErrorHandler = (fn: AsyncRequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise
            .resolve(fn(req, res, next))
            .catch(next)
    }
}