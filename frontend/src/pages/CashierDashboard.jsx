import { useEffect, useState, useRef } from "react";
import {
  searchCashierProducts,
  checkoutSale,
  getCashierSales,
  stockIn,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  FiMenu,
  FiLogOut,
  FiShoppingCart,
  FiCreditCard,
  FiX,
  FiPackage,
} from "react-icons/fi";

export default function CashierDashboard() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockRemarks, setStockRemarks] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================
  const loadProducts = async () => {
    try {
      const data = await searchCashierProducts(search);
      setProducts(data.items || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  // ==========================================================
  // LOAD SALES
  // ==========================================================
  const loadSales = async () => {
    try {
      const data = await getCashierSales();
      setSales(data.items || []);
    } catch (error) {
      console.error("Failed to load sales:", error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // ==========================================================
  // CART
  // ==========================================================
  const addToCart = (product) => {
    const existing = cart.find(
      (item) => item.product_id === product.id
    );

    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? {
              ...item,
              quantity: Math.min(
                item.quantity + 1,
                product.current_stock
              ),
            }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.product_name,
          price: Number(product.selling_price),
          quantity: 1,
          stock: product.current_stock,
        },
      ]);
    }
  };

  const increaseQty = (productId) => {
    setCart(
      cart.map((item) => {
        if (item.product_id === productId) {
          if (item.quantity >= item.stock) return item;
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const decreaseQty = (productId) => {
    setCart(
      cart
        .map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCart(cart.filter((i) => i.product_id !== productId));
  };

  // ==========================================================
  // TOTALS
  // ==========================================================
  const totalItems = cart.length;

  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ==========================================================
  // CHECKOUT
  // ==========================================================
  const handleCheckout = async () => {
    if (!cart.length) {
      alert("Cart is empty.");
      return;
    }

    try {
      setLoading(true);

      const response = await checkoutSale({
        customer_id: null,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });

      alert(`Sale #${response.sale_id} completed successfully.`);

      setCart([]);
      await loadProducts();
      await loadSales();
    } catch (error) {
      alert(error.response?.data?.detail || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };
  const handleStockIn = async () => {
    if (!stockProductId) {
      alert("Select a product");
      return;
    }

    if (!stockQuantity || Number(stockQuantity) <= 0) {
      alert("Enter valid quantity");
      return;
    }

    try {
      setStockLoading(true);

      await stockIn({
        product_id: Number(stockProductId),
        quantity: Number(stockQuantity),
        remarks: stockRemarks,
      });

      alert("Stock added successfully");

      setStockProductId("");
      setStockQuantity("");
      setStockRemarks("");

      setStockInOpen(false);

      await loadProducts();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Stock in failed"
      );
    } finally {
      setStockLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-10 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Cashier Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Point of Sale & Billing Management
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="
    relative
    w-12
    h-12
    rounded-xl
    bg-white
    shadow-md
    border
    border-gray-200
    flex
    items-center
    justify-center
  "
          >
            {totalQuantity > 0 && (
              <span
                className="
      absolute
      -top-1
      -right-1
      bg-red-500
      text-white
      text-xs
      w-5
      h-5
      rounded-full
      flex
      items-center
      justify-center
    "
              >
                {totalQuantity}
              </span>
            )}
            {menuOpen ? (
              <FiX size={22} />
            ) : (
              <FiMenu size={22} />
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">

              <button
                onClick={() => {
                  setCartOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-blue-50 text-blue-600"
              >
                <FiShoppingCart />
                Cart ({totalQuantity})
              </button>

              <button
                onClick={() => {
                  setStockInOpen(true);
                  setMenuOpen(false);
                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-5
                  py-4
                  hover:bg-green-50
                  text-green-600
                "
              >
                <FiPackage />
                Stock In
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 text-red-600"
              >
                <FiLogOut />
                Logout
              </button>

            </div>
          )}
        </div>
      </div>
      <div className="mb-8">
        <div
          className="
      relative
      overflow-hidden
      rounded-3xl
      bg-gradient-to-r
      from-indigo-600
      via-blue-600
      to-cyan-500
      p-8
      text-white
      shadow-xl
    "
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">
              Welcome Cashier 👋
            </h2>

            <p className="mt-2 text-blue-100">
              Process sales, manage carts,
              complete checkouts, and track
              recent transactions efficiently.
            </p>
          </div>

          <div className="absolute right-0 top-0 h-full w-64 bg-white/10 blur-3xl" />
        </div>
      </div>

      <div>

        {/* PRODUCTS */}
        <div className="lg:col-span-8
          bg-white
          rounded-3xl
          p-6
          shadow-sm
          border
          border-gray-100">
          <h2 className="text-xl font-bold mb-4">
            Products
          </h2>

          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
w-full
rounded-2xl
border
border-gray-200
bg-gray-50
px-4
py-3
mb-5
focus:outline-none
focus:ring-2
focus:ring-indigo-500
"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            {products.map((product) => (
              <div
                key={product.id}
                className="
bg-white
rounded-2xl
border
border-gray-100
shadow-sm
p-4
hover:shadow-lg
hover:-translate-y-1
transition
"
              >
                <h3 className="font-semibold">
                  {product.product_name}
                </h3>

                <p className="text-gray-600">
                  SKU: {product.sku || "-"}
                </p>

                <p className="font-bold mt-2">
                  ₹{product.selling_price}
                </p>

                <p className="text-sm text-gray-500">
                  Stock: {product.current_stock}
                </p>

                <button
                  disabled={product.current_stock <= 0}
                  onClick={() => addToCart(product)}
                  className="w-full mt-3 bg-gradient-to-r
from-indigo-600
to-blue-600
hover:from-indigo-700
hover:to-blue-700
text-white py-2 
rounded disabled:bg-gray-400"
                >
                  Add To Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* RECENT SALES */}
      {/* ================================================= */}

      <div className="mt-10">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Recent Sales
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Latest completed transactions.
              </p>
            </div>
          </div>

          {sales.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No sales available.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sales.slice(0, 5).map((sale) => (
                <div
                  key={sale.sale_id}
                  className="
              rounded-2xl
              border
              border-gray-100
              p-4
              hover:shadow-md
              transition
              bg-gray-50
            "
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800">
                      Sale #{sale.sale_id}
                    </h3>

                    <span
                      className="
                  text-xs
                  px-2
                  py-1
                  rounded-full
                  bg-blue-100
                  text-blue-700
                "
                    >
                      {sale.payment_method}
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-green-600 mt-3">
                    ₹{sale.total_amount}
                  </p>

                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(
                      sale.sale_date
                    ).toLocaleString()} (UTC)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 max-h-[85vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold">
                  Shopping Cart
                </h2>

                <p className="text-sm text-gray-500">
                  {totalQuantity} items selected
                </p>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <FiX size={22} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No items added.
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0">

                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                    >
                      <div className="flex justify-between">
                        <strong>{item.product_name}</strong>

                        <button
                          onClick={() =>
                            removeItem(item.product_id)
                          }
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      </div>

                      <p>₹{item.price}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            decreaseQty(item.product_id)
                          }
                          className="bg-red-500 text-white px-2 rounded"
                        >
                          -
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() =>
                            increaseQty(item.product_id)
                          }
                          className="bg-green-500 text-white px-2 rounded"
                        >
                          +
                        </button>
                      </div>

                      <p className="mt-2 font-semibold">
                        ₹{(
                          item.price * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}

                </div>

                <div className="border-t mt-5 pt-5">

                  <div className="flex justify-between">
                    <span>Items</span>
                    <span>{totalItems}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span>{totalQuantity}</span>
                  </div>

                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>

                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="w-full border rounded-lg p-2 mt-4"
                  >
                    <option value="CASH">CASH</option>
                    <option value="CARD">CARD</option>
                    <option value="UPI">UPI</option>
                  </select>

                  <button
                    disabled={loading}
                    onClick={handleCheckout}
                    className="
                w-full
                mt-4
                bg-gradient-to-r
                from-green-600
                to-emerald-600
                hover:from-green-700
                hover:to-emerald-700
                text-white
                py-3
                rounded-lg
              "
                  >
                    {loading
                      ? "Processing..."
                      : "Checkout"}
                  </button>

                </div>
              </>
            )}
          </div>
        </div>
      )}
      {stockInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold">
                Stock In
              </h2>

              <button
                onClick={() => setStockInOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <label className="block mb-2 font-medium">
                  Product
                </label>

                <select
                  value={stockProductId}
                  onChange={(e) =>
                    setStockProductId(e.target.value)
                  }
                  className="w-full border rounded-xl p-3"
                >
                  <option value="">
                    Select Product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={stockQuantity}
                  onChange={(e) =>
                    setStockQuantity(e.target.value)
                  }
                  className="w-full border rounded-xl p-3"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Remarks
                </label>

                <textarea
                  value={stockRemarks}
                  onChange={(e) =>
                    setStockRemarks(e.target.value)
                  }
                  rows={3}
                  className="w-full border rounded-xl p-3"
                  placeholder="Optional remarks"
                />
              </div>

              <button
                disabled={stockLoading}
                onClick={handleStockIn}
                className="
            w-full
            py-3
            rounded-xl
            text-white
            bg-gradient-to-r
            from-green-600
            to-emerald-600
            hover:from-green-700
            hover:to-emerald-700
          "
              >
                {stockLoading
                  ? "Saving..."
                  : "Add Stock"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}