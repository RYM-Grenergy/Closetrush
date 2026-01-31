import { useState, useEffect } from "react";
import { MOCK_PRODUCTS } from "../data/mockData";

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch feed");
                return res.json();
            })
            .then(data => {
                if (data.length === 0) {
                    setProducts(MOCK_PRODUCTS); // Fallback if API returns empty
                } else {
                    setProducts(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.warn("API Error, utilizing MOCK DATA:", err);
                // Fallback to mock data instead of showing error
                setProducts(MOCK_PRODUCTS);
                setLoading(false);
            });
    }, []);

    return { products, loading, error };
};
