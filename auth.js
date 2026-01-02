import jwt from "jsonwebtoken";

export async function auth(req,res) {
    const token = req.cookies.auth;

  if (!token) return res.status(401).json({ error: "Not logged in" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded; 
  next();
}
    
