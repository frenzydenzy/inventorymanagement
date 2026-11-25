import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { Products } from "./pages/Products.tsx";
import { Categories } from "./pages/Categories.tsx";
import { Suppliers } from "./pages/Suppliers.tsx";
import { Inventory } from "./pages/Inventory.tsx";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </AppLayout>
  );
}

export default App;