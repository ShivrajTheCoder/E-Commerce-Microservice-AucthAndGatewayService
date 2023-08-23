import express, { Request, Response, NextFunction, RequestHandler } from "express";
import dotenv from "dotenv";
import authRoutes from "./Routes/authRoutes";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { connectToDatabase } from "./db_connection";
dotenv.config();

const app = express();
app.use(cors());

type Env = {
  PORT: string;
};

(async () => {
  await connectToDatabase()
    .then(() => {
      console.log("Connected to the database successfully!");
    })
    .catch((err) => {
      console.log(err);
    });
})();

app.use(express.json());

app.use("/auth", authRoutes);

const targetServers: { [key: string]: string } = {
  productService: "http://localhost:8081",
  authService: "http://localhost:8080",
  paymentService: "http://localhost:8083",
  orderService: "http://localhost:8082",
  auctionService:"http://localhost:8085"
};

// Proxy middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // Exclude /auth route from being processed by the proxy middleware
  // console.log(req.originalUrl,"this is the original url");
  if (req.originalUrl.startsWith("/auth")) {
    return next();
  }

  // Select the target server based on the incoming request
  const targetServer = selectTargetServer(req);

  // Proxy the request to the selected target server
  const proxyMiddleware: RequestHandler = createProxyMiddleware({
    target: targetServer,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      if ((req.method === 'POST' || req.method === "PUT") && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  });

  proxyMiddleware(req, res, next);
});

function selectTargetServer(req: Request): string | undefined {
  const path = req.originalUrl.split("/")[1];
  switch (path) {
    case "products":
      return targetServers["productService"];
    case "payment":
      return targetServers["paymentService"];
    case "orders":
      return targetServers["orderService"];
    case "auction":
       return targetServers["auctionService"]
    default:
      return targetServers["authService"];
  }
}

app.listen(process.env["PORT" as keyof Env], () => {
  console.log(`Auth Service running on port ${process.env["PORT" as keyof Env]}`);
});
