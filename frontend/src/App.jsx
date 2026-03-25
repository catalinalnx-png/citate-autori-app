import './App.css'
import QuotesPage from './pages/QuotesPage';
import ManagePage from './pages/ManagePage';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<QuotesPage />} />
                <Route path="/manage" element={<ManagePage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;