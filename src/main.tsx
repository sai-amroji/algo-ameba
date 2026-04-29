
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SortPage from "@/components/sort/SortPage.tsx";
import SearchPage from "@/components/search/SearchPage.tsx";
import QueuePage from "@/components/queue/queuePage.tsx";
import StackPage from "@/components/stack/stackPage.tsx";
import LinkedListPage from "@/components/linkedlist/llPage.tsx";
import GraphPage from "@/components/graph/GraphPage.tsx";
import HeapPage from "@/components/heap/HeapPage.tsx";
import TreePage from "@/components/tree/TreePage.tsx";
import Homepage from "@/pages/Homepage.tsx";
import LandingPage from "@/pages/LandingPage.tsx";
import AboutPage from "@/pages/AboutPage.tsx";
import { ROUTES } from "@/constants/routes";



createRoot(document.getElementById("root")!).render(
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
            <Routes>
                <Route path={ROUTES.landing} element={<LandingPage />} />
                <Route path={ROUTES.home} element={<Homepage />} />
                <Route path={ROUTES.algorithms} element={<Homepage />} />
                <Route path={ROUTES.about} element={<AboutPage />} />
                <Route path={ROUTES.sort} element={<SortPage />} />
                <Route path={ROUTES.search} element={<SearchPage />} />
                <Route path={ROUTES.queue} element={<QueuePage />} />
                <Route path={ROUTES.stack} element={<StackPage />} />
                <Route path={ROUTES.linkedlist} element={<LinkedListPage />} />
                <Route path={ROUTES.graph} element={<GraphPage />} />
                <Route path={ROUTES.tree} element={<TreePage />} />
                <Route path={ROUTES.heap} element={<HeapPage />} />

                <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
            </Routes>
        </BrowserRouter>
    </ThemeProvider>
);
