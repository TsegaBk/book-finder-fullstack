import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./style.css";

import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// optional old CRUD pages
import Add from "./pages/Add";
import Update from "./pages/Update";
import Books from "./pages/Books";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* main views */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />

          {/* auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* protected favorites */}
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />

          {/* optional old CRUD */}
          <Route path="/books" element={<Books />} />
          <Route path="/add" element={<Add />} />
          <Route path="/update/:id" element={<Update />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
