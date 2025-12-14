import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Products.css";
import { createProduct, getProducts, updateProductPublishedStatus, deleteProduct, updateProduct } from "../api/products";

export default function Products() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    productType: "",
    quantityStock: "",
    mrp: "",
    sellingPrice: "",
    brandName: "",
    images: [],
    exchangeEligibility: "yes"
  });
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      // Fetch both published and unpublished products
      const [publishedResponse, unpublishedResponse] = await Promise.all([
        getProducts(true),
        getProducts(false)
      ]);
      
      const allProducts = [
        ...(Array.isArray(publishedResponse.data) ? publishedResponse.data : []),
        ...(Array.isArray(unpublishedResponse.data) ? unpublishedResponse.data : [])
      ];
      
      setProducts(allProducts);
      
      // Initialize image index for each product
      const imageIndices = {};
      allProducts.forEach((product) => {
        imageIndices[product._id] = 0;
      });
      setCurrentImageIndex(imageIndices);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.name || "",
      productType: product.type || "",
      quantityStock: product.stock || product.quantity || "",
      mrp: product.mrp || "",
      sellingPrice: product.selling_price || "",
      brandName: product.brand_name || "",
      images: [],
      exchangeEligibility: product.exchange_or_return || "yes"
    });
    if (product.images && product.images.length > 0) {
      setImagePreviews(product.images);
      setExistingImageUrls(product.images);
    } else {
      setImagePreviews([]);
      setExistingImageUrls([]);
    }
    setShowModal(true);
    setErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      productName: "",
      productType: "",
      quantityStock: "",
      mrp: "",
      sellingPrice: "",
      brandName: "",
      images: [],
      exchangeEligibility: "yes"
    });
    setImagePreviews([]);
    setExistingImageUrls([]);
    setErrors({});
  };

  return (
    <div className="home-wrapper">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-text-large">Productr</span>
          <img src="/logo.png" alt="Productr Logo" className="logo-icon-large" />
        </div>
        
        <div className="search-container">
          <img src="/Search.png" alt="Search" className="search-icon" />
          <input type="text" placeholder="Search" className="search-input" autoComplete="off" />
        </div>

        <nav className="sidebar-nav">
          <Link to="/home" className={`nav-item ${location.pathname === '/home' ? 'active' : ''}`}>
            <img src="/Home.png" alt="Home" className="nav-icon" />
            <span className="nav-text">Home</span>
          </Link>
          <Link to="/products" className={`nav-item ${location.pathname === '/products' ? 'active' : ''}`}>
            <img src="/Shopping-bag.svg" alt="Products" className="nav-icon" />
            <span className="nav-text">Products</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation Bar */}
        <header className="top-navbar">
          <img src="/Frame.png" alt="Frame" className="navbar-frame" />
          <div className="navbar-left">
            <img src="/Shopping-bag.svg" alt="Products" className="navbar-icon" />
            <span className="navbar-title">Products</span>
          </div>
          <div className="navbar-center">
            <div className="navbar-search-container">
              <img src="/Search.png" alt="Search" className="navbar-search-icon" />
              <input type="text" placeholder="Search Services, Products" className="navbar-search-input" autoComplete="off" />
            </div>
          </div>
          <div className="navbar-right">
            <div className="user-avatar">
              <img src="/dp.jpg" alt="User" className="avatar-image" />
            </div>
            <svg className="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </header>

        {/* Main Content Header */}
        <div className="content-header">
          <h1 className="content-title">Products</h1>
          <button className="btn-add-products-header" onClick={() => {
            setEditingProduct(null);
            handleCloseModal();
            setShowModal(true);
          }}>
            <span className="plus-icon">+</span>
            <span>Add Products</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="products-content-area">
          {productsLoading ? (
            <div className="loading-state">
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty-state">
              <div className="products-empty-icon">
                <img src="/iconoir_grid-add.png" alt="Grid Add" className="products-grid-icon" />
              </div>
              <h2 className="products-empty-title">Feels a little empty over here...</h2>
              <p className="products-empty-text">
                You can create products without connecting store you can add products to store anytime
              </p>
              <button className="btn-add-products" onClick={() => setShowModal(true)}>Add your Products</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image-container">
                    {product.images && product.images.length > 0 ? (
                      <>
                        <img 
                          src={product.images[currentImageIndex[product._id] || 0]} 
                          alt={product.name}
                          className="product-image"
                        />
                        {product.images.length > 1 && (
                          <div className="image-dots">
                            {product.images.map((_, imgIndex) => (
                              <span
                                key={imgIndex}
                                className={`dot ${(currentImageIndex[product._id] || 0) === imgIndex ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(prev => ({ ...prev, [product._id]: imgIndex }))}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="product-image-placeholder">No Image</div>
                    )}
                  </div>
                  
                  <div className="product-details">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-info">
                      <div className="info-row">
                        <span className="info-label">Product type:</span>
                        <span className="info-value">{product.type || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Quantity Stock:</span>
                        <span className="info-value">{product.stock || product.quantity || 0}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">MRP:</span>
                        <span className="info-value">{formatPrice(product.mrp || 0)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Selling Price:</span>
                        <span className="info-value">{formatPrice(product.selling_price || 0)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Brand Name:</span>
                        <span className="info-value">{product.brand_name || 'N/A'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Total Number of images:</span>
                        <span className="info-value">{product.images?.length || 0}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Exchange Eligibility:</span>
                        <span className="info-value">{product.exchange_or_return === 'yes' ? 'YES' : 'NO'}</span>
                      </div>
                    </div>
                    
                    <div className="product-actions">
                      {product.is_published ? (
                        <button 
                          className="btn-unpublish"
                          onClick={async () => {
                            try {
                              await updateProductPublishedStatus(product._id, false);
                              setProducts(products.map(p => 
                                p._id === product._id ? { ...p, is_published: false } : p
                              ));
                              setToastMessage("Product Unpublished Successfully");
                              setShowToast(true);
                              setTimeout(() => {
                                setShowToast(false);
                                setToastMessage("");
                              }, 3000);
                            } catch (error) {
                              console.error("Error unpublishing product:", error);
                              alert(error.response?.data?.message || "Failed to unpublish product. Please try again.");
                            }
                          }}
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button 
                          className="btn-publish"
                          onClick={async () => {
                            try {
                              await updateProductPublishedStatus(product._id, true);
                              setProducts(products.map(p => 
                                p._id === product._id ? { ...p, is_published: true } : p
                              ));
                              setToastMessage("Product Published Successfully");
                              setShowToast(true);
                              setTimeout(() => {
                                setShowToast(false);
                                setToastMessage("");
                              }, 3000);
                            } catch (error) {
                              console.error("Error publishing product:", error);
                              alert(error.response?.data?.message || "Failed to publish product. Please try again.");
                            }
                          }}
                        >
                          Publish
                        </button>
                      )}
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => {
                          setProductToDelete(product);
                          setShowDeleteModal(true);
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M2.5 5H4.16667H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.66667 5V3.33333C6.66667 2.89131 6.84226 2.46738 7.15482 2.15482C7.46738 1.84226 7.89131 1.66667 8.33333 1.66667H11.6667C12.1087 1.66667 12.5326 1.84226 12.8452 2.15482C13.1577 2.46738 13.3333 2.89131 13.3333 3.33333V5M15.8333 5V16.6667C15.8333 17.1087 15.6577 17.5326 15.3452 17.8452C15.0326 18.1577 14.6087 18.3333 14.1667 18.3333H5.83333C5.39131 18.3333 4.96738 18.1577 4.65482 17.8452C4.34226 17.5326 4.16667 17.1087 4.16667 16.6667V5H15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8.33333 9.16667V14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11.6667 9.16667V14.1667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form id="product-form" className="product-form" onSubmit={async (e) => {
              e.preventDefault();
              const newErrors = {};
              if (!formData.productName.trim()) {
                newErrors.productName = "Please enter product name";
              }
              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
              }
              
              setLoading(true);
              try {
                if (editingProduct) {
                  // For update: convert remaining existing image URLs to File objects
                  const remainingExistingUrls = imagePreviews
                    .filter(preview => typeof preview === 'string' && preview.startsWith('http'))
                    .filter(url => existingImageUrls.includes(url));
                  
                  const existingImageFiles = await Promise.all(
                    remainingExistingUrls.map(async (url) => {
                      try {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const urlParts = url.split('/');
                        const filename = urlParts[urlParts.length - 1] || 'image.jpg';
                        const file = new File([blob], filename, { type: blob.type });
                        return file;
                      } catch (error) {
                        console.error('Error converting image URL to file:', error);
                        return null;
                      }
                    })
                  );
                  
                  const validExistingFiles = existingImageFiles.filter(file => file !== null);
                  const allImageFiles = [...validExistingFiles, ...formData.images];
                  
                  const productPayload = {
                    name: formData.productName,
                    type: formData.productType,
                    quantityStock: formData.quantityStock,
                    mrp: formData.mrp,
                    sellingPrice: formData.sellingPrice,
                    brandName: formData.brandName,
                    exchangeEligibility: formData.exchangeEligibility,
                    images: allImageFiles,
                    is_published: editingProduct.is_published ? "true" : "false"
                  };
                  
                  await updateProduct(editingProduct._id, productPayload);
                  setToastMessage("Product updated Successfully");
                } else {
                  const productPayload = {
                    name: formData.productName,
                    type: formData.productType,
                    quantityStock: formData.quantityStock,
                    mrp: formData.mrp,
                    sellingPrice: formData.sellingPrice,
                    brandName: formData.brandName,
                    exchangeEligibility: formData.exchangeEligibility,
                    images: formData.images,
                    is_published: "false"
                  };
                  
                  await createProduct(productPayload);
                  setToastMessage("Product added Successfully");
                }
                
                // Show success toast
                setShowToast(true);
                
                // Reset form
                handleCloseModal();
                
                // Refresh products list
                fetchProducts();
                
                // Hide toast after 3 seconds
                setTimeout(() => {
                  setShowToast(false);
                  setToastMessage("");
                }, 3000);
              } catch (error) {
                console.error(`Error ${editingProduct ? 'updating' : 'creating'} product:`, error);
                setErrors({ submit: error.response?.data?.message || `Failed to ${editingProduct ? 'update' : 'create'} product. Please try again.` });
              } finally {
                setLoading(false);
              }
            }}>
              <div className="form-group">
                <label htmlFor="productName">Product Name</label>
                <input
                  type="text"
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => {
                    setFormData({ ...formData, productName: e.target.value });
                    if (errors.productName) setErrors({ ...errors, productName: "" });
                  }}
                  className={errors.productName ? "input-error" : ""}
                  placeholder="Enter product name"
                />
                {errors.productName && <span className="error-message">{errors.productName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="productType">Product Type</label>
                <select
                  id="productType"
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                >
                  <option value="">Select product type</option>
                  <option value="foods">Foods</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothes">Clothes</option>
                  <option value="beauty">Beauty Products</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantityStock">Quantity Stock</label>
                <input
                  type="number"
                  id="quantityStock"
                  value={formData.quantityStock}
                  onChange={(e) => setFormData({ ...formData, quantityStock: e.target.value })}
                  placeholder="Total numbers of Stock available"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mrp">MRP</label>
                <input
                  type="number"
                  id="mrp"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  placeholder="Total numbers of Stock available"
                />
              </div>

              <div className="form-group">
                <label htmlFor="sellingPrice">Selling Price</label>
                <input
                  type="number"
                  id="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="Total numbers of Stock available"
                />
              </div>

              <div className="form-group">
                <label htmlFor="brandName">Brand Name</label>
                <input
                  type="text"
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="Total numbers of Stock available"
                />
              </div>

              <div className="form-group">
                <div className="upload-header">
                  <label htmlFor="productImages">Upload Product Images</label>
                  {imagePreviews.length > 0 && (
                    <button
                      type="button"
                      className="add-more-photos"
                      onClick={() => document.getElementById("productImages").click()}
                    >
                      Add More Photos
                    </button>
                  )}
                </div>
                <div className="upload-area">
                  <input
                    type="file"
                    id="productImages"
                    multiple
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const newPreviews = files.map(file => URL.createObjectURL(file));
                      const existingPreviews = imagePreviews.filter(preview => typeof preview === 'string' && preview.startsWith('http'));
                      setImagePreviews([...existingPreviews, ...newPreviews]);
                      setFormData({ ...formData, images: [...formData.images, ...files] });
                    }}
                  />
                  {imagePreviews.length === 0 ? (
                    <div className="upload-placeholder">
                      <p>Enter Description</p>
                      <button
                        type="button"
                        className="browse-link"
                        onClick={() => document.getElementById("productImages").click()}
                      >
                        Browse
                      </button>
                    </div>
                  ) : (
                    <div className="image-preview-grid">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={preview} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => {
                              const newPreviews = imagePreviews.filter((_, i) => i !== index);
                              const previewToRemove = imagePreviews[index];
                              if (typeof previewToRemove === 'string' && previewToRemove.startsWith('http')) {
                                setExistingImageUrls(existingImageUrls.filter(url => url !== previewToRemove));
                              } else {
                                const urlCount = imagePreviews.slice(0, index).filter(p => typeof p === 'string' && p.startsWith('http')).length;
                                const fileIndex = index - urlCount;
                                setFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== fileIndex)
                                }));
                              }
                              setImagePreviews(newPreviews);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                      {imagePreviews.length > 0 && (
                        <div
                          className="image-preview-item add-more"
                          onClick={() => document.getElementById("productImages").click()}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="exchangeEligibility">Exchange or return eligibility</label>
                <select
                  id="exchangeEligibility"
                  value={formData.exchangeEligibility}
                  onChange={(e) => setFormData({ ...formData, exchangeEligibility: e.target.value })}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

            </form>
            
            {errors.submit && <div className="error-message" style={{ marginBottom: "16px", padding: "0 32px" }}>{errors.submit}</div>}
            
            <div className="form-actions">
              <button type="submit" form="product-form" className="btn-create" disabled={loading}>
                {loading ? (editingProduct ? "Updating..." : "Creating...") : (editingProduct ? "Update" : "Create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h2 className="delete-modal-title">Delete Product</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="delete-modal-body">
              <p className="delete-modal-message">
                Are you sure you really want to delete this Product '{productToDelete.name}'?
              </p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="btn-delete-confirm" 
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await deleteProduct(productToDelete._id);
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                    fetchProducts();
                    setToastMessage("Product Deleted Successfully");
                    setShowToast(true);
                    setTimeout(() => {
                      setShowToast(false);
                      setToastMessage("");
                    }, 3000);
                  } catch (error) {
                    console.error("Error deleting product:", error);
                    alert(error.response?.data?.message || "Failed to delete product. Please try again.");
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content">
            <div className="toast-check-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="toast-message">{toastMessage || "Product added Successfully"}</span>
            <button className="toast-close" onClick={() => {
              setShowToast(false);
              setToastMessage("");
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

