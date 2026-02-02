import { useState, useEffect, useCallback } from "react";
import config from '../config';

export const useProducts = (url = `${config.API_URL}/products`) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(() => {
        if (!url) return;
        setLoading(true);
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch feed");
                return res.json();
            })
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("API Error:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [url]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, setProducts, loading, error, refetch: fetchProducts };
};
