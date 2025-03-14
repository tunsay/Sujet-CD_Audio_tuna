import PropTypes from "prop-types";

const CDItem = ({ cd, onDelete }) => {
  return (
    <li className="cd-item">
      <span>{cd.title} - {cd.artist} ({cd.year})</span>
      <button className="delete-cd" onClick={() => onDelete(cd.id)}>🗑 Supprimer</button>
    </li>
  );
};

CDItem.propTypes = {
  cd: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CDItem;