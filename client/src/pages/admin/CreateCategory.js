import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "antd";
import toast from "react-hot-toast";

const CreateCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/v1/category/get-category");
        if (data.success) {
          setCategories(data.category);
        }
      } catch (error) {
        //console.log(error);
        toast.error("Something went wrong in getting category");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/v1/category/create-category", {
        name,
      });
      if (data?.success) {
        toast.success(`${name} is created`);
        setCategories([...categories, data.category]);
        setName("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      //console.log(error);
      toast.error("Something went wrong in input form");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `/api/v1/category/update-category/${selected._id}`,
        { name }
      );
      if (data.success) {
        toast.success(`${name} is updated`);
        setCategories(
          categories.map((category) =>
            category._id === selected._id ? data.category : category
          )
        );
        setSelected(null);
        setName("");
        setVisible(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        `/api/v1/category/delete-category/${id}`
      );
      if (data.success) {
        toast.success(`Category is deleted`);
        setCategories(categories.filter((category) => category._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <h1>Manage Category</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter new category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>{category.name}</td>
              <td>
                <button
                  onClick={() => {
                    setVisible(true);
                    setSelected(category);
                    setName(category.name);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(category._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Enter new category"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      </Modal>
    </div>
  );
};

export default CreateCategory;