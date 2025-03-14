import { useState } from "react";
import PropTypes from "prop-types";
import { addCD } from "../services/cdService";

const AddCD = ({ onAdd }) => {
  const [form, setForm] = useState({ title: "", artist: "", year: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.artist || !form.year) return;

    await addCD(form);
    onAdd();
    setForm({ title: "", artist: "", year: "" });
  };

  return (
    <div className="container">
      <h2>Ajouter un CD ➕</h2>
      <form onSubmit={handleSubmit}>
        <input id="cd-title" type="text" name="title" placeholder="Titre du CD" value={form.title} onChange={handleChange} required />
        <input id="cd-artist" type="text" name="artist" placeholder="Artiste" value={form.artist} onChange={handleChange} required />
        <input id="cd-year" type="number" name="year" placeholder="Année" value={form.year} onChange={handleChange} required />
        <button id="add-cd" type="submit">Ajouter</button>
      </form>
    </div>
  );
};

AddCD.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default AddCD;