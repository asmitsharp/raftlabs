import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface AuthRequest extends Request {
  userId?: number
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "")
  if (!token) {
    //If token not set directly throw unathorised
    res.status(401).json({ error: "Authentication required" })
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: number
      }
      req.userId = decoded.userId
      next()
    } catch (error) {
      res.status(401).json({ error: "Invalid token" })
    }
  }
}
