import { createRoot } from "react-dom/client";
import SiteApp from "./SiteApp";

const root = document.getElementById("root");
if (!root) throw new Error("Offline root element is missing.");
createRoot(root).render(<SiteApp />);
