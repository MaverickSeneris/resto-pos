import { useState, useEffect } from "react";

export default function ProductManagement() {
  const [menu, setMenu] = useState(() =>
    JSON.parse(localStorage.getItem("menu") || "[]")
  );

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : ["Meals", "Drinks", "Ala Carte"];
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
    if (confirmPwd !== "admin123") {
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

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Product List</h2>
        <button
          onClick={handleReset}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          🧹 Reset Menu
        </button>
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
                const pwd = prompt("Enter admin password to delete category:");
                if (pwd === "admin123") {
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
                  if (pwd !== "admin123") {
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
                // Update categories
                const updatedCategories = [...new Set([...categories, newCat])];
                setCategories(updatedCategories);
                localStorage.setItem(
                  "categories",
                  JSON.stringify(updatedCategories)
                );

                // Set selected new category
                setNewProduct((prev) => ({ ...prev, category: newCat }));
              }
            } else {
              setNewProduct((prev) => ({ ...prev, category: e.target.value }));
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
          className="bg-green-400 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>
    </div>
  );
}
