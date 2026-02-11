import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home";
import Rank from "../pages/rank";
import BranchDetail from "../pages/branch-detail";
import StoreComparison from "../pages/store-comparison";
import DataOverview from "../pages/data-overview";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/rank",
    element: <Rank />,
  },
  {
    path: "/branch-detail",
    element: <BranchDetail />,
  },
  {
    path: "/store-comparison",
    element: <StoreComparison />,
  },
  {
    path: "/data-overview",
    element: <DataOverview />,
  },
]);

export default router;
