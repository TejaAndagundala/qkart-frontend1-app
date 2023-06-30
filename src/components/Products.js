import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  //const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const token = localStorage.getItem("token");

  const performAPICall = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setLoading(false);

      setProducts(response.data);
      setFilteredProducts(response.data);
      return response.data;
    } catch (e) {
      setLoading(false);

      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };



   const performSearch = async (text) => {
  // setLoading(true);
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setFilteredProducts(response.data);
      //console.log(response.data)
      return response.data;
    }
    catch(e) {
      if(e.response) {
        if(e.response.status === 404) {
          setFilteredProducts([]);
        }
        if(e.response.status === 500) {
          enqueueSnackbar(e.response.data.message,{variant: "error"});
          setFilteredProducts(products);
        }
      }else {
        enqueueSnackbar("Could not fetch products. Check that the backend is running, reachable and returns valid JSON", 
        {variant: "error"}
        );
      }
    }
    // setLoading(false);
   }




    useEffect(() => {
      const onLoadHandler = async () => {
        performAPICall();
      };
      onLoadHandler()
    }, []);
   

    const debounceSearch = (event, debounceTimeout) => {
      const value = event.target.value;

      if(debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      const timeout = setTimeout(() => {
        performSearch(value);
      }, 500);
      setDebounceTimeout(timeout);
    };

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, debounceTimeout)}
          />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      <Grid container>
        <Grid
          item
          xs={12}
          md={token && products.length ? 9 : 12}
          className="product-grid"
        >
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
          { loading ? (
            <Box className="loading">
              <CircularProgress />
              <h4>Loading Products</h4>
            </Box>
          ) : (
            <Grid container marginY="1rem" paddingX="1rem" spacing={2}>
              {filteredProducts.length? (
                filteredProducts.map((product) => (
                  <Grid item xs={6} md={3} key={product._id}>
                    <ProductCard
                      product={product}
                     
                      // handleAddToCart = {async () => {
                      //   await addToCart(
                      //     token,
                      //     items,
                      //     products,
                      //     products._id, 
                      //     1,
                      //     {
                      //       preventDuplicate:true,
                      //     }
                      //   );
                      // }} 
                     
                    />
                  </Grid>
                ))
              ) : (
                <Box className="loading">
                  <SentimentDissatisfied color="action" />
                  <h4 style={{ color: "#636363" }}>No Products Found</h4>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
