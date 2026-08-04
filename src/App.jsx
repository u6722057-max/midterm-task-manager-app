import { useMemo, useState } from "react";
import { products, categories } from "./assets/data";
import "./App.css";
import {
  Cable,
  Headphones,
  Laptop,
  Mouse,
  Settings,
  TabletSmartphone,
} from "lucide-react";

function CategoryIcon(category) {
  switch (category.icon) {
    case "mouse":
      return <Mouse className="h-5 w-5 text-blue-600" />;
    case "laptop":
      return <Laptop className="h-5 w-5 text-blue-600" />;
    case "tablet-smartphone":
      return <TabletSmartphone className="h-5 w-5 text-blue-600" />;
    case "headphones":
      return <Headphones className="h-5 w-5 text-blue-600" />;
    case "cable":
      return <Cable className="h-5 w-5 text-blue-600" />;
    default:
      return <Settings className="h-5 w-5 text-blue-600" />;
  }
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [amount, setAmount] = useState("0");
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [remainingInventory, setRemainingInventory] = useState(() =>
    Object.fromEntries(products.map((product) => [product.id, product.inventory])),
  );
  const [errorMessage, setErrorMessage] = useState("");

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter(
      (product) => product.category === Number(selectedCategory),
    );
  }, [selectedCategory]);

  const selectedProduct = products.find(
    (product) => product.id === Number(selectedProductId),
  );
  const numericAmount = Number(amount);
  const canAdd =
    selectedProduct && Number.isInteger(numericAmount) && numericAmount > 0;

  const grandTotal = purchasedItems.reduce(
    (total, item) => total + item.total,
    0,
  );

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setSelectedProductId("");
    setAmount("0");
    setErrorMessage("");
  };

  const handleProductChange = (event) => {
    setSelectedProductId(event.target.value);
    setAmount("0");
    setErrorMessage("");
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
    setErrorMessage("");
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Please enter a valid amount");
      return;
    }

    const availableAmount = remainingInventory[selectedProduct.id];
    if (numericAmount > availableAmount) {
      setErrorMessage(`Not enough item, only ${availableAmount} left`);
      return;
    }

    const subtotal =
      selectedProduct.sellPrice *
      (1 - selectedProduct.discount / 100) *
      numericAmount;

    setPurchasedItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === selectedProduct.id,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === selectedProduct.id
            ? {
                ...item,
                amount: item.amount + numericAmount,
                total: item.total + subtotal,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...selectedProduct,
          amount: numericAmount,
          total: subtotal,
        },
      ];
    });

    setRemainingInventory((inventory) => ({
      ...inventory,
      [selectedProduct.id]: availableAmount - numericAmount,
    }));
    setErrorMessage("");
  };

  const displayNumber = (number) =>
    Number.isInteger(number) ? number : Number(number.toFixed(2));

  return (
    <main className="page-shell">
      <section className="pos-card" aria-label="Point of Sale">
        <div className="form-grid">
          <label htmlFor="category-select">Select Category:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="all">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>

          <span className="form-spacer" aria-hidden="true" />

          <label htmlFor="product-select">Select Product:</label>
          <select
            id="product-select"
            value={selectedProductId}
            onChange={handleProductChange}
          >
            <option value="">Please Select An Item</option>
            {filteredProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>

          <label htmlFor="amount-input" className="amount-label">
            Amount:
          </label>
          <input
            id="amount-input"
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={handleAmountChange}
            disabled={!selectedProduct}
          />
          <button type="button" onClick={handleAddItem} disabled={!canAdd}>
            Add Item
          </button>
          <p className="error-message" role="alert" aria-live="polite">
            {errorMessage}
          </p>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Amount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchasedItems.map((item, index) => {
                const category = categories.find(
                  (entry) => entry.id === item.category,
                );

                return (
                  <tr key={item.id}>
                    <td>{index}</td>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>
                      <span
                        className="category-icon"
                        title={category?.title}
                        aria-label={category?.title}
                      >
                        {CategoryIcon(category ?? {})}
                      </span>
                    </td>
                    <td>{item.sellPrice}</td>
                    <td>{item.discount}%</td>
                    <td>{item.amount}</td>
                    <td>{displayNumber(item.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="grand-total">Total: {displayNumber(grandTotal)}</p>
      </section>
    </main>
  );
}
