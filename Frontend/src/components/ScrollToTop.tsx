import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Как только меняется путь (pathname), скроллим в самое начало: x: 0, y: 0
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Этот компонент ничего не рисует на экране, он просто делает работу в фоне
}