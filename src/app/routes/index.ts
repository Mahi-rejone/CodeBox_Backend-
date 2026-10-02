import { Router } from "express";
import { userRoute } from "../modules/user/user.route.js";
import { authRoute } from "../modules/auth/auth.route.js";


const router = Router();
const moduleRoute = [
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
];

moduleRoute.forEach((routeData) => router.use(routeData.path, routeData.route));

export default router;
