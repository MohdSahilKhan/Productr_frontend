import api from "./apiClient";

export const getProducts = (published) => {
  return api.get(`/products?published=${published}`);
};

export const createProduct = (productData) => {
  const formData = new FormData();
  
  formData.append("name", productData.name);
  formData.append("type", productData.type);
  formData.append("quantity", productData.quantity || productData.quantityStock);
  formData.append("stock", productData.stock || productData.quantityStock);
  formData.append("mrp", productData.mrp);
  formData.append("selling_price", productData.selling_price || productData.sellingPrice);
  formData.append("brand_name", productData.brand_name || productData.brandName);
  formData.append("exchange_or_return", productData.exchange_or_return || productData.exchangeEligibility);
  formData.append("is_published", productData.is_published || "false");
  
  // Append all image files
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((image) => {
      formData.append("images", image);
    });
  }
  
  return api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProduct = (productId, productData) => {
  const formData = new FormData();
  
  formData.append("name", productData.name);
  formData.append("type", productData.type);
  formData.append("quantity", productData.quantity || productData.quantityStock);
  formData.append("stock", productData.stock || productData.quantityStock);
  formData.append("mrp", productData.mrp);
  formData.append("selling_price", productData.selling_price || productData.sellingPrice);
  formData.append("brand_name", productData.brand_name || productData.brandName);
  formData.append("exchange_or_return", productData.exchange_or_return || productData.exchangeEligibility);
  formData.append("is_published", productData.is_published || "false");
  
  // Append all image files (both existing converted to files and new uploads)
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((image) => {
      // All images should be File objects at this point
      if (image instanceof File) {
        formData.append("images", image);
      }
    });
  }
  
  return api.put(`/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProduct = (productId) => {
  return api.delete(`/products/${productId}`);
};

export const updateProductPublishedStatus = (productId, isPublished) => {
  const formData = new FormData();
  formData.append("is_published", isPublished ? "true" : "false");
  
  return api.put(`/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

