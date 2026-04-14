import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BubbleSortVisualizer from "@/components/sort/BubbleSort.tsx";
import SearchVisualizer from "@/components/search/LinearSearch.tsx";
import BinarySearch from "@/components/search/BinarySearch.tsx";
import SelectionSort from "@/components/sort/SelectionSort.tsx";
import InserationSort from "@/components/sort/InserationSort.tsx";
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

                <Route path={ROUTES.sort} element={<BubbleSortVisualizer />} />
                <Route path={ROUTES.search} element={<SearchVisualizer />} />
                <Route path={ROUTES.binarySearch} element={<BinarySearch />} />
                <Route path={ROUTES.selectionSort} element={<SelectionSort />} />
                <Route path={ROUTES.insertionSort} element={<InserationSort />} />
                <Route path={ROUTES.insertionSortLegacy} element={<InserationSort />} />

                <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
