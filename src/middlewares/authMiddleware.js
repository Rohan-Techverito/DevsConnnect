import jwt from "jsonwebtoken";

//protected route

export const requireSignIn = async (req, res, next) => {
  try {
    const decode = jwt.verify(req.headers.authorization, process.env.SECRET);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }
};
