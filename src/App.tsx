import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SortPage from "@/components/sort/SortPage.tsx";
import SearchPage from "@/components/search/SearchPage.tsx";
import PrimativePage from "@/components/primative/PrimativePage.tsx";
import Homepage from "@/pages/Homepage.tsx";
import LandingPage from "@/pages/LandingPage.tsx";
import AboutPage from "@/pages/AboutPage.tsx";
import { ROUTES } from "@/constants/routes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={ROUTES.landing} element={<LandingPage />} />
                <Route path={ROUTES.home} element={<Homepage />} />
                <Route path={ROUTES.algorithms} element={<Homepage />} />
                <Route path={ROUTES.about} element={<AboutPage />} />

                <Route path={ROUTES.sort} element={<SortPage />} />
                <Route path={ROUTES.mergeSort} element={<SortPage />} />
                <Route path={ROUTES.search} element={<SearchPage />} />
                <Route path={ROUTES.binarySearch} element={<SearchPage />} />
                <Route path={ROUTES.selectionSort} element={<SortPage />} />
                <Route path={ROUTES.insertionSort} element={<SortPage />} />
                <Route path={ROUTES.insertionSortLegacy} element={<SortPage />} />
                <Route path={ROUTES.primitive} element={<PrimativePage />} />

                <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
