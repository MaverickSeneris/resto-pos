import { useState, useEffect } from "react";
import { sampleMenu } from "../data/sampleMenu";

export default function ProductManagement() {
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem("menu");
    if (saved && JSON.parse(saved).length > 0) {
      return JSON.parse(saved);
    } else {
      localStorage.setItem("menu", JSON.stringify(sampleMenu));
      return sampleMenu;
    }
  });
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    if (saved) return JSON.parse(saved);

    const uniqueCategories = [
      ...new Set(sampleMenu.map((item) => item.category)),
    ];
    localStorage.setItem("categories", JSON.stringify(uniqueCategories));
    return uniqueCategories;
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const [newProduct, setNewProduct] = useState(() => ({
    name: "",
    price: "",
    category: localStorage.getItem("categories")
      ? JSON.parse(localStorage.getItem("categories"))[0] || ""
      : "Meals",
  }));
  const [selectedMonth, setSelectedMonth] = useState(null);


  // Save menu and categories to localStorage
  useEffect(() => {
    localStorage.setItem("menu", JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const handleAdd = () => {
    const { name, price, category } = newProduct;

    if (!name.trim() || !price) return;

    if (menu.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      alert("⚠️ Product already exists.");
      return;
    }

    const updatedMenu = [
      ...menu,
      {
        ...newProduct,
        id: Date.now(),
        price: parseFloat(price) || 0,
      },
    ];

    setMenu(updatedMenu);

    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }

    setNewProduct({ name: "", price: "", category: "Meals" });
  };

  const handleReset = () => {
    const confirmPwd = prompt("Enter admin password to reset:");
    if (confirmPwd !== import.meta.env.VITE_ADMIN_PASSWORD) {
      alert("❌ Wrong password. Reset canceled.");
      return;
    }

    if (!confirm("Are you sure you want to reset the entire menu?")) return;

    setMenu([]);
    alert("✅ Menu has been reset.");
  };

  const handleDeleteCategory = (cat) => {
    if (!confirm(`Delete category "${cat}" and all its items?`)) return;

    const updatedMenu = menu.filter((item) => item.category !== cat);
    const updatedCategories = categories.filter((c) => c !== cat);

    setMenu(updatedMenu);
    setCategories(updatedCategories);
    setSelectedCategory("All");

    alert(`✅ "${cat}" deleted.`);
  };

  const handleResetToDefault = () => {
    const confirmPwd = prompt("Enter admin password to restore default menu:");
    if (confirmPwd !== import.meta.env.VITE_ADMIN_PASSWORD) {
      alert("❌ Wrong password. Reset canceled.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to restore the default Chicken Haus menu? This will overwrite your current one."
      )
    )
      return;

    const uniqueCategories = [
      ...new Set(sampleMenu.map((item) => item.category)),
    ];

    setMenu(sampleMenu);
    setCategories(uniqueCategories);

    localStorage.setItem("menu", JSON.stringify(sampleMenu));
    localStorage.setItem("categories", JSON.stringify(uniqueCategories));

    alert("🍗 Default Chicken Haus menu restored.");
  };

  return (
    // <div className="p-4">
    <div className="p-4 flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        {/* everything before Add Product section goes here */}
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Product List</h2>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="ml-2 w-15 h-8 bg-red-600 font-bold text-white px-3 py-1 rounded text-[0.5rem] hover:bg-red-700"
            >
              Reset Menu
            </button>
            <button
              onClick={handleResetToDefault}
              className="w-15 h-8 bg-green-400 font-bold text-white px-3 py-1 rounded text-[0.5rem] hover:bg-yellow-700"
            >
              Default Menu
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
        />

        {/* Category Controls */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Categories</h3>
            {!isDeletingCategory ? (
              <button
                onClick={() => {
                  const pwd = prompt(
                    "Enter admin password to delete category:"
                  );
                  if (pwd === import.meta.env.VITE_ADMIN_PASSWORD) {
                    setIsDeletingCategory(true);
                  } else {
                    alert("❌ Wrong password.");
                  }
                }}
                className="text-xs text-green-600 hover:underline"
              >
                Manage Categories
              </button>
            ) : (
              <button
                onClick={() => setIsDeletingCategory(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                ✖ Cancel
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {[...categories].map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  isDeletingCategory
                    ? handleDeleteCategory(cat)
                    : setSelectedCategory(cat)
                }
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition
          ${
            selectedCategory === cat && !isDeletingCategory
              ? "bg-blue-600 text-white"
              : isDeletingCategory
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-white text-black hover:bg-gray-100"
          }`}
              >
                {cat}
                {isDeletingCategory && cat !== "All" && <span>🗑</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product List */}
      <ul className="mb-6">
        {menu
          .filter((item) => {
            const matchesSearch = item.name
              .toLowerCase()
              .includes(search.toLowerCase());
            const matchesCategory =
              selectedCategory === "All" || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
          })
          .map((item) => (
            <li
              key={item.id}
              className="mb-2 flex justify-between items-center border p-2 rounded bg-white shadow"
            >
              <div>
                <span className="font-semibold">{item.name}</span> - ₱
                {item.price} ({item.category})
              </div>
              <button
                onClick={() => {
                  const pwd = prompt("Enter admin password to delete:");
                  if (pwd !== import.meta.env.VITE_ADMIN_PASSWORD) {
                    alert("❌ Wrong password.");
                    return;
                  }
                  if (
                    !confirm(`Are you sure you want to delete "${item.name}"?`)
                  )
                    return;

                  const updatedMenu = menu.filter((m) => m.id !== item.id);
                  setMenu(updatedMenu);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </li>
          ))}
      </ul>

      {/* Add Product */}
      <div className="md:w-[300px] md:sticky md:top-20 fixed bottom-0 left-0 w-full bg-white border-t md:border md:rounded-lg p-4 shadow-lg z-30">
        <h3 className="text-lg font-semibold mb-2 hidden md:block">
          ➕ Add Product
        </h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Product name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct((prev) => ({ ...prev, name: e.target.value }))
            }
            className="border p-2 w-full"
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct((prev) => ({ ...prev, price: e.target.value }))
            }
            className="border p-2 w-full"
          />
          <select
            value={newProduct.category}
            onChange={(e) => {
              if (e.target.value === "__custom") {
                const newCat = prompt("Enter new category:");
                if (newCat) {
                  const updatedCategories = [
                    ...new Set([...categories, newCat]),
                  ];
                  setCategories(updatedCategories);
                  localStorage.setItem(
                    "categories",
                    JSON.stringify(updatedCategories)
                  );
                  setNewProduct((prev) => ({ ...prev, category: newCat }));
                }
              } else {
                setNewProduct((prev) => ({
                  ...prev,
                  category: e.target.value,
                }));
              }
            }}
            className="border p-2 w-full"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__custom">➕ Add New Category</option>
          </select>

          <button
            onClick={handleAdd}
            className="bg-green-400 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
