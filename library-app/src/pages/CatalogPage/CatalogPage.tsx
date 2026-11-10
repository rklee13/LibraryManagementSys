import { useLocation } from "react-router-dom";

import './CatalogPage.css';
import { CatalogOverview, CatalogSearch } from "../../features/catalog";

export default function CatalogPage() {
    const location = useLocation();

    return (
        <div className="page">
            <div className="page-container">
                {
                    // Determines whether someone searched for something. If so, go to catalog with the search information
                    // so we show the search result; otherwise the catalog will show everything
                    location.search === "" ?
                        <CatalogOverview /> :
                        <CatalogSearch />
                }
            </div>
        </div>
    )
}